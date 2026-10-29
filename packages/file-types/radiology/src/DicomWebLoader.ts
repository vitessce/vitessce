import { VolumeLoader } from './VolumeLoader.js';
import { type DicomImage, toVolume } from './dicom.js';
import type { Volume } from './volume.js';

const UNCOMPRESSED_TRANSFER_SYNTAXES = [
  '1.2.840.10008.1.2', // Implicit VR Little Endian
  '1.2.840.10008.1.2.1', // Explicit VR Little Endian
];
// Ask the server to transcode frames to Explicit VR Little Endian.
const FRAME_ACCEPT = 'multipart/related; type="application/octet-stream"; transfer-syntax=1.2.840.10008.1.2.1';

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

/**
 * Get the pixel data of a frame from a WADO-RS response,
 * which wraps it in a multipart/related body.
 * Throws if the server did not return uncompressed pixel data.
 */
export function extractFrame(body: ArrayBuffer, contentType: string, frameLength: number) {
  let headers = `Content-Type: ${contentType}`;
  let dataStart = 0;
  if (contentType.startsWith('multipart/related')) {
    // The frame follows the headers of the first part.
    const bytes = new Uint8Array(body);
    const headersEnd = bytes.findIndex((_, i) => (
      bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10
    ));
    headers = new TextDecoder().decode(bytes.subarray(0, headersEnd));
    dataStart = headersEnd + 4;
  }
  const partType = /content-type:\s*([^;\s]+)/i.exec(headers)?.[1] ?? 'application/octet-stream';
  const transferSyntax = /transfer-syntax="?([\d.]+)/i.exec(headers)?.[1];
  if (partType !== 'application/octet-stream'
    || (transferSyntax && !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax))) {
    throw new Error(`The DICOMweb server returned compressed pixel data (${transferSyntax ?? partType}), which is not supported yet. Use a server that can transcode to uncompressed data.`);
  }
  if (body.byteLength < dataStart + frameLength) {
    throw new Error('The DICOMweb server returned an incomplete frame.');
  }
  return body.slice(dataStart, dataStart + frameLength);
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
      const frameRes = await fetch(frameUrl, withAccept(requestInit, FRAME_ACCEPT));
      if (!frameRes.ok) {
        throw new Error(`DICOMweb frame failed to load: ${frameRes.status} from ${frameRes.url}`);
      }
      const frameLength = image.rows * image.columns * (image.bitsAllocated / 8);
      return extractFrame(
        await frameRes.arrayBuffer(),
        frameRes.headers.get('Content-Type') ?? '',
        frameLength,
      );
    });
  }
}
