import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { DicomLoader } from './DicomLoader.js';
import { RadiologySource } from './RadiologySource.js';
import { CODEC_FIXTURES } from './codecs.test.fixtures.js';

const LONG_VRS = ['OB', 'OW', 'SQ', 'UN', 'UT'];
const EXPLICIT_VR_BIG_ENDIAN = '1.2.840.10008.1.2.2';

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  parts.reduce((offset, p) => {
    out.set(p, offset);
    return offset + p.length;
  }, 0);
  return out;
}

/** Encode one Explicit VR data element. */
function element(
  group: number,
  elem: number,
  vr: string,
  value: string | number | number[] | Uint8Array,
  isLittleEndian = true,
) {
  let bytes: Uint8Array;
  if (typeof value === 'string') {
    // Values have even length, padded with a space (or a null byte for UIDs).
    const padded = value.length % 2 ? value + (vr === 'UI' ? '\0' : ' ') : value;
    bytes = new TextEncoder().encode(padded);
  } else if (value instanceof Uint8Array) {
    bytes = value;
  } else {
    // Unsigned 16-bit values.
    const values = [value].flat();
    const view = new DataView(new ArrayBuffer(2 * values.length));
    values.forEach((v, i) => view.setUint16(2 * i, v, isLittleEndian));
    bytes = new Uint8Array(view.buffer);
  }
  const isLong = LONG_VRS.includes(vr);
  const header = new DataView(new ArrayBuffer(isLong ? 12 : 8));
  header.setUint16(0, group, isLittleEndian);
  header.setUint16(2, elem, isLittleEndian);
  header.setUint8(4, vr.charCodeAt(0));
  header.setUint8(5, vr.charCodeAt(1));
  if (isLong) {
    header.setUint32(8, bytes.length, isLittleEndian);
  } else {
    header.setUint16(6, bytes.length, isLittleEndian);
  }
  return [new Uint8Array(header.buffer), bytes];
}

/** Encode a sequence whose items are lists of encoded elements. */
function sequence(group: number, elem: number, items: Uint8Array[][]) {
  const encodedItems = items.map((elements) => {
    const content = concat(elements);
    const header = new DataView(new ArrayBuffer(8));
    header.setUint16(0, 0xFFFE, true);
    header.setUint16(2, 0xE000, true);
    header.setUint32(4, content.length, true);
    return concat([new Uint8Array(header.buffer), content]);
  });
  return element(group, elem, 'SQ', concat(encodedItems));
}

/**
 * Multi-frame attributes: frame positions in per-frame functional groups,
 * orientation and pixel spacing in the shared functional groups.
 */
function multiFrameElements(frameZs: number[], hasFrameGroups: boolean) {
  if (!hasFrameGroups) {
    return element(0x0028, 0x0008, 'IS', String(frameZs.length));
  }
  return [
    ...element(0x0028, 0x0008, 'IS', String(frameZs.length)),
    ...sequence(0x5200, 0x9229, [[
      ...sequence(0x0020, 0x9116, [element(0x0020, 0x0037, 'DS', '1\\0\\0\\0\\1\\0')]),
      ...sequence(0x0028, 0x9110, [element(0x0028, 0x0030, 'DS', '0.5\\0.5')]),
    ]]),
    ...sequence(0x5200, 0x9230, frameZs.map(z => (
      sequence(0x0020, 0x9113, [element(0x0020, 0x0032, 'DS', `-10\\-20\\${z}`)])
    ))),
  ];
}

/**
 * An RLE Lossless frame (DICOM PS3.5 Annex G) of 16-bit pixels that all have one value.
 * Each byte of the value is in its own segment, as a run of numPixels copies.
 */
function rleFrame(value: number, numPixels: number) {
  const header = new DataView(new ArrayBuffer(64));
  header.setUint32(0, 2, true);
  header.setUint32(4, 64, true);
  header.setUint32(8, 66, true);
  // A run header of 1 - n repeats the next byte n times.
  return concat([
    new Uint8Array(header.buffer),
    new Uint8Array([1 - numPixels, Math.floor(value / 256), 1 - numPixels, value % 256]),
  ]);
}

/**
 * Encapsulated (compressed) pixel data with a fragment per frame,
 * after a basic offset table that is empty or lists where each frame starts.
 */
function encapsulatedPixelData(fragments: Uint8Array[], hasOffsetTable: boolean) {
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
  const offsets = fragments.map((_, i) => fragments
    .slice(0, i)
    .reduce((sum, f) => sum + 8 + f.length, 0));
  const offsetTable = new Uint8Array(new Uint32Array(hasOffsetTable ? offsets : []).buffer);
  return [
    new Uint8Array(header.buffer),
    item(0xE000, offsetTable.length),
    offsetTable,
    ...fragments.flatMap(fragment => [item(0xE000, fragment.length), fragment]),
    item(0xE0DD, 0),
  ];
}

/**
 * A DICOM file for an axial CT slice at height z (12-bit unsigned, rescale intercept -1024).
 * By default, it has 3 x 2 uncompressed pixels set to 1000 + z.
 * With frameZs, it is a multi-frame image with a frame at each height.
 * With fragments, its pixel data is compressed, with a fragment per frame.
 */
function makeFile(z: number, {
  transferSyntax = '1.2.840.10008.1.2.1',
  rows = 2,
  columns = 3,
  fragments = undefined as Uint8Array[] | undefined,
  hasOffsetTable = false,
  frameZs = undefined as number[] | undefined,
  hasFrameGroups = true,
  hasPosition = true,
  photometricInterpretation = 'MONOCHROME2',
  rgbPixels = undefined as number[] | undefined,
} = {}) {
  const pixels = (frameZs ?? [z]).flatMap(frameZ => new Array(rows * columns).fill(1000 + frameZ));
  // The file meta information is always little-endian.
  const isLittleEndian = transferSyntax !== EXPLICIT_VR_BIG_ENDIAN;
  const el = (...args: Parameters<typeof element>) => element(
    args[0], args[1], args[2], args[3], isLittleEndian,
  );
  return concat([
    new Uint8Array(128),
    new TextEncoder().encode('DICM'),
    ...element(0x0002, 0x0010, 'UI', transferSyntax),
    ...el(0x0008, 0x0060, 'CS', 'CT'),
    ...(hasPosition ? [
      ...el(0x0020, 0x0032, 'DS', `-10\\-20\\${z}`),
      ...el(0x0020, 0x0037, 'DS', '1\\0\\0\\0\\1\\0'),
    ] : []),
    ...(frameZs ? multiFrameElements(frameZs, hasFrameGroups) : []),
    ...el(0x0028, 0x0002, 'US', rgbPixels ? 3 : 1),
    ...el(0x0028, 0x0004, 'CS', rgbPixels ? 'RGB' : photometricInterpretation),
    ...(rgbPixels ? el(0x0028, 0x0006, 'US', 0) : []),
    ...el(0x0028, 0x0010, 'US', rows),
    ...el(0x0028, 0x0011, 'US', columns),
    ...el(0x0028, 0x0030, 'DS', '0.5\\0.5'),
    ...el(0x0028, 0x0100, 'US', rgbPixels ? 8 : 16),
    ...el(0x0028, 0x0101, 'US', rgbPixels ? 8 : 12),
    ...el(0x0028, 0x0103, 'US', 0),
    ...(rgbPixels ? [] : [
      ...el(0x0028, 0x1050, 'DS', '40'),
      ...el(0x0028, 0x1051, 'DS', '400'),
      ...el(0x0028, 0x1052, 'DS', '-1024'),
      ...el(0x0028, 0x1053, 'DS', '1'),
    ]),
    ...(rgbPixels ? el(0x7FE0, 0x0010, 'OB', new Uint8Array(rgbPixels)) : []),
    ...(fragments && !rgbPixels ? encapsulatedPixelData(fragments, hasOffsetTable) : []),
    ...(!fragments && !rgbPixels ? el(0x7FE0, 0x0010, 'OW', pixels) : []),
  ]);
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

function makeLoader(urls = URLS) {
  return new DicomLoader(new RadiologySource({}), {
    type: 'image', fileType: 'image.dicom', options: { urls },
  });
}

describe('DicomLoader', () => {
  beforeEach(() => {
    // Decode on this thread: the jsdom-worker test polyfill cannot run inline workers.
    vi.stubGlobal('Worker', undefined);
    // jsdom's Headers drops the Range header, which browsers keep. Use Node's Headers.
    vi.stubGlobal('Headers', new Response().headers.constructor);
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
      supportsRange, transferSyntax, rows: 5, columns: 7, fragments: [fragment],
    });
    const [source] = (await makeLoader().load()).data.image.instance.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual(
      Array.from({ length: 35 }, (_, i) => ((i * 97) % 4096) - 1024),
    );
  });

  it('reads a multi-frame file with a frame per slice', async () => {
    mockServer({ frameZs: [10, 0, 5] });
    const image = (await makeLoader(['https://example.com/z0.dcm']).load()).data.image.instance;
    expect(image.getNumZ()).toEqual(3);
    expect(image.getModelMatrix()[10]).toEqual(5000);

    // Superior is drawn first (display z points inferior).
    const [source] = image.getData();
    const first = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(first.data)).toEqual(new Array(6).fill(1000 + 10 - 1024));
    const middle = await source.getRaster({ selection: { t: 0, c: 0, z: 1 } });
    expect(Array.from(middle.data)).toEqual(new Array(6).fill(1000 + 5 - 1024));
  });

  it.each([true, false])('reads a compressed multi-frame file (offset table: %s)', async (hasOffsetTable) => {
    const frameZs = [10, 0, 5];
    const fetchMock = mockServer({
      frameZs,
      transferSyntax: '1.2.840.10008.1.2.5',
      fragments: frameZs.map(z => rleFrame(1000 + z, 6)),
      hasOffsetTable,
    });
    const [source] = (await makeLoader(['https://example.com/z0.dcm']).load()).data.image.instance.getData();
    const rasters = await Promise.all([0, 1, 2].map(z => (
      source.getRaster({ selection: { t: 0, c: 0, z } })
    )));
    expect(rasters.map(raster => raster.data[0])).toEqual([10, 5, 0].map(z => 1000 + z - 1024));

    // With an offset table, frames are read with range requests.
    // Without one, the whole file is read once.
    const ranges = fetchMock.mock.calls.map(([, init]) => new Headers(init?.headers).get('Range'));
    expect(ranges.every(Boolean)).toBe(hasOffsetTable);
    expect(ranges.filter(range => !range).length).toBe(hasOffsetTable ? 0 : 1);
  });

  it('reads frames without per-frame positions as time points', async () => {
    // Such as an ultrasound cine loop. Pixel values are 1000 + the frame's z.
    mockServer({ frameZs: [3, 1, 2], hasFrameGroups: false });
    const image = (await makeLoader(['https://example.com/z0.dcm']).load()).data.image.instance;
    expect(image.getNumZ()).toEqual(1);
    expect(image.getNumT()).toEqual(3);
    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 2, c: 0, z: 0 } });
    expect(raster.data[0]).toEqual(1000 + 2 - 1024);
  });

  it('reads big-endian files', async () => {
    mockServer({ transferSyntax: EXPLICIT_VR_BIG_ENDIAN });
    const [source] = (await makeLoader().load()).data.image.instance.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 2 } });
    expect(Array.from(raster.data)).toEqual(new Array(6).fill(1000 - 1024));
  });

  it('inverts MONOCHROME1 images, and places a single image without a position', async () => {
    mockServer({ photometricInterpretation: 'MONOCHROME1', hasPosition: false });
    const image = (await makeLoader(['https://example.com/z0.dcm']).load()).data.image.instance;
    // Stored values 0 to 4095 are displayed from 3071 to -1024 (2047 - HU).
    expect(image.getChannelObjects()[0].defaultWindow).toEqual([2047 - 240, 2047 + 160]);
    expect(image.getModelMatrix()[12]).toEqual(-250);
    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual(new Array(6).fill(2047 - (1000 - 1024)));
  });

  it('reads RGB images as three channels', async () => {
    // Six interleaved RGB pixels: (0, 100, 200), (1, 101, 201), ...
    const rgbPixels = [0, 1, 2, 3, 4, 5].flatMap(i => [i, 100 + i, 200 + i]);
    mockServer({ rgbPixels });
    const { data, coordinationValues } = await makeLoader(['https://example.com/z0.dcm']).load();
    const image = data.image.instance;
    expect(image.getPhotometricInterpretation()).toEqual('RGB');
    expect(image.getChannelNames()).toEqual(['Red', 'Green', 'Blue']);
    expect(image.getDtype()).toEqual('Uint8');
    expect(image.getChannelObjects()[0].defaultWindow).toEqual([0, 255]);
    expect(coordinationValues).toMatchObject({
      imageLayer: { value: [{ photometricInterpretation: 'RGB' }] },
    });
    const [source] = image.getData();
    const blue = await source.getRaster({ selection: { t: 0, c: 2, z: 0 } });
    expect(Array.from(blue.data)).toEqual([200, 201, 202, 203, 204, 205]);
  });

  it('rejects unsupported transfer syntaxes', async () => {
    // MPEG-4 AVC/H.264
    mockServer({ transferSyntax: '1.2.840.10008.1.2.4.102' });
    await expect(makeLoader().load()).rejects.toThrow('transfer syntax 1.2.840.10008.1.2.4.102, which is not supported');
  });
});
