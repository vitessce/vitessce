import dicomParser, { type DataSet } from 'dicom-parser';
import { VolumeLoader } from './VolumeLoader.js';
import { type DicomImage, toVolume } from './dicom.js';
import type { Volume } from './volume.js';

const UNCOMPRESSED_TRANSFER_SYNTAXES = [
  '1.2.840.10008.1.2', // Implicit VR Little Endian
  '1.2.840.10008.1.2.1', // Explicit VR Little Endian
];
const PIXEL_DATA = 'x7fe00010';
// Headers are usually a few kilobytes. Try small reads before reading the whole file.
const HEADER_READ_SIZES = [16_384, 262_144];

async function fetchBytes(url: string, requestInit?: RequestInit, range?: [number, number]) {
  const headers = new Headers(requestInit?.headers);
  if (range) {
    headers.set('Range', `bytes=${range[0]}-${range[1]}`);
  }
  const res = await fetch(url, { ...requestInit, headers });
  if (!res.ok) {
    throw new Error(`DICOM file failed to load: ${res.status} from ${res.url}`);
  }
  // A server that ignores the Range header sends the whole file.
  return { buffer: await res.arrayBuffer(), isWholeFile: res.status !== 206 };
}

function parse(buffer: ArrayBuffer) {
  return dicomParser.parseDicom(new Uint8Array(buffer), { untilTag: PIXEL_DATA });
}

/**
 * Read a file's header, up to and including the start of its pixel data.
 * Returns the whole file too when the server sent it.
 */
async function readHeader(
  url: string,
  requestInit?: RequestInit,
  readSizes = HEADER_READ_SIZES,
): Promise<{ dataSet: DataSet; file?: ArrayBuffer }> {
  const [size, ...largerSizes] = readSizes;
  if (size === undefined) {
    const { buffer } = await fetchBytes(url, requestInit);
    return { dataSet: parse(buffer), file: buffer };
  }
  const { buffer, isWholeFile } = await fetchBytes(url, requestInit, [0, size - 1]);
  if (isWholeFile) {
    return { dataSet: parse(buffer), file: buffer };
  }
  try {
    const dataSet = parse(buffer);
    if (dataSet.elements[PIXEL_DATA]) {
      return { dataSet };
    }
  } catch {
    // The header continues past the bytes read so far.
  }
  return readHeader(url, requestInit, largerSizes);
}

function getNumbers(dataSet: DataSet, tag: string) {
  return dataSet.string(tag)?.split('\\').map(Number);
}

function fromDataSet(dataSet: DataSet, url: string): DicomImage {
  const transferSyntax = dataSet.string('x00020010') ?? '';
  if (!UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax)) {
    throw new Error(`${url} has compressed pixel data (${transferSyntax}), which is not supported yet.`);
  }
  if (!dataSet.elements[PIXEL_DATA]) {
    throw new Error(`${url} has no pixel data.`);
  }
  return {
    modality: dataSet.string('x00080060'),
    seriesDescription: dataSet.string('x0008103e'),
    sliceThickness: getNumbers(dataSet, 'x00180050')?.[0],
    position: getNumbers(dataSet, 'x00200032') ?? [],
    orientation: getNumbers(dataSet, 'x00200037') ?? [],
    samplesPerPixel: dataSet.uint16('x00280002') ?? 1,
    photometricInterpretation: dataSet.string('x00280004') ?? 'MONOCHROME2',
    numberOfFrames: getNumbers(dataSet, 'x00280008')?.[0] ?? 1,
    rows: dataSet.uint16('x00280010') ?? 0,
    columns: dataSet.uint16('x00280011') ?? 0,
    pixelSpacing: getNumbers(dataSet, 'x00280030') ?? [],
    bitsAllocated: dataSet.uint16('x00280100') ?? 16,
    bitsStored: dataSet.uint16('x00280101') ?? 16,
    pixelRepresentation: dataSet.uint16('x00280103') ?? 0,
    windowCenter: getNumbers(dataSet, 'x00281050')?.[0],
    windowWidth: getNumbers(dataSet, 'x00281051')?.[0],
    intercept: getNumbers(dataSet, 'x00281052')?.[0] ?? 0,
    slope: getNumbers(dataSet, 'x00281053')?.[0] ?? 1,
  };
}

/**
 * Loads a series of DICOM Part 10 (.dcm) files, one image per file.
 * Only headers are read up front; pixel data is read per slice with range requests.
 */
export class DicomLoader extends VolumeLoader {
  async loadVolume(): Promise<Volume> {
    const { requestInit } = this;
    const urls: string[] = this.options?.urls ?? [];
    if (urls.length === 0) {
      throw new Error('The image.dicom file type requires options.urls.');
    }
    const images = await Promise.all(urls.map(async (url) => {
      const { dataSet, file } = await readHeader(url, requestInit);
      return {
        ...fromDataSet(dataSet, url),
        url,
        file,
        pixelDataOffset: dataSet.elements[PIXEL_DATA].dataOffset,
      };
    }));

    return toVolume(images, async (image) => {
      const start = image.pixelDataOffset;
      const end = start + image.rows * image.columns * (image.bitsAllocated / 8);
      if (image.file) {
        return image.file.slice(start, end);
      }
      const { buffer, isWholeFile } = await fetchBytes(image.url, requestInit, [start, end - 1]);
      return isWholeFile ? buffer.slice(start, end) : buffer;
    });
  }
}
