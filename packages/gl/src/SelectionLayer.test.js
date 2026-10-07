import { describe, it, expect, vi } from 'vitest';
import { quadtree } from 'd3-quadtree';
import SelectionLayer from './SelectionLayer.js';

function makeObsLayer(points) {
  const getObsCoords = i => points[i];
  return {
    getObsCoords,
    obsIndex: points.map((_, i) => `cell-${i}`),
    // Like the UMAP view, store observation indices as the quadtree's data.
    obsQuadTree: quadtree()
      .x(i => points[i][0])
      .y(i => points[i][1])
      .addAll(points.map((_, i) => i)),
    onSelect: vi.fn(),
  };
}

function select(points, coordinates, flipY = false) {
  const obsLayer = makeObsLayer(points);
  const layer = new SelectionLayer({ id: 'test', obsLayers: [obsLayer], flipY });
  // eslint-disable-next-line no-underscore-dangle
  layer._selectPolygonObjects(coordinates);
  expect(obsLayer.onSelect).toHaveBeenCalledTimes(1);
  return obsLayer.onSelect.mock.calls[0][0];
}

describe('SelectionLayer polygon selection', () => {
  it('includes observation zero, coincident observations and points on the boundary', () => {
    const points = [[1, 1], [0, 0], [2, 1], [1, 2], [1, 0], [0, 1], [3, 3], [1, 1]];
    expect(new Set(select(points, [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]])))
      .toEqual(new Set(['cell-0', 'cell-1', 'cell-2', 'cell-3', 'cell-4', 'cell-5', 'cell-7']));
  });

  it('selects a lone observation with index zero', () => {
    expect(select([[1, 1]], [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]))
      .toEqual(['cell-0']);
  });

  it('checks the actual outline of a concave polygon', () => {
    const points = [[4, 4], [0.5, 2], [2, 0.5], [2, 2], [1, 1], [-1, 1]];
    const outline = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3], [0, 0]];
    expect(new Set(select(points, [outline])))
      .toEqual(new Set(['cell-1', 'cell-2', 'cell-4']));
  });

  it('excludes holes while retaining their boundary', () => {
    const points = [[5, 5], [0.5, 2], [2, 2], [1, 2]];
    const coordinates = [
      [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]],
      [[1, 1], [1, 3], [3, 3], [3, 1], [1, 1]],
    ];
    expect(new Set(select(points, coordinates))).toEqual(new Set(['cell-1', 'cell-3']));
  });

  it('flips the outline for embedding coordinates and accepts typed point coordinates', () => {
    const points = [new Float32Array([1, -2]), new Float32Array([1, 2])];
    expect(select(points, [[[0, 1], [2, 1], [2, 3], [0, 3], [0, 1]]], true))
      .toEqual(['cell-0']);
  });

  it('applies independent results to every layer, including layers without a quadtree', () => {
    const inside = makeObsLayer([[1, 1]]);
    const outside = makeObsLayer([[5, 5]]);
    const missing = { obsQuadTree: null, onSelect: vi.fn() };
    const layer = new SelectionLayer({ id: 'test', obsLayers: [inside, outside, missing] });
    // eslint-disable-next-line no-underscore-dangle
    layer._selectPolygonObjects([[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]);
    expect(inside.onSelect).toHaveBeenCalledWith(['cell-0']);
    expect(outside.onSelect).toHaveBeenCalledWith([]);
    expect(missing.onSelect).toHaveBeenCalledWith([]);
  });

  it('selects over 50,000 observations without a multi-second hit test', () => {
    const side = 256;
    const points = Array.from({ length: side * side }, (_, i) => [i % side, Math.floor(i / side)]);
    const ring = Array.from({ length: 32 }, (_, i) => {
      const angle = i * 2 * Math.PI / 32;
      return [127.5 + 151 * Math.cos(angle), 127.5 + 151 * Math.sin(angle)];
    });
    ring.push(ring[0]);
    const obsLayer = makeObsLayer(points);
    const layer = new SelectionLayer({ id: 'test', obsLayers: [obsLayer] });
    const start = performance.now();
    // eslint-disable-next-line no-underscore-dangle
    layer._selectPolygonObjects([ring]);
    const elapsed = performance.now() - start;
    expect(obsLayer.onSelect.mock.calls[0][0].length).toBeGreaterThan(50000);
    // The original node-by-node polygon intersections take several seconds.
    // Keep ample headroom for CI; the bounding-box traversal takes milliseconds.
    expect(elapsed).toBeLessThan(1500);
  });
});
