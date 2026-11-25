import { VolumeLoader } from './VolumeLoader.js';
import {
  type DicomAttributes,
  readImage,
  readFrames,
  toVolume,
} from './dicom.js';
import { decodeFrame } from './codecs.js';
import type { Volume } from './volume.js';

// Prefer frames transcoded to Explicit VR Little Endian, which need no decoding.
const FRAME_ACCEPT = 'multipart/related; type="application/octet-stream"; transfer-syntax=1.2.840.10008.1.2.1';
// For servers that cannot transcode: accept frames as stored.
const FRAME_ACCEPT_STORED = 'multipart/related; type="application/octet-stream"; transfer-syntax=*';

// Transfer syntaxes implied by part media types, for parts without a transfer-syntax parameter.
// Reference: DICOM PS3.18 Section 8.7.3
const MEDIA_TYPE_TRANSFER_SYNTAXES: Record<string, string> = {
  'application/octet-stream': '1.2.840.10008.1.2.1',
  'image/jls': '1.2.840.10008.1.2.4.80',
  'image/jp2': '1.2.840.10008.1.2.4.90',
  'image/jphc': '1.2.840.10008.1.2.4.201',
  'image/x-dicom-rle': '1.2.840.10008.1.2.5',
};

// Start-of-frame markers of JPEG processes, and their transfer syntaxes.
const JPEG_FRAME_TRANSFER_SYNTAXES: Record<number, string> = {
  0xC0: '1.2.840.10008.1.2.4.50', // Baseline
  0xC1: '1.2.840.10008.1.2.4.51', // Extended
  0xC3: '1.2.840.10008.1.2.4.70', // Lossless
};

/**
 * Get the transfer syntax of a JPEG frame from its start-of-frame marker,
 * since the image/jpeg media type is used for both lossy and lossless JPEG.
 */
export function getJpegTransferSyntax(bytes: Uint8Array) {
  // After the start-of-image marker, each segment has a marker and a 2-byte length.
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xFF) {
    const transferSyntax = JPEG_FRAME_TRANSFER_SYNTAXES[bytes[offset + 1]];
    if (transferSyntax) {
      return transferSyntax;
    }
    offset += 2 + bytes[offset + 2] * 256 + bytes[offset + 3];
  }
  return undefined;
}

type DicomJson = Record<string, { vr: string; Value?: unknown[] } | undefined>;

function toAttributes(instance: DicomJson): DicomAttributes {
  const values = (tag: string) => instance[tag]?.Value;
  return {
    string: (tag) => {
      const value = values(tag)?.[0];
      return typeof value === 'string' ? value : undefined;
    },
    numbers: tag => values(tag)?.map(Number),
    uint16: tag => values(tag)?.map(Number)[0],
    items: tag => values(tag)?.map(item => toAttributes(item as DicomJson)),
  };
}

/**
 * Read the frames of an instance from DICOM JSON (DICOM PS3.18 F.2).
 */
function readInstance(instance: DicomJson) {
  const attributes = toAttributes(instance);
  const sopInstanceUid = attributes.string('00080018');
  const image = { ...readImage(attributes), sopInstanceUid };
  return readFrames(attributes, image);
}

/**
 * Get the pixel data of a frame from a WADO-RS response, which usually wraps it
 * in a multipart/related body, along with its transfer syntax.
 */
export function extractFrame(body: ArrayBuffer, contentType: string) {
  let bytes = new Uint8Array(body);
  let headers = `Content-Type: ${contentType}`;
  if (contentType.startsWith('multipart/related')) {
    // Latin-1 decodes one character per byte, so string indexes are byte offsets.
    const text = new TextDecoder('latin1').decode(bytes);
    // The frame follows the headers of the first part and ends before the closing delimiter.
    const headersEnd = text.indexOf('\r\n\r\n');
    headers = text.slice(0, headersEnd);
    // Read the delimiter from the first line, since some servers omit the boundary parameter.
    const delimiter = headers.split('\r\n')[0];
    const end = text.lastIndexOf(`\r\n${delimiter}`);
    bytes = bytes.subarray(headersEnd + 4, end > headersEnd ? end : undefined);
  }
  const mediaType = /content-type:\s*([^;\s]+)/i.exec(headers)?.[1]?.toLowerCase() ?? '';
  const transferSyntax = /transfer-syntax="?([\d.]+)/i.exec(headers)?.[1]
    ?? (mediaType === 'image/jpeg' ? getJpegTransferSyntax(bytes) : undefined)
    ?? MEDIA_TYPE_TRANSFER_SYNTAXES[mediaType];
  if (!transferSyntax) {
    throw new Error(`The DICOMweb server returned frames as ${mediaType}, which is not supported.`);
  }
  return { bytes, transferSyntax };
}

function withAccept(requestInit: RequestInit | undefined, accept: string): RequestInit {
  const headers = new Headers(requestInit?.headers);
  headers.set('Accept', accept);
  return { ...requestInit, headers };
}

/**
 * Loads a DICOM series from a DICOMweb server.
 * The url is the series URL: <root>/studies/<StudyInstanceUID>/series/<SeriesInstanceUID>
 */
export class DicomWebLoader extends VolumeLoader {
  async loadVolume(): Promise<Volume> {
    const { url, requestInit } = this;
    if (!url) {
      throw new Error('The image.dicomweb file type requires a url.');
    }
    const seriesUrl = url.replace(/\/$/, '');
    const res = await fetch(`${seriesUrl}/metadata`, withAccept(requestInit, 'application/dicom+json'));
    if (!res.ok) {
      throw new Error(`DICOMweb series metadata failed to load: ${res.status} from ${res.url}`);
    }
    const images = (await res.json() as DicomJson[]).flatMap(readInstance);

    return toVolume(images, async (image) => {
      const frameUrl = `${seriesUrl}/instances/${image.sopInstanceUid}/frames/${image.frameIndex + 1}`;
      // Color frames are requested as stored: servers that transcode them may convert
      // YBR to RGB, while the metadata still says YBR.
      const accept = image.samplesPerPixel === 3 ? FRAME_ACCEPT_STORED : FRAME_ACCEPT;
      let frameRes = await fetch(frameUrl, withAccept(requestInit, accept));
      if (frameRes.status === 406) {
        frameRes = await fetch(frameUrl, withAccept(requestInit, FRAME_ACCEPT_STORED));
      }
      if (!frameRes.ok) {
        throw new Error(`DICOMweb frame failed to load: ${frameRes.status} from ${frameRes.url}`);
      }
      const { bytes, transferSyntax } = extractFrame(
        await frameRes.arrayBuffer(),
        frameRes.headers.get('Content-Type') ?? '',
      );
      return decodeFrame(transferSyntax, bytes, image);
    });
  }
}
