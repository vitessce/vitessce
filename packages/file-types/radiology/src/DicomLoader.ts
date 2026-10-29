/* eslint-disable no-plusplus */
import dicomParser, { type DataSet } from 'dicom-parser';
import { VolumeLoader } from './VolumeLoader.js';
import { type DicomImage, toVolume } from './dicom.js';
import {
  UNCOMPRESSED_TRANSFER_SYNTAXES,
  isSupportedTransferSyntax,
  decodeFrame,
} from './codecs.js';
import type { Volume } from './volume.js';

const PIXEL_DATA = 'x7fe00010';
// Headers are usually a few kilobytes. Try small reads before reading the whole file.
const HEADER_READ_SIZES = [16_384, 262_144];

/**
 * @param range First and last byte to read. Without a last byte, reads to the end.
 */
async function fetchBytes(url: string, requestInit?: RequestInit, range?: [number, number?]) {
  const headers = new Headers(requestInit?.headers);
  if (range) {
    headers.set('Range', `bytes=${range[0]}-${range[1] ?? ''}`);
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

function fromDataSet(dataSet: DataSet, url: string): DicomImage & { transferSyntax: string } {
  const transferSyntax = dataSet.string('x00020010') ?? '';
  if (!isSupportedTransferSyntax(transferSyntax)) {
    throw new Error(`${url} uses transfer syntax ${transferSyntax}, which is not supported.`);
  }
  if (!dataSet.elements[PIXEL_DATA]) {
    throw new Error(`${url} has no pixel data.`);
  }
  return {
    transferSyntax,
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
 * Join the fragments of encapsulated (compressed) pixel data: a sequence of items,
 * starting with a basic offset table, ended by a sequence delimiter.
 * Assumes one frame per file.
 */
export function readFragments(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fragments: Uint8Array[] = [];
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    // Tags (FFFE,E000) and (FFFE,E0DD) read as little-endian 32-bit values.
    const tag = view.getUint32(offset, true);
    const length = view.getUint32(offset + 4, true);
    offset += 8;
    if (tag === 0xE0DDFFFE) break;
    fragments.push(bytes.subarray(offset, offset + length));
    offset += length;
  }
  // Skip the basic offset table.
  const [, ...frameFragments] = fragments;
  if (frameFragments.length === 1) {
    return frameFragments[0];
  }
  const frame = new Uint8Array(frameFragments.reduce((sum, f) => sum + f.length, 0));
  frameFragments.reduce((position, f) => {
    frame.set(f, position);
    return position + f.length;
  }, 0);
  return frame;
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
      const isCompressed = !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(image.transferSyntax);
      const start = image.pixelDataOffset;
      // The length of compressed pixel data is not known up front, so read to the end.
      const end = isCompressed
        ? undefined
        : start + image.rows * image.columns * (image.bitsAllocated / 8);
      let bytes: Uint8Array;
      if (image.file) {
        bytes = new Uint8Array(image.file).subarray(start, end);
      } else {
        const range: [number, number?] = [start, end && end - 1];
        const { buffer, isWholeFile } = await fetchBytes(image.url, requestInit, range);
        bytes = isWholeFile ? new Uint8Array(buffer).subarray(start, end) : new Uint8Array(buffer);
      }
      return decodeFrame(image.transferSyntax, isCompressed ? readFragments(bytes) : bytes, image);
    });
  }
}
