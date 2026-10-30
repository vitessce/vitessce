import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { NiftiLoader } from './NiftiLoader.js';
import { RadiologySource } from './RadiologySource.js';

/**
 * Build a NIfTI-1 file holding a 4 x 3 x 2 volume whose voxel values are 0..23.
 * The sform maps to RAS with spacing (2, 2, 3) and origin (10, 20, 30).
 */
function makeNifti({
  datatype = 4, slope = 0, intercept = 0, calMin = 0, calMax = 0,
} = {}) {
  const buffer = new ArrayBuffer(352 + 24 * 2);
  const view = new DataView(buffer);
  view.setInt32(0, 348, true);
  [3, 4, 3, 2, 1, 1, 1, 1].forEach((d, i) => view.setInt16(40 + 2 * i, d, true));
  view.setInt16(70, datatype, true);
  view.setInt16(72, datatype === 2 ? 8 : 16, true);
  [1, 2, 2, 3].forEach((d, i) => view.setFloat32(76 + 4 * i, d, true));
  view.setFloat32(108, 352, true);
  view.setFloat32(112, slope, true);
  view.setFloat32(116, intercept, true);
  view.setFloat32(124, calMax, true);
  view.setFloat32(128, calMin, true);
  view.setInt16(254, 1, true);
  [[2, 0, 0, 10], [0, 2, 0, 20], [0, 0, 3, 30]]
    .flat()
    .forEach((v, i) => view.setFloat32(280 + 4 * i, v, true));
  new TextEncoder().encodeInto('n+1\0', new Uint8Array(buffer, 344, 4));
  for (let i = 0; i < 24; i += 1) {
    if (datatype === 2) {
      view.setUint8(352 + i, i);
    } else {
      view.setInt16(352 + 2 * i, i, true);
    }
  }
  return buffer;
}

function gzip(buffer: ArrayBuffer) {
  const stream = (new Response(buffer).body as ReadableStream).pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

function makeLoader(body: ArrayBuffer | Uint8Array) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body)));
  const url = 'https://example.com/ct.nii.gz';
  return new NiftiLoader(new RadiologySource({ url }), {
    type: 'image', fileType: 'image.nifti', url,
  });
}

describe('NiftiLoader', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a gzipped volume into patient space', async () => {
    const loader = makeLoader(await gzip(makeNifti({ calMin: 0, calMax: 20 })));
    const { data, coordinationValues } = await loader.load();
    const image = data.image.instance;

    expect(image.getName()).toEqual('ct');
    expect(image.getDtype()).toEqual('Int16');
    expect(image.getNumZ()).toEqual(2);
    expect(image.getDefaultTargetZ()).toEqual(1);
    expect(image.getChannelObjects()[0].defaultWindow).toEqual([0, 20]);
    expect(image.getSceneMetersPerUnit()).toEqual(1e-6);
    // RAS (10, 20, 30) is LPS (-10, -20, 30). Every axis is flipped, so the
    // first displayed voxel is the last stored one, shifted by half a voxel.
    // Millimeters are converted to micrometers. The z translation is dropped.
    expect(Array.from(image.getModelMatrix())).toEqual([
      2000, 0, 0, 0,
      0, 2000, 0, 0,
      0, 0, 3000, 0,
      (-10 - 2 * 3 - 1) * 1000, (-20 - 2 * 2 - 1) * 1000, 0, 1,
    ]);
    expect(coordinationValues).toMatchObject({ spatialTargetZ: 1 });

    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 0 } });
    expect(Array.from(raster.data)).toEqual([23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12]);
  });

  it('applies the slope and intercept', async () => {
    const loader = makeLoader(makeNifti({ datatype: 2, slope: 0.5, intercept: -1 }));
    const image = (await loader.load()).data.image.instance;
    expect(image.getDtype()).toEqual('Float32');
    const [source] = image.getData();
    const raster = await source.getRaster({ selection: { t: 0, c: 0, z: 1 } });
    expect(raster.data[0]).toEqual(11 * 0.5 - 1);
  });

  it('rejects files that are not NIfTI', async () => {
    const loader = makeLoader(new Uint8Array(400));
    await expect(loader.load()).rejects.toThrow('is not a NIfTI-1 or NIfTI-2 file');
  });
});
