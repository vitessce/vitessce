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
// Headers are usually a few kilobytes, but multi-frame headers grow with the number of frames.
// Try small reads before reading the whole file.
const HEADER_READ_SIZES = [16_384, 262_144, 4_194_304];

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

// Functional group sequences of multi-frame images (DICOM PS3.3 C.7.6.16).
const PER_FRAME_GROUPS = 'x52009230';
const SHARED_GROUPS = 'x52009229';

/**
 * Get the first item of a functional group sequence for a frame.
 * A per-frame group takes precedence over the shared group.
 */
function getFunctionalGroup(dataSet: DataSet, frameIndex: number, sequenceTag: string) {
  const perFrame = dataSet.elements[PER_FRAME_GROUPS]?.items?.[frameIndex]?.dataSet;
  const shared = dataSet.elements[SHARED_GROUPS]?.items?.[0]?.dataSet;
  const groups = perFrame?.elements[sequenceTag] ? perFrame : shared;
  return groups?.elements[sequenceTag]?.items?.[0]?.dataSet;
}

/**
 * Split a multi-frame image into one image per frame, with the geometry and
 * rescaling of each frame from its functional groups (falling back to the
 * attributes of the whole image).
 */
function getFrames<T extends DicomImage & { transferSyntax: string }>(
  dataSet: DataSet, image: T, url: string,
) {
  if (image.numberOfFrames === 1) {
    return [{ ...image, frameIndex: 0 }];
  }
  if (!UNCOMPRESSED_TRANSFER_SYNTAXES.includes(image.transferSyntax)) {
    throw new Error(`${url} is a compressed multi-frame image, which is not supported yet.`);
  }
  if (!dataSet.elements[PER_FRAME_GROUPS]) {
    throw new Error(`${url} is a multi-frame image without per-frame positions, which is not supported.`);
  }
  return Array.from({ length: image.numberOfFrames }, (_, frameIndex) => {
    const position = getFunctionalGroup(dataSet, frameIndex, 'x00209113');
    const orientation = getFunctionalGroup(dataSet, frameIndex, 'x00209116');
    const measures = getFunctionalGroup(dataSet, frameIndex, 'x00289110');
    const rescale = getFunctionalGroup(dataSet, frameIndex, 'x00289145');
    const window = getFunctionalGroup(dataSet, frameIndex, 'x00289132');
    return {
      ...image,
      numberOfFrames: 1,
      frameIndex,
      position: (position && getNumbers(position, 'x00200032')) ?? image.position,
      orientation: (orientation && getNumbers(orientation, 'x00200037')) ?? image.orientation,
      pixelSpacing: (measures && getNumbers(measures, 'x00280030')) ?? image.pixelSpacing,
      sliceThickness: (measures && getNumbers(measures, 'x00180050')?.[0]) ?? image.sliceThickness,
      intercept: (rescale && getNumbers(rescale, 'x00281052')?.[0]) ?? image.intercept,
      slope: (rescale && getNumbers(rescale, 'x00281053')?.[0]) ?? image.slope,
      windowCenter: (window && getNumbers(window, 'x00281050')?.[0]) ?? image.windowCenter,
      windowWidth: (window && getNumbers(window, 'x00281051')?.[0]) ?? image.windowWidth,
    };
  });
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
 * Loads a series of DICOM Part 10 (.dcm) files: one image per file,
 * or one multi-frame image with a frame per slice.
 * Only headers are read up front; pixel data is read per slice with range requests.
 */
export class DicomLoader extends VolumeLoader {
  async loadVolume(): Promise<Volume> {
    const { requestInit } = this;
    const urls: string[] = this.options?.urls ?? [];
    if (urls.length === 0) {
      throw new Error('The image.dicom file type requires options.urls.');
    }
    const files = await Promise.all(urls.map(async (url) => {
      const { dataSet, file } = await readHeader(url, requestInit);
      const image = {
        ...fromDataSet(dataSet, url),
        url,
        file,
        pixelDataOffset: dataSet.elements[PIXEL_DATA].dataOffset,
      };
      return getFrames(dataSet, image, url);
    }));
    const images = files.flat();

    return toVolume(images, async (image) => {
      const isCompressed = !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(image.transferSyntax);
      const frameLength = image.rows * image.columns * (image.bitsAllocated / 8);
      const start = image.pixelDataOffset + image.frameIndex * frameLength;
      // The length of compressed pixel data is not known up front, so read to the end.
      const end = isCompressed ? undefined : start + frameLength;
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
