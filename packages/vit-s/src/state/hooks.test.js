import { describe, it, expect } from 'vitest';
import {
  getParameterScope,
  getParameterScopeBy,
  getScopes,
  getScopesBy,
} from './hooks.js';

describe('vit-s/state/hooks.js', () => {
  describe('getParameterScope', () => {
    it('works', () => {
      expect(getParameterScope(
        'obsType',
        {
          obsType: 'A',
        },
      )).toEqual('A');
    });
  });
  describe('getParameterScopeBy', () => {
    it('works', () => {
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
  });
  describe('getScopes', () => {
    it('works without metaCoordinationScopes', () => {
      expect(getScopes(
        {
          obsType: 'A',
        },
        null,
      )).toEqual({
        obsType: 'A',
      });
    });
    it('works with one metaCoordinationScopes', () => {
      expect(getScopes(
        {
          // meta match should take precedence
          metaCoordinationScopes: 'metaA',
          obsType: 'A',
        },
        {
          metaA: {
            obsType: 'B',
          },
        },
      )).toEqual({
        // meta match should take precedence
        metaCoordinationScopes: 'metaA',
        obsType: 'B',
      });
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getScopes(
        {
          // first meta match should take precedence
          metaCoordinationScopes: ['metaA', 'metaB'],
          obsType: 'A',
        },
        {
          metaA: {
            featureType: 'D',
          },
          metaB: {
            obsType: 'C',
          },
        },
      )).toEqual({
        // first meta match should take precedence
        metaCoordinationScopes: ['metaA', 'metaB'],
        featureType: 'D',
        obsType: 'C',
      });
    });
  });
  describe('getScopesBy', () => {
    it('works with one metaCoordinationScopesBy', () => {
      expect(getScopesBy(
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
          metaA: {
            spatialSegmentationLayer: {
              spatialTargetC: {
                glomerulus: 'A',
                tubule: 'B',
              },
            },
          },
        },
      )).toEqual({
        spatialSegmentationLayer: {
          spatialTargetC: {
            glomerulus: 'A',
            tubule: 'B',
          },
        },
      });
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getScopesBy(
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
      )).toEqual({
        spatialSegmentationLayer: {
          spatialLayerOpacity: {
            glomerulus: 'C',
            tubule: 'D',
          },
          spatialTargetC: {
            glomerulus: 'A',
            tubule: 'B',
          },
        },
      });
    });
  });
});
