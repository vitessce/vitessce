import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';
import { hasAnnotationControllerView, addAnnotationControllerView } from './cvh-utils.js';

function makeConfig() {
  return {
    version: '1.0.18',
    name: 'Test',
    coordinationSpace: { annotationStory: { S: null } },
    layout: [
      { uid: 'spatial', component: 'spatial', coordinationScopes: { annotationStory: 'S' }, x: 0, y: 0, w: 6, h: 12 },
      { uid: 'layers', component: 'layerController', x: 6, y: 0, w: 3, h: 6 },
      { uid: 'sets', component: 'obsSets', x: 6, y: 6, w: 6, h: 6 },
      { uid: 'genes', component: 'featureList', x: 9, y: 0, w: 3, h: 6 },
    ],
  };
}

function isWholeNumberInGrid(view) {
  return [view.x, view.y, view.w, view.h].every(Number.isInteger)
    && view.x >= 0 && view.w >= 1 && view.x + view.w <= 12
    && view.y >= 0 && view.h >= 1 && view.y + view.h <= 12;
}

function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe('hasAnnotationControllerView', () => {
  it('detects whether an annotationController view exists', () => {
    const config = makeConfig();
    expect(hasAnnotationControllerView(config)).toBe(false);
    expect(hasAnnotationControllerView(addAnnotationControllerView(config))).toBe(true);
    expect(hasAnnotationControllerView({})).toBe(false);
  });
});

describe('addAnnotationControllerView', () => {
  it('appends a full-height annotationController on the right', () => {
    const result = addAnnotationControllerView(makeConfig());
    expect(result.layout.at(-1)).toEqual({
      uid: 'annotation-controller',
      component: 'annotationController',
      coordinationScopes: { annotationStory: 'S' },
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    });
  });

  it('fits all views into the grid without overlaps', () => {
    const { layout } = addAnnotationControllerView(makeConfig(), { width: 4 });
    layout.forEach(view => expect(isWholeNumberInGrid(view)).toBe(true));
    layout.forEach((a, i) => layout.slice(i + 1).forEach(b => expect(overlaps(a, b)).toBe(false)));
    // Adjacent views remain adjacent.
    const spatial = layout.find(v => v.uid === 'spatial');
    const layers = layout.find(v => v.uid === 'layers');
    expect(spatial.x + spatial.w).toEqual(layers.x);
  });

  it('keeps every view at least one column wide', () => {
    const config = {
      layout: Array.from({ length: 12 }, (_, i) => ({ uid: `v${i}`, component: 'description', x: i, y: 0, w: 1, h: 12 })),
    };
    const { layout } = addAnnotationControllerView(config);
    layout.forEach(view => expect(view.w).toBeGreaterThanOrEqual(1));
    layout.forEach(view => expect(view.x + view.w).toBeLessThanOrEqual(12));
  });

  it('uses a unique uid and does not modify the input config', () => {
    const config = makeConfig();
    config.layout[0].uid = 'annotation-controller';
    const before = cloneDeep(config);
    const result = addAnnotationControllerView(config);
    expect(result.layout.at(-1).uid).toEqual('annotation-controller-1');
    expect(config).toEqual(before);
  });

  it('rejects invalid widths', () => {
    expect(() => addAnnotationControllerView(makeConfig(), { width: 0 })).toThrow();
    expect(() => addAnnotationControllerView(makeConfig(), { width: 12 })).toThrow();
    expect(() => addAnnotationControllerView(makeConfig(), { width: 2.5 })).toThrow();
  });
});
