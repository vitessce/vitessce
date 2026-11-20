/* eslint-disable no-underscore-dangle */
import { describe, it, expect } from 'vitest';
import ImageWrapper from './ImageWrapper.js';
import { readTiffSampleRange } from './tiff-metadata.js';

// Mimics viv's TiffPixelSource: _indexer gives the TIFF directory of one plane.
// tileSize is what viv reports (level 0's for every level); tileShape
// [height, width] is the level's real TIFF tile.
function createTiffPixelSource({
  labels = ['t', 'c', 'z', 'y', 'x'],
  shape,
  tileShape = [64, 64],
  fileDirectory = {},
}: {
  labels?: string[];
  shape: number[];
  tileShape?: [number, number];
  fileDirectory?: Record<string, unknown>;
}) {
  return {
    labels,
    shape,
    tileSize: 64,
    dtype: 'Uint16',
    async _indexer(selection: Record<string, number>) {
      // Only the first plane is read for metadata.
      expect(Object.values(selection).every(v => v === 0)).toBe(true);
      return {
        getTileHeight: () => tileShape[0],
        getTileWidth: () => tileShape[1],
        fileDirectory,
      };
    },
  };
}

function createTiffWrapper(pixelSources: any[], pixels: Record<string, unknown> = {}) {
  return new ImageWrapper({
    data: pixelSources,
    metadata: {
      Pixels: {
        DimensionOrder: 'XYZCT',
        Channels: [{ Name: 'A' }, { Name: 'B' }],
        ...pixels,
      },
    },
  } as any, {});
}

function createZarrWrapper(rootAttrs: Record<string, unknown>, pixelSources: any[] = []) {
  return new ImageWrapper({ data: pixelSources, metadata: rootAttrs } as any, {});
}

const zarrAxes = [
  { name: 'c', type: 'channel' },
  { name: 'z', type: 'space', unit: 'micrometer' },
  { name: 'y', type: 'space', unit: 'micrometer' },
  { name: 'x', type: 'space', unit: 'micrometer' },
];

describe('ImageWrapper', () => {
  describe('getSpatialUnit', () => {
    it('gives µm for OME-TIFF, whatever unit the physical sizes are in', () => {
      // The model matrix converts 100 nm to 0.1 scene units, i.e. µm.
      const wrapper = createTiffWrapper([createTiffPixelSource({ shape: [1, 2, 4, 64, 64] })], {
        PhysicalSizeX: 100,
        PhysicalSizeXUnit: 'nm',
        PhysicalSizeY: 100,
        PhysicalSizeYUnit: 'nm',
      });
      expect(wrapper.getSpatialUnit()).toBe('µm');
      expect(wrapper.getSceneMetersPerUnit()).toBe(1e-6);
      expect(wrapper.getVoxelSpacing()[2]).toBeCloseTo(0.1);
    });

    it('gives null for OME-TIFF without physical sizes', () => {
      const wrapper = createTiffWrapper([createTiffPixelSource({ shape: [1, 2, 4, 64, 64] })]);
      expect(wrapper.getSpatialUnit()).toBeNull();
      expect(wrapper.getSceneMetersPerUnit()).toBeNull();
    });

    it('gives the unit of the NGFF x axis for OME-Zarr', () => {
      const wrapper = createZarrWrapper({
        multiscales: [{ axes: zarrAxes, datasets: [{ path: '0' }] }],
        omero: { channels: [] },
      });
      expect(wrapper.getSpatialUnit()).toBe('micrometer');
      expect(wrapper.getSceneMetersPerUnit()).toBe(1e-6);
      const withoutUnits = createZarrWrapper({
        multiscales: [{ axes: ['c', 'z', 'y', 'x'], datasets: [{ path: '0' }] }],
        omero: { channels: [] },
      });
      expect(withoutUnits.getSpatialUnit()).toBeNull();
    });
  });

  describe('getVoxelSpacing', () => {
    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const withModelMatrix = (rootAttrs: Record<string, unknown>, modelMatrix: number[]) => {
      const wrapper = createZarrWrapper(rootAttrs);
      wrapper.modelMatrix = modelMatrix;
      return wrapper;
    };

    it('uses the model matrix for NGFF dataset scales', () => {
      // idr0101A: datasets[0] scale in micrometers, no root-level transform.
      const matrix = [0.108335, 0, 0, 0, 0, 0.108335, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 1];
      expect(withModelMatrix({}, matrix).getVoxelSpacing()).toEqual([0.4, 0.108335, 0.108335]);
      expect(withModelMatrix({}, identity).getVoxelSpacing()).toEqual([1, 1, 1]);
    });

    it('applies the root-level scale of converted datasets', () => {
      // kingsnake: datasets[0] scale is 1, root-level scale doubles Z.
      expect(withModelMatrix({
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 2, 1, 1] }],
      }, identity).getVoxelSpacing()).toEqual([2, 1, 1]);
      // f8ii, melanoma
      expect(withModelMatrix({
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 0.28, 0.14, 0.14] }],
      }, identity).getVoxelSpacing()).toEqual([0.28, 0.14, 0.14]);
    });

    it('computes the model matrix from the NGFF metadata', () => {
      const wrapper = createZarrWrapper({
        multiscales: [{
          axes: zarrAxes,
          datasets: [{ path: '0', coordinateTransformations: [{ type: 'scale', scale: [1, 2, 0.5, 0.5] }] }],
        }],
        omero: { channels: [] },
      });
      expect(wrapper.getVoxelSpacing()).toEqual([2, 0.5, 0.5]);
    });
  });

  describe('getResolutionLevels', () => {
    it('gives each OME-TIFF level its own tile shape as chunks', async () => {
      // As in LS_20x_5_Stitched.pyramid.ome.tiff, coarse levels have smaller
      // tiles, while viv reports level 0's tileSize for all.
      const pixelSources = [
        { yx: [128, 100], tileShape: [64, 64] },
        { yx: [64, 50], tileShape: [48, 48] },
        { yx: [32, 25], tileShape: [20, 12] },
      ].map(({ yx, tileShape }) => createTiffPixelSource({
        shape: [1, 2, 40, ...yx], tileShape: tileShape as [number, number],
      }));
      const levels = await createTiffWrapper(pixelSources).getResolutionLevels();
      expect(levels.map(level => level.chunks)).toEqual([
        [1, 1, 1, 64, 64],
        [1, 1, 1, 48, 48],
        [1, 1, 1, 20, 12],
      ]);
      expect(levels[1]).toMatchObject({
        shape: [1, 2, 40, 64, 50], labels: ['t', 'c', 'z', 'y', 'x'], dtype: 'Uint16',
      });
      expect(levels[1].data).toBe(pixelSources[1]);
      expect(levels[1].scale).toBeUndefined();
    });

    it('gives the zarrita array and dataset scale of each OME-Zarr level', async () => {
      const arrays = [
        { shape: [2, 64, 64, 64], chunks: [1, 32, 64, 64], dtype: '<u2' },
        { shape: [2, 64, 32, 32], chunks: [1, 32, 32, 32], dtype: '<u2' },
      ];
      const pixelSources = arrays.map(array => ({
        labels: ['c', 'z', 'y', 'x'], shape: array.shape, dtype: 'Uint16', _data: array,
      }));
      const wrapper = createZarrWrapper({
        multiscales: [{
          axes: zarrAxes,
          datasets: [
            { path: '0', coordinateTransformations: [{ type: 'scale', scale: [1, 2, 0.5, 0.5] }] },
            { path: '1', coordinateTransformations: [{ type: 'scale', scale: [1, 2, 1, 1] }] },
          ],
        }],
        omero: { channels: [] },
      }, pixelSources);
      const levels = await wrapper.getResolutionLevels();
      expect(levels[0]).toEqual({
        shape: arrays[0].shape,
        labels: ['c', 'z', 'y', 'x'],
        chunks: arrays[0].chunks,
        dtype: 'Uint16',
        scale: [1, 2, 0.5, 0.5],
        data: arrays[0],
      });
      expect(levels[1].scale).toEqual([1, 2, 1, 1]);
    });

    it('leaves the scale undefined when the metadata has none', async () => {
      const array = { shape: [64, 64, 64], chunks: [64, 64, 64] };
      const wrapper = createZarrWrapper({
        multiscales: [{ axes: ['z', 'y', 'x'], datasets: [{ path: '0' }] }],
        omero: { channels: [] },
      }, [{ labels: ['z', 'y', 'x'], shape: array.shape, dtype: 'Uint8', _data: array }]);
      const [level] = await wrapper.getResolutionLevels();
      expect(level.scale).toBeUndefined();
    });
  });

  describe('getChannelWindows', () => {
    it('prefers the OMERO window, then the min/max range', async () => {
      const wrapper = createZarrWrapper({
        multiscales: [{ axes: zarrAxes, datasets: [{ path: '0' }] }],
        omero: {
          channels: [
            { label: 'A', window: { start: 50, end: 800, min: 0, max: 65535 } },
            { label: 'B', window: { min: 0, max: 4095 } },
            { label: 'C' },
            { label: 'D', window: { start: 0, end: 0 } },
          ],
        },
      });
      expect(await wrapper.getChannelWindows())
        .toEqual([[50, 800], [0, 4095], undefined, undefined]);
      expect(wrapper.getChannelObjects()[1].defaultWindow).toEqual([0, 4095]);
    });

    it('uses the sample range recorded in an OME-TIFF for every channel', async () => {
      const pixelSource = createTiffPixelSource({
        shape: [1, 2, 4, 64, 64],
        fileDirectory: { SMinSampleValue: [0, 2], SMaxSampleValue: [50, 66] },
      });
      expect(await createTiffWrapper([pixelSource]).getChannelWindows())
        .toEqual([[0, 66], [0, 66]]);
      const withoutRange = createTiffPixelSource({ shape: [1, 2, 4, 64, 64] });
      expect(await createTiffWrapper([withoutRange]).getChannelWindows())
        .toEqual([undefined, undefined]);
    });
  });

  describe('isInterleaved', () => {
    it('detects viv\'s interleaved _c dimension', () => {
      const rgb = createTiffPixelSource({ labels: ['t', 'c', 'z', 'y', 'x', '_c'], shape: [1, 1, 1, 64, 64, 3] });
      expect(createTiffWrapper([rgb]).isInterleaved()).toBe(true);
    });

    it('is false for images 3 or 4 pixels wide', () => {
      const narrow = createTiffPixelSource({ shape: [1, 2, 4, 64, 3] });
      expect(createTiffWrapper([narrow]).isInterleaved()).toBe(false);
    });
  });
});

describe('readTiffSampleRange', () => {
  const labels = ['t', 'z', 'c', 'y', 'x'];
  const withDirectory = (fileDirectory: Record<string, unknown>) => ({
    labels,
    _indexer: async (selection: Record<string, number>) => (
      Object.values(selection).every(v => v === 0) ? { fileDirectory } : null
    ),
  }) as any;

  it('reads the SMinSampleValue / SMaxSampleValue tags', async () => {
    const source = withDirectory({ SMinSampleValue: [0, 2], SMaxSampleValue: [50, 66] });
    expect(await readTiffSampleRange(source)).toEqual([0, 66]);
  });

  it('falls back to the same keys in the OME-XML original metadata', async () => {
    // As in LuCa-7color_3x3component_data.ome.tif.
    const xml = '<OME><StructuredAnnotations><XMLAnnotation><Value><OriginalMetadata>'
      + '<Key>SMinSampleValue</Key><Value>0</Value></OriginalMetadata></Value></XMLAnnotation>'
      + '<XMLAnnotation><Value><OriginalMetadata><Key>SMaxSampleValue</Key><Value>66</Value>'
      + '</OriginalMetadata></Value></XMLAnnotation></StructuredAnnotations></OME>';
    expect(await readTiffSampleRange(withDirectory({ ImageDescription: xml }))).toEqual([0, 66]);
  });

  it('returns null when no range is recorded or reading fails', async () => {
    expect(await readTiffSampleRange(withDirectory({ ImageDescription: '<OME/>' }))).toBeNull();
    expect(await readTiffSampleRange({
      labels,
      _indexer: async () => { throw new Error('network'); },
    } as any)).toBeNull();
  });
});
