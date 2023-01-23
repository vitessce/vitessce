import {
  getParameterScope,
  getParameterScopeBy,
} from './hooks';

describe('vit-s/state/hooks.js', () => {
  describe('getParameterScope', () => {
    it('works without metaCoordinationScopes', () => {
      expect(getParameterScope(
        'obsType',
        {
          obsType: 'A',
        },
        {
          obsType: {
            A: 'cell',
            B: 'molecule',
          },
        },
      )).toEqual('A');
    });
    it('works with one metaCoordinationScopes', () => {
      expect(getParameterScope(
        'obsType',
        {
          // meta match should take precedence
          metaCoordinationScopes: 'metaA',
          obsType: 'A',
        },
        {
          obsType: {
            A: 'cell',
            B: 'molecule',
          },
          metaCoordinationScopes: {
            metaA: {
              obsType: 'B',
            },
          },
        },
      )).toEqual('B');
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getParameterScope(
        'obsType',
        {
          // first meta match should take precedence
          metaCoordinationScopes: ['metaA', 'metaB'],
          obsType: 'A',
        },
        {
          obsType: {
            A: 'cell',
            B: 'molecule',
          },
          metaCoordinationScopes: {
            metaA: {
              featureType: 'D',
            },
            metaB: {
              obsType: 'C',
            },
          },
        },
      )).toEqual('C');
    });
  });
  describe('getParameterScopeBy', () => {
    it('works without metaCoordinationScopesBy', () => {
      expect(getParameterScopeBy(
        'spatialTargetC',
        'spatialSegmentationLayer',
        'glomerulus',
        {
          spatialSegmentationLayer: ['glomerulus', 'tubule'],
        },
        {
          spatialSegmentationLayer: {
            spatialTargetC: {
              glomerulus: 'A',
              tubule: 'B',
            },
          },
        },
        {
          spatialSegmentationLayer: {
            glomerulus: 'glomerulus',
            tubule: 'tubule',
          },
          spatialTargetC: {
            A: 1,
            B: 2,
          },
        },
      )).toEqual('A');
    });
    it('works with one metaCoordinationScopesBy', () => {
      expect(getParameterScopeBy(
        'spatialTargetC',
        'spatialSegmentationLayer',
        'glomerulus',
        {
          metaCoordinationScopesBy: 'metaA',
          spatialSegmentationLayer: ['abc', 'def'],
        },
        {
          spatialSegmentationLayer: {
            spatialTargetC: {
              glomerulus: 'ghi',
              tubule: 'jkl',
            },
          },
        },
        {
          spatialSegmentationLayer: {
            glomerulus: 'glomerulus',
            tubule: 'tubule',
          },
          spatialTargetC: {
            A: 1,
            B: 2,
          },
          metaCoordinationScopesBy: {
            metaA: {
              spatialSegmentationLayer: {
                spatialTargetC: {
                  glomerulus: 'A',
                  tubule: 'B',
                },
              },
            },
          },
        },
      )).toEqual('A');
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getParameterScopeBy(
        'spatialTargetC',
        'spatialSegmentationLayer',
        'glomerulus',
        {
          metaCoordinationScopesBy: ['metaA', 'metaB'],
          spatialSegmentationLayer: ['abc', 'def'],
        },
        {
          spatialSegmentationLayer: {
            spatialTargetC: {
              glomerulus: 'ghi',
              tubule: 'jkl',
            },
          },
        },
        {
          spatialSegmentationLayer: {
            glomerulus: 'glomerulus',
            tubule: 'tubule',
          },
          spatialTargetC: {
            A: 1,
            B: 2,
          },
          metaCoordinationScopesBy: {
            metaA: {
              spatialSegmentationLayer: {
                spatialLayerOpacity: {
                  glomerulus: 'C',
                  tubule: 'D',
                },
              },
            },
            metaB: {
              spatialSegmentationLayer: {
                spatialTargetC: {
                  glomerulus: 'A',
                  tubule: 'B',
                },
              },
            },
          },
        },
      )).toEqual('A');
    });
  });
});
