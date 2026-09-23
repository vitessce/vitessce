import { describe, it, expect } from 'vitest';
import AnnotationLayer from './AnnotationLayer.js';

function renderSubLayers(props, zoom = 0) {
  const layer = new AnnotationLayer({ id: 'annotations', ...props });
  layer.context = { viewport: { zoom } };
  return layer.renderLayers();
}

describe('AnnotationLayer', () => {
  it('renders no sublayers when given no shapes', () => {
    expect(renderSubLayers({ data: [] })).toHaveLength(0);
  });

  it('prefixes sublayer IDs with the parent layer ID', () => {
    const data = [{ uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }];
    const layers = renderSubLayers({ data });
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe('annotations-annotation-rect-r1-0');
  });

  it('skips shapes with visible: false', () => {
    const data = [
      { uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 10, height: 10, visible: false },
      { uid: 'r2', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 },
    ];
    const layers = renderSubLayers({ data });
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toContain('r2');
  });

  it('multiplies the parent opacity with the sublayer opacity', () => {
    const data = [{ uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }];
    const layers = renderSubLayers({ data, opacity: 0.5 });
    expect(layers[0].props.opacity).toBeCloseTo(0.5);
  });

  it('preserves the PathStyleExtension of dashed sublayers', () => {
    const data = [{ uid: 'p1', type: 'polyline', points: [[0, 0], [10, 10]], strokeDashArray: '4 2' }];
    const layers = renderSubLayers({ data });
    expect(layers[0].props.extensions).toHaveLength(1);
    expect(layers[0].props.getDashArray).toEqual([4, 2]);
  });

  it('renders shapes as dots when zoomed far out relative to authoredZoom', () => {
    const data = [{ uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }];
    const layers = renderSubLayers({ data, authoredZoom: 0 }, -2);
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe('annotations-annotation-dots');
  });

  it('renders full geometry when semanticZoom is false', () => {
    const data = [{ uid: 'r1', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }];
    const layers = renderSubLayers({ data, authoredZoom: 0, semanticZoom: false }, -2);
    expect(layers[0].id).toBe('annotations-annotation-rect-r1-0');
  });

  it('renders a preview sublayer for an in-progress shape', () => {
    const layers = renderSubLayers({
      data: [],
      inProgressShape: { type: 'line', vertices: [[0, 0]] },
      hoverCoord: [5, 5],
    });
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe('annotations-annotation-preview-line');
  });
});
