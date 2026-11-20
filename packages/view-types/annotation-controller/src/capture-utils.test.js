import { describe, it, expect } from 'vitest';
import { ViewType } from '@vitessce/constants-internal';
import {
  getCapturableCoordinationTypes,
  getCaptureCategories,
  getDefaultCaptureCoordinationTypes,
} from './capture-utils.js';

const COMPONENTS = [ViewType.SCATTERPLOT, ViewType.SPATIAL, ViewType.SPATIAL_BETA];

describe('capture-utils', () => {
  it('only includes the coordination types supported by the view, omitting empty categories', () => {
    const categories = getCaptureCategories(ViewType.SCATTERPLOT);
    const keys = categories.map(category => category.key);
    expect(keys).toContain('embeddingPanZoom');
    expect(keys).not.toContain('spatialPanZoom');
    expect(keys).not.toContain('imageLayers');
    categories.forEach((category) => {
      expect(category.coordinationTypes.length).toBeGreaterThan(0);
    });
  });

  it('places every capturable coordination type into at least one category', () => {
    COMPONENTS.forEach((component) => {
      const categorizedTypes = getCaptureCategories(component)
        .flatMap(category => category.coordinationTypes);
      expect(new Set(categorizedTypes)).toEqual(new Set(getCapturableCoordinationTypes(component)));
    });
  });

  it('includes the shared spatial layer types in each layer category', () => {
    const categories = getCaptureCategories(ViewType.SPATIAL_BETA);
    ['imageLayers', 'segmentationLayers', 'spotLayers', 'pointLayers'].forEach((key) => {
      const category = categories.find(c => c.key === key);
      expect(category.coordinationTypes).toContain('spatialLayerOpacity');
    });
  });

  it('excludes data types from capture', () => {
    COMPONENTS.forEach((component) => {
      const types = getCapturableCoordinationTypes(component);
      expect(types).not.toContain('obsType');
      expect(types).not.toContain('fileUid');
    });
  });

  it('selects the types of the default categories by default', () => {
    const types = getDefaultCaptureCoordinationTypes(ViewType.SPATIAL);
    expect(types).toContain('spatialZoom');
    expect(types).toContain('spatialImageLayer');
    expect(types).not.toContain('obsSetSelection');
    expect(new Set(types).size).toBe(types.length);
  });
});
