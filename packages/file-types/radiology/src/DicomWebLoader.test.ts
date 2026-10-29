import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { DicomWebLoader, extractFrame } from './DicomWebLoader.js';
import { RadiologySource } from './RadiologySource.js';
import { CODEC_FIXTURES } from './codecs.test.fixtures.js';

const SERIES_URL = 'https://example.com/dicomweb/studies/1.2/series/1.2.3';
const EXPLICIT_VR_LITTLE_ENDIAN = 'application/octet-stream; transfer-syntax=1.2.840.10008.1.2.1';

/**
 * DICOM JSON for an axial CT slice at height z,
 * stored as 12-bit unsigned values with a rescale intercept of -1024.
 */
function makeInstance(sopInstanceUid: string, z: number, { rows = 2, columns = 3 } = {}) {
  return {
    '00080018': { vr: 'UI', Value: [sopInstanceUid] },
    '00080060': { vr: 'CS', Value: ['CT'] },
    '0008103E': { vr: 'LO', Value: ['Chest'] },
    '00200032': { vr: 'DS', Value: [-10, -20, z] },
    '00200037': { vr: 'DS', Value: [1, 0, 0, 0, 1, 0] },
    '00280010': { vr: 'US', Value: [rows] },
    '00280011': { vr: 'US', Value: [columns] },
    '00280030': { vr: 'DS', Value: [0.5, 0.5] },
    '00280100': { vr: 'US', Value: [16] },
    '00280101': { vr: 'US', Value: [12] },
    '00280103': { vr: 'US', Value: [0] },
    // Some servers send decimal strings as strings.
    '00281050': { vr: 'DS', Value: ['40'] },
    '00281051': { vr: 'DS', Value: [400] },
    '00281052': { vr: 'DS', Value: [-1024] },
    '00281053': { vr: 'DS', Value: [1] },
  };
}

function multipart(frame: Uint8Array, partType: string) {
  const head = new TextEncoder().encode(`--BOUNDARY\r\nContent-Type: ${partType}\r\n\r\n`);
  const tail = new TextEncoder().encode('\r\n--BOUNDARY--');
  const body = new Uint8Array(head.length + frame.length + tail.length);
  body.set(head);
  body.set(frame, head.length);
  body.set(tail, head.length + frame.length);
  return body;
}

/**
 * A DICOMweb server with three slices at heights 0, 5, and 10.
 * By default, slice z has every pixel set to 1000 + z.
 */
function mockServer({
  shape = { rows: 2, columns: 3 },
  partType = EXPLICIT_VR_LITTLE_ENDIAN,
  getFrame = (z: number) => new Uint8Array(new Uint16Array(6).fill(1000 + z).buffer),
  canTranscode = true,
  hasLocalizer = false,
} = {}) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/metadata')) {
      const instances = [10, 0, 5].map(z => makeInstance(`sop-z${z}`, z, shape));
      if (hasLocalizer) {
        const localizer = makeInstance('localizer', 0, shape);
        localizer['00200037'].Value = [1, 0, 0, 0, 0, -1];
        instances.push(localizer);
      }
      return new Response(JSON.stringify(instances));
    }
    const accept = new Headers(init?.headers).get('Accept') ?? '';
    if (!canTranscode && !accept.includes('transfer-syntax=*')) {
      return new Response(null, { status: 406 });
    }
    const z = Number(/sop-z(\d+)/.exec(url)?.[1]);
    return new Response(multipart(getFrame(z), partType), {
      headers: { 'Content-Type': 'multipart/related; type="application/octet-stream"; boundary=BOUNDARY' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function makeLoader() {
  return new DicomWebLoader(new RadiologySource({ url: SERIES_URL }), {
    type: 'image', fileType: 'image.dicomweb', url: SERIES_URL,
  });
}

async function getFirstRaster() {
  const [source] = (await makeLoader().load()).data.image.instance.getData();
  return source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
}

function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

describe('DicomWebLoader', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sorts slices by position and rescales to HU', async () => {
    const fetchMock = mockServer();
    const image = (await makeLoader().load()).data.image.instance;

    expect(image.getName()).toEqual('Chest');
    expect(image.getChannelNames()).toEqual(['CT']);
    expect(image.getDtype()).toEqual('Int16');
    expect(image.getNumZ()).toEqual(3);
    expect(image.getChannelObjects()[0].defaultWindow).toEqual([-160, 240]);
    // Slices are 5 mm apart.
    expect(Array.from(image.getModelMatrix())).toEqual([
      500, 0, 0, 0,
      0, 500, 0, 0,
      0, 0, 5000, 0,
      -10250, -20250, 0, 1,
    ]);

    // Superior is drawn first (display z points inferior).
    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual(new Array(6).fill(1000 + 10 - 1024));

    const [frameUrl, frameInit] = fetchMock.mock.calls.at(-1) as unknown as [string, RequestInit];
    expect(frameUrl).toEqual(`${SERIES_URL}/instances/sop-z10/frames/1`);
    expect(new Headers(frameInit.headers).get('Accept')).toContain('transfer-syntax=1.2.840.10008.1.2.1');
  });

  it('decodes stored frames from servers that cannot transcode', async () => {
    const { transferSyntax, base64 } = CODEC_FIXTURES.rle;
    mockServer({
      shape: { rows: 5, columns: 7 },
      partType: `application/octet-stream; transfer-syntax=${transferSyntax}`,
      getFrame: () => fromBase64(base64),
      canTranscode: false,
    });
    const raster = await getFirstRaster();
    expect(Array.from(raster.data)).toEqual(
      Array.from({ length: 35 }, (_, i) => ((i * 97) % 4096) - 1024),
    );
  });

  it('skips images that do not match the rest of the series', async () => {
    mockServer({ hasLocalizer: true });
    const image = (await makeLoader().load()).data.image.instance;
    expect(image.getNumZ()).toEqual(3);
  });

  it('rejects unsupported frame types', async () => {
    mockServer({ partType: 'image/jpeg' });
    await expect(getFirstRaster()).rejects.toThrow('image/jpeg, which is not supported');
  });
});

describe('extractFrame', () => {
  it('accepts a single-part response', () => {
    const pixels = new Uint16Array([1, 2, 3]);
    const { bytes, transferSyntax } = extractFrame(pixels.buffer, 'application/octet-stream');
    expect(Array.from(new Uint16Array(bytes.slice().buffer))).toEqual([1, 2, 3]);
    expect(transferSyntax).toEqual('1.2.840.10008.1.2.1');
  });

  it.each([
    'multipart/related; boundary="BOUNDARY"',
    // Some servers omit the boundary parameter.
    'multipart/related',
  ])('ends a multipart frame at the closing delimiter (%s)', (contentType) => {
    const body = multipart(new Uint8Array([1, 2, 3]), 'image/jls');
    const { bytes, transferSyntax } = extractFrame(body.buffer, contentType);
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
    expect(transferSyntax).toEqual('1.2.840.10008.1.2.4.80');
  });
});
