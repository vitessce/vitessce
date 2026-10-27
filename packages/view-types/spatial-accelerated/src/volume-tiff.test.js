import { describe, it, expect } from 'vitest';
import * as zarr from 'zarrita';
import {
  createVolumeBrickSource,
  planVolumeLevels,
  decodedBytesPerBrick,
  getBytesPerElement,
} from './volume-zarr.js';
import { getTiffLevelArrays, createTiffRegionReader, getTiffSampleRange } from './volume-tiff.js';
import { _getVolumeSources } from './VolumeDataManager.js';

const value = (c, z, y, x) => (z * 7 + y * 3 + x + c * 100) % 4000;

// Mimics viv's TiffPixelSource: getTile reads one tile of one plane, and tiles
// at the right and bottom edges are clipped to the image.
function createMockPixelSource({ labels, shape, tileSize }) {
  const size = axis => shape[labels.indexOf(axis)];
  const pixelSource = {
    labels,
    shape,
    tileSize,
    dtype: 'Uint16',
    tileReads: 0,
    async getTile({ x, y, selection }) {
      pixelSource.tileReads += 1;
      const width = Math.min(tileSize, size('x') - x * tileSize);
      const height = Math.min(tileSize, size('y') - y * tileSize);
      const data = new Uint16Array(width * height);
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          data[row * width + column] = value(
            selection.c, selection.z, y * tileSize + row, x * tileSize + column,
          );
        }
      }
      return { data, width, height };
    },
  };
  return pixelSource;
}

// The same voxels as a zarrita array (TCZYX).
async function createZarrArray(shape, chunkShape) {
  const array = await zarr.create(zarr.root(new Map()).resolve('a'), { shape, chunkShape, dtype: 'uint16' });
  const [, nc, nz, ny, nx] = shape;
  const data = new Uint16Array(nc * nz * ny * nx);
  let i = 0;
  for (let c = 0; c < nc; c++) {
    for (let z = 0; z < nz; z++) {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) data[i++] = value(c, z, y, x);
      }
    }
  }
  const stride = shape.map((_, axis) => shape.slice(axis + 1).reduce((a, b) => a * b, 1));
  await zarr.set(array, null, { data, shape, stride });
  return array;
}

const withDataShape = level => ({ ...level, dataShape: level.shape });

describe('volume-tiff', () => {
  describe('getTiffLevelArrays', () => {
    it('describes each level with its tiles as chunks, in label order', () => {
      const pixelSources = [
        createMockPixelSource({ labels: ['t', 'z', 'c', 'y', 'x'], shape: [1, 1955, 2, 2048, 1758], tileSize: 256 }),
        createMockPixelSource({ labels: ['t', 'z', 'c', 'y', 'x'], shape: [1, 1955, 2, 1024, 879], tileSize: 256 }),
      ];
      const arrays = getTiffLevelArrays(pixelSources);
      expect(arrays[0]).toMatchObject({ shape: [1, 1955, 2, 2048, 1758], chunks: [1, 1, 1, 256, 256], dtype: 'Uint16' });
      expect(arrays[1].pixelSource).toBe(pixelSources[1]);
    });

    it('rejects interleaved RGB images', () => {
      const rgb = createMockPixelSource({ labels: ['t', 'c', 'z', 'y', 'x'], shape: [1, 1, 1, 64, 64, 3], tileSize: 64 });
      expect(() => getTiffLevelArrays([rgb])).toThrow(/Interleaved/);
    });
  });

  describe('bricks from TIFF tiles', () => {
    const levels = [
      { zFactor: 1, zMode: 'native' },
      { zFactor: 3, zMode: 'sample' },
      { zFactor: 3, zMode: 'mean' },
      { zFactor: 3, zMode: 'max' },
      { zFactor: 3, zMode: 'mean', yFactor: 2, xFactor: 2 }, // overview-style XY reduction
    ].map(({ zFactor, yFactor = 1, xFactor = 1, ...level }) => withDataShape({
      ...level,
      source: 0,
      sourceDepth: 70,
      zFactor,
      yFactor,
      xFactor,
      shape: [Math.ceil(70 / zFactor), Math.ceil(45 / yFactor), Math.ceil(50 / xFactor)],
    }));
    // Interior and edge bricks of every level, for both channels.
    const reads = levels.flatMap((level, levelIndex) => [
      [0, 0, 0], level.shape.map(size => Math.ceil(size / 32) - 1),
    ].flatMap(([bz, by, bx]) => [0, 1].map(c => ({
      level: levelIndex, c, bx, by, bz,
    }))));

    it.each([
      ['tczyx', ['t', 'c', 'z', 'y', 'x'], [1, 2, 70, 45, 50]],
      ['tzcyx (XYCZT)', ['t', 'z', 'c', 'y', 'x'], [1, 70, 2, 45, 50]],
    ])('match bricks read from the same voxels as Zarr (%s)', async (name, labels, shape) => {
      // Tiles of 20 do not align with 32-voxel bricks, and edge tiles are clipped.
      const pixelSource = createMockPixelSource({ labels, shape, tileSize: 20 });
      const tiffSource = createVolumeBrickSource({
        arrays: getTiffLevelArrays([pixelSource]),
        levels,
        labels,
        createRegionReader: createTiffRegionReader,
      });
      const zarrLabels = ['t', 'c', 'z', 'y', 'x'];
      const zarrSource = createVolumeBrickSource({
        arrays: [await createZarrArray([1, 2, 70, 45, 50], [1, 1, 16, 16, 16])],
        levels,
        labels: zarrLabels,
      });
      const [tiffBricks, zarrBricks] = await Promise.all([tiffSource, zarrSource].map(
        source => Promise.all(reads.map(read => source.readBrick(read))),
      ));
      reads.forEach((read, i) => {
        expect(tiffBricks[i].data).toBeInstanceOf(Uint16Array);
        expect(tiffBricks[i].valid).toEqual(zarrBricks[i].valid);
        const mismatch = tiffBricks[i].data.findIndex((v, j) => v !== zarrBricks[i].data[j]);
        expect({ ...read, mismatch }).toEqual({ ...read, mismatch: -1 });
      });
    });

    it('decodes each tile once for neighboring bricks', async () => {
      const labels = ['t', 'c', 'z', 'y', 'x'];
      // One 64 x 64 tile per plane holds 2 x 2 bricks.
      const pixelSource = createMockPixelSource({
        labels, shape: [1, 1, 32, 64, 64], tileSize: 64,
      });
      const source = createVolumeBrickSource({
        arrays: getTiffLevelArrays([pixelSource]),
        levels: [withDataShape({
          source: 0, sourceDepth: 32, zFactor: 1, zMode: 'native', shape: [32, 64, 64],
        })],
        labels,
        createRegionReader: createTiffRegionReader,
      });
      await Promise.all([[0, 0], [1, 0], [0, 1], [1, 1]].map(
        ([bx, by]) => source.readBrick({ level: 0, bx, by, bz: 0 }),
      ));
      expect(pixelSource.tileReads).toBe(32);
    });
  });

  describe('planning OME-TIFF pyramids', () => {
    it('plans brain.pyramid.ome.tif with an affordable level 0 and a one-brick overview', () => {
      // XYCZT, 1758 x 2048 x 1955, 2 channels, 256 x 256 tiles, 4 levels.
      const labels = ['t', 'z', 'c', 'y', 'x'];
      const pixelSources = [[2048, 1758], [1024, 879], [512, 440], [256, 220]].map(
        ([y, x]) => createMockPixelSource({ labels, shape: [1, 1955, 2, y, x], tileSize: 256 }),
      );
      const arrays = getTiffLevelArrays(pixelSources);
      // XY 4.47 um, Z 2.58 um: Z reduction starts at level 1.
      const levels = planVolumeLevels({ arrays, labels, spacing: [2.58, 4.47, 4.47] });
      expect(levels.map(l => l.zFactor)).toEqual([1, 3, 6, 13, 62]);
      expect(levels.at(-1)).toMatchObject({ isOverview: true });
      expect(levels.at(-1).shape.every(size => size <= 32)).toBe(true);
      const bytesPerElement = getBytesPerElement(arrays[0].dtype);
      // 32 planes of one 256 x 256 uint16 tile.
      expect(decodedBytesPerBrick(levels[0], arrays[0], labels, bytesPerElement))
        .toBe(32 * 256 * 256 * 2);
    });
  });

  describe('getTiffSampleRange', () => {
    const labels = ['t', 'z', 'c', 'y', 'x'];
    const withDirectory = fileDirectory => ({
      labels,
      // eslint-disable-next-line no-underscore-dangle
      _indexer: async selection => (
        Object.values(selection).every(v => v === 0) ? { fileDirectory } : null
      ),
    });

    it('reads the SMinSampleValue / SMaxSampleValue tags', async () => {
      const source = withDirectory({ SMinSampleValue: [0, 2], SMaxSampleValue: [50, 66] });
      expect(await getTiffSampleRange(source)).toEqual([0, 66]);
    });

    it('falls back to the same keys in the OME-XML original metadata', async () => {
      // As in LuCa-7color_3x3component_data.ome.tif.
      const xml = '<OME><StructuredAnnotations><XMLAnnotation><Value><OriginalMetadata>'
        + '<Key>SMinSampleValue</Key><Value>0</Value></OriginalMetadata></Value></XMLAnnotation>'
        + '<XMLAnnotation><Value><OriginalMetadata><Key>SMaxSampleValue</Key><Value>66</Value>'
        + '</OriginalMetadata></Value></XMLAnnotation></StructuredAnnotations></OME>';
      expect(await getTiffSampleRange(withDirectory({ ImageDescription: xml }))).toEqual([0, 66]);
    });

    it('returns null when no range is recorded or reading fails', async () => {
      expect(await getTiffSampleRange(withDirectory({ ImageDescription: '<OME/>' }))).toBeNull();
      expect(await getTiffSampleRange({
        labels,
        _indexer: async () => { throw new Error('network'); },
      })).toBeNull();
    });
  });

  describe('getBytesPerElement', () => {
    it('reads v2 Zarr dtype strings and viv TIFF dtype names', () => {
      expect(['|u1', '<u2', '>u2', '<f4', '<f8', 'Uint8', 'Uint16', 'Float32'].map(getBytesPerElement))
        .toEqual([1, 2, 2, 4, 8, 1, 2, 4]);
    });
  });

  describe('_getVolumeSources', () => {
    it('reads OME-TIFF levels from the viv pixel sources', () => {
      const labels = ['t', 'c', 'z', 'y', 'x'];
      const pixelSource = createMockPixelSource({
        labels, shape: [1, 3, 401, 4255, 4992], tileSize: 512,
      });
      const sources = _getVolumeSources({
        getType: () => 'ome-tiff',
        vivLoader: { data: [pixelSource], metadata: { Pixels: {} } },
      });
      expect(sources.labels).toEqual(labels);
      expect(sources.datasets).toEqual([]);
      expect(sources.arrays[0].chunks).toEqual([1, 1, 1, 512, 512]);
      expect(sources.createRegionReader).toBe(createTiffRegionReader);
    });

    it('reads OME-Zarr levels from the zarrita arrays', () => {
      const array = { shape: [1, 1, 32, 32, 32], chunks: [1, 1, 32, 32, 32] };
      const datasets = [{ path: '0' }];
      const sources = _getVolumeSources({
        getType: () => 'ome-zarr',
        getData: () => [{ labels: ['t', 'c', 'z', 'y', 'x'], _data: array }],
        vivLoader: { metadata: { multiscales: [{ datasets }], omero: {} } },
      });
      expect(sources.arrays).toEqual([array]);
      expect(sources.datasets).toBe(datasets);
    });

    it('rejects other image types', () => {
      expect(() => _getVolumeSources(undefined)).toThrow(/OME-Zarr or OME-TIFF/);
    });
  });
});
