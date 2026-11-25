import type { Reader, ZipEntry } from 'unzipit';

/**
 * A file that can be read in part: a file at a URL, or an entry in a zip file.
 */
export type ByteSource = {
  /** The URL or the path in the zip file, for error messages. */
  name: string;
  /**
   * Read bytes [start, end) of the file. Without an end, reads to the end of the file.
   * Without a range, reads the whole file.
   * Some sources send the whole file instead of a range, which isWholeFile tells.
   */
  read(range?: [number, number?]): Promise<{ buffer: ArrayBuffer; isWholeFile: boolean }>;
};

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
    throw new Error(`DICOM file failed to load: ${res.status} from ${res.url || url}`);
  }
  // A server that ignores the Range header sends the whole file.
  return { buffer: await res.arrayBuffer(), isWholeFile: res.status !== 206 };
}

/**
 * A file at a URL, read with HTTP range requests.
 */
export function urlSource(url: string, requestInit?: RequestInit): ByteSource {
  return {
    name: url,
    read: range => fetchBytes(
      url,
      requestInit,
      range && [range[0], range[1] === undefined ? undefined : range[1] - 1],
    ),
  };
}

/**
 * Join a file name to the URL of the directory that contains it.
 * The file name must be a relative path within the directory.
 */
export function joinUrl(directoryUrl: string, fileName: string) {
  const isOutside = /^[a-z][a-z0-9+.-]*:/i.test(fileName)
    || fileName.startsWith('/')
    || fileName.split('/').includes('..');
  if (isOutside) {
    throw new Error(`${fileName} must be the name of a file within the directory ${directoryUrl}.`);
  }
  return `${directoryUrl.replace(/\/+$/, '')}/${fileName}`;
}

/**
 * Reads a zip file with HTTP range requests, for unzipit.
 * Like the HTTPRangeReader of unzipit, but requests are made with requestInit.
 */
function httpRangeReader(url: string, requestInit?: RequestInit): Reader {
  let length: Promise<number> | undefined;
  return {
    getLength() {
      if (!length) {
        length = fetch(url, { ...requestInit, method: 'HEAD' }).then((res) => {
          const contentLength = Number(res.headers.get('Content-Length') ?? NaN);
          if (!res.ok || Number.isNaN(contentLength)) {
            throw new Error(`The length of the zip file ${url} could not be read (status ${res.status}).`);
          }
          return contentLength;
        });
        // Allow a failed request to be retried.
        length.catch(() => { length = undefined; });
      }
      return length;
    },
    async read(offset, size) {
      if (size === 0) {
        return new Uint8Array(0);
      }
      const { buffer, isWholeFile } = await fetchBytes(
        url, requestInit, [offset, offset + size - 1],
      );
      const bytes = new Uint8Array(buffer);
      return isWholeFile ? bytes.slice(offset, offset + size) : bytes;
    },
  };
}

/**
 * Where the data of a zip entry starts in the zip file.
 * unzipit does not expose it, so it is read from the local file header,
 * which is found from a private field of the entry (as in the ZipFileStore of zarrita).
 */
async function getDataOffset(reader: Reader, entry: ZipEntry) {
  // eslint-disable-next-line no-underscore-dangle
  const rawEntry = (entry as unknown as {
    _rawEntry?: { relativeOffsetOfLocalHeader?: unknown };
  })._rawEntry;
  const localHeaderOffset = rawEntry?.relativeOffsetOfLocalHeader;
  if (typeof localHeaderOffset !== 'number') {
    throw new Error('Reading part of a zip entry needs internal properties of unzipit that are not available. This may indicate an incompatible version of unzipit.');
  }
  // The local file header is 30 bytes, then the file name and the extra field.
  const header = await reader.read(localHeaderOffset, 30);
  const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  const fileNameLength = view.getUint16(26, true);
  const extraFieldLength = view.getUint16(28, true);
  return localHeaderOffset + 30 + fileNameLength + extraFieldLength;
}

/**
 * An entry of a zip file. Uncompressed (stored) entries are read in part
 * with range requests. Compressed entries are read and decompressed whole.
 */
function zipEntrySource(reader: Reader, entry: ZipEntry, zipUrl: string): ByteSource {
  let dataOffset: Promise<number> | undefined;
  return {
    name: `${zipUrl}/${entry.name}`,
    async read(range) {
      const [start, end] = [range?.[0] ?? 0, Math.min(range?.[1] ?? entry.size, entry.size)];
      const isWholeFile = start === 0 && end === entry.size;
      if (entry.compressionMethod !== 0 || isWholeFile) {
        return { buffer: await entry.arrayBuffer(), isWholeFile: true };
      }
      if (!dataOffset) {
        dataOffset = getDataOffset(reader, entry);
        dataOffset.catch(() => { dataOffset = undefined; });
      }
      if (end <= start) {
        return { buffer: new ArrayBuffer(0), isWholeFile: false };
      }
      const bytes = await reader.read(await dataOffset, end - start);
      return { buffer: bytes.slice().buffer, isWholeFile: false };
    },
  };
}

/**
 * Whether a zip entry is a file of the series:
 * not a directory, a hidden file, macOS metadata, or a DICOMDIR index.
 */
function isSeriesFile(entry: ZipEntry) {
  const path = entry.name.split('/');
  const fileName = path[path.length - 1];
  return !entry.isDirectory
    && !path.includes('__MACOSX')
    && !fileName.startsWith('.')
    && fileName.toUpperCase() !== 'DICOMDIR';
}

/**
 * The files of a zip file, listed from its central directory.
 * Only the central directory is read up front.
 */
export async function zipSources(url: string, requestInit?: RequestInit): Promise<ByteSource[]> {
  // unzipit is loaded on first use, so it is not in the main bundle.
  const { unzipRaw } = await import('unzipit');
  const reader = httpRangeReader(url, requestInit);
  const { entries } = await unzipRaw(reader);
  return entries
    .filter(isSeriesFile)
    .map(entry => zipEntrySource(reader, entry, url));
}
