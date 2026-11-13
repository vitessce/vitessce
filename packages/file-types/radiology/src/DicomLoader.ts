/* eslint-disable no-plusplus */
import type { DataSet } from 'dicom-parser';
import { VolumeLoader } from './VolumeLoader.js';
import {
  type DicomAttributes,
  type DicomImage,
  readImage,
  readFrames,
  toVolume,
} from './dicom.js';
import {
  UNCOMPRESSED_TRANSFER_SYNTAXES,
  isSupportedTransferSyntax,
  decodeFrame,
} from './codecs.js';
import type { Volume } from './volume.js';

const PIXEL_DATA = 'x7fe00010';
const EXPLICIT_VR_BIG_ENDIAN = '1.2.840.10008.1.2.2';
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

async function parse(buffer: ArrayBuffer, url: string) {
  // The parser is loaded on first use, so it is not in the main bundle.
  const { default: dicomParser } = await import('dicom-parser');
  try {
    return dicomParser.parseDicom(new Uint8Array(buffer), { untilTag: PIXEL_DATA });
  } catch (e) {
    // dicom-parser throws strings, or objects that hold the error as `exception`.
    const cause = (e as { exception?: unknown })?.exception ?? e;
    throw new Error(`${url} could not be read as a DICOM file: ${cause}`);
  }
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
    return { dataSet: await parse(buffer, url), file: buffer };
  }
  const { buffer, isWholeFile } = await fetchBytes(url, requestInit, [0, size - 1]);
  if (isWholeFile) {
    return { dataSet: await parse(buffer, url), file: buffer };
  }
  try {
    const dataSet = await parse(buffer, url);
    if (dataSet.elements[PIXEL_DATA]) {
      return { dataSet };
    }
  } catch {
    // The header continues past the bytes read so far.
  }
  return readHeader(url, requestInit, largerSizes);
}

function toAttributes(dataSet: DataSet): DicomAttributes {
  const key = (tag: string) => `x${tag.toLowerCase()}`;
  return {
    string: tag => dataSet.string(key(tag)),
    numbers: tag => dataSet.string(key(tag))?.split('\\').map(Number),
    uint16: tag => dataSet.uint16(key(tag)),
    items: tag => dataSet.elements[key(tag)]?.items
      ?.map(item => toAttributes(item.dataSet as DataSet)),
  };
}

type DicomFrame = DicomImage & {
  url: string;
  transferSyntax: string;
  /** The whole file, when the server sent it instead of a range. */
  file?: ArrayBuffer;
  /** The bytes of the frame in the file. Without an end, they run to the end of the file. */
  start: number;
  end?: number;
  /** Whether the bytes start with the Basic Offset Table (in compressed single-frame files). */
  hasOffsetTable?: boolean;
};

/**
 * Read bytes [start, end) of a file, from the whole file when it was kept,
 * or else with a range request.
 */
async function readBytes(
  { url, file }: { url: string; file?: ArrayBuffer },
  requestInit: RequestInit | undefined,
  start: number,
  end?: number,
) {
  if (file) {
    return new Uint8Array(file).subarray(start, end);
  }
  const { buffer, isWholeFile } = await fetchBytes(url, requestInit, [start, end && end - 1]);
  return isWholeFile ? new Uint8Array(buffer).subarray(start, end) : new Uint8Array(buffer);
}

/**
 * Find the items of encapsulated (compressed) pixel data, up to the sequence delimiter
 * or the end of the bytes. Returns where the value of each item starts and ends.
 */
function findItems(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const items: { start: number; end: number }[] = [];
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    // Tags (FFFE,E000) and (FFFE,E0DD) read as little-endian 32-bit values.
    const tag = view.getUint32(offset, true);
    const length = view.getUint32(offset + 4, true);
    if (tag === 0xE0DDFFFE) break;
    items.push({ start: offset + 8, end: offset + 8 + length });
    offset += 8 + length;
  }
  return items;
}

/**
 * Join the fragments of one frame of encapsulated pixel data.
 * @param hasOffsetTable Whether the bytes start with the Basic Offset Table, which is skipped.
 */
function readFragments(bytes: Uint8Array, hasOffsetTable = false) {
  const items = findItems(bytes).slice(hasOffsetTable ? 1 : 0);
  if (items.length === 1) {
    return bytes.subarray(items[0].start, items[0].end);
  }
  const frame = new Uint8Array(items.reduce((sum, { start, end }) => sum + end - start, 0));
  items.reduce((position, { start, end }) => {
    frame.set(bytes.subarray(start, end), position);
    return position + end - start;
  }, 0);
  return frame;
}

/**
 * Find the bytes of each frame of a compressed multi-frame file
 * from its Basic Offset Table (DICOM PS3.5 A.4).
 * Without an offset table, the whole file is read, and each frame must be one fragment.
 */
async function findCompressedFrames(
  source: { url: string; file?: ArrayBuffer },
  requestInit: RequestInit | undefined,
  pixelDataOffset: number,
  numberOfFrames: number,
): Promise<{ starts: number[]; ends: (number | undefined)[]; file?: ArrayBuffer }> {
  const tableEnd = pixelDataOffset + 8 + 4 * numberOfFrames;
  const table = await readBytes(source, requestInit, pixelDataOffset, tableEnd);
  const view = new DataView(table.buffer, table.byteOffset, table.byteLength);
  const tableLength = view.getUint32(4, true);
  // Offsets are from the first fragment, which follows the table.
  const firstFragment = pixelDataOffset + 8 + tableLength;
  if (tableLength === 4 * numberOfFrames) {
    const starts = Array.from(
      { length: numberOfFrames },
      (_, i) => firstFragment + view.getUint32(8 + 4 * i, true),
    );
    // The last frame runs to the sequence delimiter.
    return { starts, ends: [...starts.slice(1), undefined] };
  }
  const whole = source.file ?? (await fetchBytes(source.url, requestInit)).buffer;
  const items = findItems(new Uint8Array(whole).subarray(firstFragment));
  if (items.length !== numberOfFrames) {
    throw new Error(`${source.url} is a compressed multi-frame image without an offset table and with ${items.length} fragments for ${numberOfFrames} frames, which is not supported.`);
  }
  return {
    starts: items.map(({ start }) => firstFragment + start - 8),
    ends: items.map(({ end }) => firstFragment + end),
    file: whole,
  };
}

/**
 * Read the header of a file, and find the bytes of each of its frames.
 */
async function readFile(url: string, requestInit?: RequestInit): Promise<DicomFrame[]> {
  const { dataSet, file } = await readHeader(url, requestInit);
  const transferSyntax = dataSet.string('x00020010') ?? '';
  if (!isSupportedTransferSyntax(transferSyntax)) {
    throw new Error(`${url} uses transfer syntax ${transferSyntax}, which is not supported.`);
  }
  const pixelData = dataSet.elements[PIXEL_DATA];
  if (!pixelData) {
    throw new Error(`${url} has no pixel data.`);
  }
  const attributes = toAttributes(dataSet);
  const image = { ...readImage(attributes), url, transferSyntax };
  if (transferSyntax === EXPLICIT_VR_BIG_ENDIAN && image.bitsAllocated === 8 && pixelData.vr === 'OW') {
    // The values would need to be swapped in pairs, across frames.
    throw new Error(`${url} has 8-bit big-endian pixel data stored as 16-bit words (OW), which is not supported.`);
  }
  const frames = readFrames(attributes, image);

  if (UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax)) {
    const frameLength = image.rows * image.columns * image.samplesPerPixel
      * (image.bitsAllocated / 8);
    return frames.map(frame => ({
      ...frame,
      file,
      start: pixelData.dataOffset + frame.frameIndex * frameLength,
      end: pixelData.dataOffset + (frame.frameIndex + 1) * frameLength,
    }));
  }
  if (frames.length === 1) {
    // The length of the fragments is not known up front, so read to the end.
    return [{
      ...frames[0], file, start: pixelData.dataOffset, hasOffsetTable: true,
    }];
  }
  const found = await findCompressedFrames(
    { url, file }, requestInit, pixelData.dataOffset, frames.length,
  );
  return frames.map((frame, i) => ({
    ...frame,
    file: found.file ?? file,
    start: found.starts[i],
    end: found.ends[i],
  }));
}

/**
 * Loads a series of DICOM Part 10 (.dcm) files: one image per file,
 * or multi-frame images with a frame per slice.
 * Only headers are read up front; pixel data is read per slice with range requests.
 */
export class DicomLoader extends VolumeLoader {
  async loadVolume(): Promise<Volume> {
    const { requestInit } = this;
    const urls: string[] = this.options?.urls ?? [];
    if (urls.length === 0) {
      throw new Error('The image.dicom file type requires options.urls.');
    }
    const images = (await Promise.all(urls.map(url => readFile(url, requestInit)))).flat();

    return toVolume(images, async (image) => {
      const bytes = await readBytes(image, requestInit, image.start, image.end);
      const isCompressed = !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(image.transferSyntax);
      return decodeFrame(
        image.transferSyntax,
        isCompressed ? readFragments(bytes, image.hasOffsetTable) : bytes,
        image,
      );
    });
  }
}
