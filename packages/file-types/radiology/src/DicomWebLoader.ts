/* eslint-disable no-plusplus */
import { VolumeLoader } from './VolumeLoader.js';
import { type DicomImage, toVolume } from './dicom.js';
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

type DicomJson = Record<string, { vr: string; Value?: unknown[] } | undefined>;

function getNumbers(instance: DicomJson, tag: string) {
  return instance[tag]?.Value?.map(Number);
}

function getNumber(instance: DicomJson, tag: string) {
  return getNumbers(instance, tag)?.[0];
}

function getString(instance: DicomJson, tag: string) {
  const value = instance[tag]?.Value?.[0];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Read the attributes of an instance from DICOM JSON (DICOM PS3.18 F.2).
 */
export function fromDicomJson(instance: DicomJson): DicomImage & { sopInstanceUid?: string } {
  return {
    sopInstanceUid: getString(instance, '00080018'),
    modality: getString(instance, '00080060'),
    seriesDescription: getString(instance, '0008103E'),
    sliceThickness: getNumber(instance, '00180050'),
    position: getNumbers(instance, '00200032') ?? [],
    orientation: getNumbers(instance, '00200037') ?? [],
    samplesPerPixel: getNumber(instance, '00280002') ?? 1,
    photometricInterpretation: getString(instance, '00280004') ?? 'MONOCHROME2',
    numberOfFrames: getNumber(instance, '00280008') ?? 1,
    rows: getNumber(instance, '00280010') ?? 0,
    columns: getNumber(instance, '00280011') ?? 0,
    pixelSpacing: getNumbers(instance, '00280030') ?? [],
    bitsAllocated: getNumber(instance, '00280100') ?? 16,
    bitsStored: getNumber(instance, '00280101') ?? 16,
    pixelRepresentation: getNumber(instance, '00280103') ?? 0,
    windowCenter: getNumber(instance, '00281050'),
    windowWidth: getNumber(instance, '00281051'),
    intercept: getNumber(instance, '00281052') ?? 0,
    slope: getNumber(instance, '00281053') ?? 1,
  };
}

function lastIndexOf(bytes: Uint8Array, sequence: Uint8Array) {
  for (let i = bytes.length - sequence.length; i >= 0; i--) {
    let j = 0;
    while (j < sequence.length && bytes[i + j] === sequence[j]) j++;
    if (j === sequence.length) return i;
  }
  return -1;
}

/**
 * Get the pixel data of a frame from a WADO-RS response, which usually wraps it
 * in a multipart/related body, along with its transfer syntax.
 */
export function extractFrame(body: ArrayBuffer, contentType: string) {
  let bytes = new Uint8Array(body);
  let headers = `Content-Type: ${contentType}`;
  if (contentType.startsWith('multipart/related')) {
    // The frame follows the headers of the first part and ends before the closing delimiter.
    const headersEnd = bytes.findIndex((_, i) => (
      bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10
    ));
    headers = new TextDecoder().decode(bytes.subarray(0, headersEnd));
    // Read the delimiter from the first line, since some servers omit the boundary parameter.
    const delimiter = headers.split('\r\n')[0];
    const end = lastIndexOf(bytes, new TextEncoder().encode(`\r\n${delimiter}`));
    bytes = bytes.subarray(headersEnd + 4, end > headersEnd ? end : undefined);
  }
  const mediaType = /content-type:\s*([^;\s]+)/i.exec(headers)?.[1]?.toLowerCase() ?? '';
  const transferSyntax = /transfer-syntax="?([\d.]+)/i.exec(headers)?.[1]
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
    const images = (await res.json() as DicomJson[]).map(fromDicomJson);

    return toVolume(images, async (image) => {
      const frameUrl = `${seriesUrl}/instances/${image.sopInstanceUid}/frames/1`;
      let frameRes = await fetch(frameUrl, withAccept(requestInit, FRAME_ACCEPT));
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
