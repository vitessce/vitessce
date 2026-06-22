import { describe, it, expect } from 'vitest';
import { computeArrowhead, createAnnotationLayers } from './annotation-layer-utils.js';

describe('computeArrowhead', () => {
  it('returns null for a zero-length direction vector', () => {
    expect(computeArrowhead(0, 0, 0, 0, 10)).toBeNull();
  });

  it('places the tip at (tipX, tipY) for a rightward line', () => {
    // Line pointing right: dir = (1, 0)
    const triangle = computeArrowhead(10, 0, 1, 0, 4);
    expect(triangle).not.toBeNull();
    // First vertex is the tip
    expect(triangle[0]).toEqual([10, 0]);
  });

  it('produces a triangle whose base is perpendicular to the direction', () => {
    // Rightward arrow: base vertices should differ only in Y (perpendicular axis)
    const size = 4;
    const triangle = computeArrowhead(10, 0, 1, 0, size);
    const [, p1, p2] = triangle;
    // Both base points share the same X (base is at tip - size along X)
    expect(p1[0]).toBeCloseTo(10 - size, 5);
    expect(p2[0]).toBeCloseTo(10 - size, 5);
    // Base points are symmetric around Y = 0
    expect(p1[1]).toBeCloseTo(-p2[1], 5);
  });
});

describe('createAnnotationLayers', () => {
  it('returns an empty array when given no shapes', () => {
    expect(createAnnotationLayers([], 0)).toHaveLength(0);
  });

  it('returns a PolygonLayer for a rectangle with fillOpacity: 0 (not filled)', () => {
    const shapes = [{ uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 100, height: 50, fillOpacity: 0 }];
    const layers = createAnnotationLayers(shapes, 0);
    expect(layers).toHaveLength(1);
    expect(layers[0].props.filled).toBe(false);
  });

  it('returns a PolygonLayer that is filled when fillOpacity > 0', () => {
    const shapes = [{ uid: 'r2', type: 'rectangle', x: 0, y: 0, width: 100, height: 50, fillOpacity: 0.5 }];
    const layers = createAnnotationLayers(shapes, 0);
    expect(layers[0].props.filled).toBe(true);
  });

  it('returns a LineLayer plus an arrowhead PolygonLayer for a line with markerEnd: Arrow', () => {
    const shapes = [{ uid: 'l1', type: 'line', x1: 0, y1: 0, x2: 10, y2: 0, markerEnd: 'Arrow' }];
    const layers = createAnnotationLayers(shapes, 0);
    // LineLayer (shaft) + PolygonLayer (arrowhead)
    expect(layers).toHaveLength(2);
  });

  it('returns shaft + two arrowhead layers for markerStart and markerEnd', () => {
    const shapes = [{ uid: 'l2', type: 'line', x1: 0, y1: 0, x2: 10, y2: 0, markerStart: 'Arrow', markerEnd: 'Arrow' }];
    const layers = createAnnotationLayers(shapes, 0);
    expect(layers).toHaveLength(3);
  });

  it('scales arrowhead size with zoom (larger at negative zoom)', () => {
    // ARROW_SCREEN_PX=14, strokeWidth=1 so arrowScreenPx = max(14, 4) = 14
    // zoom=0 → arrowDataSize = 14 / 2^0 = 14
    // zoom=-3 → arrowDataSize = 14 / 2^(-3) = 14 * 8 = 112
    const shape = { uid: 'l3', type: 'line', x1: 0, y1: 0, x2: 1000, y2: 0, markerEnd: 'Arrow' };

    const layersZoom0 = createAnnotationLayers([shape], 0);
    const layersZoomNeg3 = createAnnotationLayers([shape], -3);

    const arrowAt0 = layersZoom0[1]; // arrowhead PolygonLayer
    const arrowAtNeg3 = layersZoomNeg3[1];

    // The arrowhead data (polygon vertices) should be further from the tip at zoom=-3
    const tip0 = arrowAt0.props.data[0].polygon[0];
    const base0 = arrowAt0.props.data[0].polygon[1];
    const tip3 = arrowAtNeg3.props.data[0].polygon[0];
    const base3 = arrowAtNeg3.props.data[0].polygon[1];

    const size0 = Math.abs(tip0[0] - base0[0]);
    const size3 = Math.abs(tip3[0] - base3[0]);
    expect(size3).toBeGreaterThan(size0);
  });
});
