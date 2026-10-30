// jsdom's Headers drops the Range header, which browsers and Node keep.
// @vitest-environment node
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { DicomLoader } from './DicomLoader.js';
import { RadiologySource } from './RadiologySource.js';
import { CODEC_FIXTURES } from './codecs.test.fixtures.js';

const LONG_VRS = ['OB', 'OW', 'SQ', 'UN', 'UT'];

/** Encode one Explicit VR Little Endian data element. */
function element(group: number, elem: number, vr: string, value: string | number | Uint16Array) {
  let bytes: Uint8Array;
  if (typeof value === 'string') {
    // Values have even length, padded with a space (or a null byte for UIDs).
    const padded = value.length % 2 ? value + (vr === 'UI' ? '\0' : ' ') : value;
    bytes = new TextEncoder().encode(padded);
  } else if (typeof value === 'number') {
    bytes = new Uint8Array(new Uint16Array([value]).buffer);
  } else {
    bytes = new Uint8Array(value.buffer);
  }
  const isLong = LONG_VRS.includes(vr);
  const header = new DataView(new ArrayBuffer(isLong ? 12 : 8));
  header.setUint16(0, group, true);
  header.setUint16(2, elem, true);
  header.setUint8(4, vr.charCodeAt(0));
  header.setUint8(5, vr.charCodeAt(1));
  if (isLong) {
    header.setUint32(8, bytes.length, true);
  } else {
    header.setUint16(6, bytes.length, true);
  }
  return [new Uint8Array(header.buffer), bytes];
}

/**
 * Encapsulated (compressed) pixel data with an empty basic offset table and one fragment.
 */
function encapsulatedPixelData(fragment: Uint8Array) {
  const header = new DataView(new ArrayBuffer(12));
  header.setUint16(0, 0x7FE0, true);
  header.setUint16(2, 0x0010, true);
  header.setUint8(4, 'O'.charCodeAt(0));
  header.setUint8(5, 'B'.charCodeAt(0));
  header.setUint32(8, 0xFFFFFFFF, true);
  const item = (elem: number, length: number) => {
    const view = new DataView(new ArrayBuffer(8));
    view.setUint16(0, 0xFFFE, true);
    view.setUint16(2, elem, true);
    view.setUint32(4, length, true);
    return new Uint8Array(view.buffer);
  };
  return [
    new Uint8Array(header.buffer),
    item(0xE000, 0),
    item(0xE000, fragment.length),
    fragment,
    item(0xE0DD, 0),
  ];
}

/**
 * A DICOM file for an axial CT slice at height z (12-bit unsigned, rescale intercept -1024).
 * By default, it has 3 x 2 uncompressed pixels set to 1000 + z.
 */
function makeFile(z: number, {
  transferSyntax = '1.2.840.10008.1.2.1',
  rows = 2,
  columns = 3,
  fragment = undefined as Uint8Array | undefined,
} = {}) {
  const parts = [
    new Uint8Array(128),
    new TextEncoder().encode('DICM'),
    ...element(0x0002, 0x0010, 'UI', transferSyntax),
    ...element(0x0008, 0x0060, 'CS', 'CT'),
    ...element(0x0020, 0x0032, 'DS', `-10\\-20\\${z}`),
    ...element(0x0020, 0x0037, 'DS', '1\\0\\0\\0\\1\\0'),
    ...element(0x0028, 0x0002, 'US', 1),
    ...element(0x0028, 0x0004, 'CS', 'MONOCHROME2'),
    ...element(0x0028, 0x0010, 'US', rows),
    ...element(0x0028, 0x0011, 'US', columns),
    ...element(0x0028, 0x0030, 'DS', '0.5\\0.5'),
    ...element(0x0028, 0x0100, 'US', 16),
    ...element(0x0028, 0x0101, 'US', 12),
    ...element(0x0028, 0x0103, 'US', 0),
    ...element(0x0028, 0x1050, 'DS', '40'),
    ...element(0x0028, 0x1051, 'DS', '400'),
    ...element(0x0028, 0x1052, 'DS', '-1024'),
    ...element(0x0028, 0x1053, 'DS', '1'),
    ...(fragment
      ? encapsulatedPixelData(fragment)
      : element(0x7FE0, 0x0010, 'OW', new Uint16Array(rows * columns).fill(1000 + z))),
  ];
  const file = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  parts.reduce((offset, p) => {
    file.set(p, offset);
    return offset + p.length;
  }, 0);
  return file;
}

function mockServer({ supportsRange = true, ...fileOptions }: {
  supportsRange?: boolean;
} & Parameters<typeof makeFile>[1] = {}) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const file = makeFile(Number(/z(\d+)\.dcm/.exec(url)?.[1]), fileOptions);
    const range = /bytes=(\d+)-(\d*)/.exec(new Headers(init?.headers).get('Range') ?? '');
    if (supportsRange && range) {
      const end = range[2] ? Number(range[2]) + 1 : undefined;
      return new Response(file.slice(Number(range[1]), end), { status: 206 });
    }
    return new Response(file);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const URLS = ['https://example.com/z10.dcm', 'https://example.com/z0.dcm', 'https://example.com/z5.dcm'];

function makeLoader() {
  return new DicomLoader(new RadiologySource({}), {
    type: 'image', fileType: 'image.dicom', options: { urls: URLS },
  });
}

describe('DicomLoader', () => {
  beforeEach(() => {
    // Decode on this thread: the jsdom-worker test polyfill cannot run inline workers.
    vi.stubGlobal('Worker', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads headers and pixels with range requests', async () => {
    const fetchMock = mockServer();
    const image = (await makeLoader().load()).data.image.instance;
    expect(image.getNumZ()).toEqual(3);
    expect(image.getDtype()).toEqual('Int16');
    expect(image.getChannelObjects()[0].defaultWindow).toEqual([-160, 240]);

    // Superior is drawn first (display z points inferior).
    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual(new Array(6).fill(1000 + 10 - 1024));

    const ranges = fetchMock.mock.calls
      .map(([, init]) => new Headers(init?.headers).get('Range'));
    expect(ranges.every(Boolean)).toBe(true);
  });

  it('works when the server ignores range requests', async () => {
    const fetchMock = mockServer({ supportsRange: false });
    const [source] = (await makeLoader().load()).data.image.instance.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 2 } });
    expect(Array.from(raster.data)).toEqual(new Array(6).fill(1000 - 1024));
    // The whole file was kept, so pixels need no second request.
    expect(fetchMock).toHaveBeenCalledTimes(URLS.length);
  });

  it.each([true, false])('decodes compressed files (range requests: %s)', async (supportsRange) => {
    const { transferSyntax, base64 } = CODEC_FIXTURES.rle;
    const fragment = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    mockServer({
      supportsRange, transferSyntax, rows: 5, columns: 7, fragment,
    });
    const [source] = (await makeLoader().load()).data.image.instance.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual(
      Array.from({ length: 35 }, (_, i) => ((i * 97) % 4096) - 1024),
    );
  });

  it('rejects unsupported transfer syntaxes', async () => {
    // JPEG Baseline
    mockServer({ transferSyntax: '1.2.840.10008.1.2.4.50' });
    await expect(makeLoader().load()).rejects.toThrow('transfer syntax 1.2.840.10008.1.2.4.50, which is not supported');
  });
});
