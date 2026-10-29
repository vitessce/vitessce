import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { DicomWebLoader, extractFrame } from './DicomWebLoader.js';
import { RadiologySource } from './RadiologySource.js';

const SERIES_URL = 'https://example.com/dicomweb/studies/1.2/series/1.2.3';

/**
 * DICOM JSON for an axial CT slice of 3 x 2 pixels at height z,
 * stored as 12-bit unsigned values with a rescale intercept of -1024.
 */
function makeInstance(sopInstanceUid: string, z: number) {
  return {
    '00080018': { vr: 'UI', Value: [sopInstanceUid] },
    '00080060': { vr: 'CS', Value: ['CT'] },
    '0008103E': { vr: 'LO', Value: ['Chest'] },
    '00200032': { vr: 'DS', Value: [-10, -20, z] },
    '00200037': { vr: 'DS', Value: [1, 0, 0, 0, 1, 0] },
    '00280010': { vr: 'US', Value: [2] },
    '00280011': { vr: 'US', Value: [3] },
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

// Instance "sop-z<z>" has pixel values 1000 + z.
const INSTANCES = [makeInstance('sop-z10', 10), makeInstance('sop-z0', 0), makeInstance('sop-z5', 5)];

function multipart(pixels: Uint16Array, partType = 'application/octet-stream; transfer-syntax=1.2.840.10008.1.2.1') {
  const head = new TextEncoder().encode(`--BOUNDARY\r\nContent-Type: ${partType}\r\n\r\n`);
  const tail = new TextEncoder().encode('\r\n--BOUNDARY--');
  const body = new Uint8Array(head.length + pixels.byteLength + tail.length);
  body.set(head);
  body.set(new Uint8Array(pixels.buffer), head.length);
  body.set(tail, head.length + pixels.byteLength);
  return body;
}

function mockServer(partType?: string) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.endsWith('/metadata')) {
      return new Response(JSON.stringify(INSTANCES));
    }
    const z = Number(/sop-z(\d+)/.exec(url)?.[1]);
    return new Response(multipart(new Uint16Array(6).fill(1000 + z), partType), {
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

  it('rejects compressed frames', async () => {
    mockServer('image/jls; transfer-syntax=1.2.840.10008.1.2.4.80');
    const [source] = (await makeLoader().load()).data.image.instance.getData();
    await expect(source.getRaster({ selection: { t: 0, c: 0, z: 0 } }))
      .rejects.toThrow('compressed pixel data (1.2.840.10008.1.2.4.80)');
  });
});

describe('extractFrame', () => {
  it('accepts a single-part response', () => {
    const pixels = new Uint16Array([1, 2, 3]);
    const frame = extractFrame(pixels.buffer, 'application/octet-stream', 6);
    expect(Array.from(new Uint16Array(frame))).toEqual([1, 2, 3]);
  });
});
