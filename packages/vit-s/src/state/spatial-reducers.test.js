import { describe, it, expect } from 'vitest';
import {
  getMetaScope,
  getMetaScopeBy,
  removeImageChannelInMetaCoordinationScopesHelper,
  addImageChannelInMetaCoordinationScopesHelper,
} from './spatial-reducers.js';

describe('spatial-reducers.js', () => {
  describe('getMetaScope', () => {
    it('works without metaCoordinationScopes', () => {
      expect(getMetaScope(
        {
          obsType: 'A',
        },
        {
          obsType: {
            A: 'cell',
            B: 'molecule',
          },
        },
        'obsType',
      )).toEqual(undefined);
    });
    it('works with one metaCoordinationScopes', () => {
      expect(getMetaScope(
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
        'obsType',
      )).toEqual('metaA');
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getMetaScope(
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
        'obsType',
      )).toEqual('metaB');
    });
  });
  describe('getMetaScopeBy', () => {
    it('works with one metaCoordinationScopesBy', () => {
      expect(getMetaScopeBy(
        {
          metaCoordinationScopesBy: 'metaA',
          spatialSegmentationLayer: ['abc', 'def'],
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
        'spatialSegmentationLayer',
        'spatialTargetC',
        'glomerulus',
      )).toEqual('metaA');
    });
    it('works with multiple metaCoordinationScopes', () => {
      expect(getMetaScopeBy(
        {
          metaCoordinationScopesBy: ['metaA', 'metaB'],
          spatialSegmentationLayer: ['abc', 'def'],
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
        'spatialSegmentationLayer',
        'spatialLayerOpacity',
        'tubule',
      )).toEqual('metaA');
    });
  });
  describe('removeImageChannelInMetaCoordinationScopesHelper', () => {
    it('removes the blue channel from an RGB image when image channels are per-image-layer', () => {
      const coordinationScopesRaw = {
        metaCoordinationScopes: [
          'metaA',
        ],
        metaCoordinationScopesBy: [
          'metaA',
        ],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
        dataset: 'A',
        image: 'A',
        imageChannel: 'A',
        spatialTargetC: 'A',
        spatialLayerVisible: 'A',
        spatialLayerOpacity: 'A',
        spatialLayerColormap: 'A',
        spatialChannelVisible: 'A',
        spatialChannelOpacity: 'A',
        spatialChannelWindow: 'A',
        spatialChannelColor: 'A',
        photometricInterpretation: 'A',
      };
      const layerScope = 'histology';
      const channelScope = 'B';
      const coordinationSpace = {
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              imageChannel: {
                histology: [
                  'R',
                  'G',
                  'B',
                ],
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      };
      const newCoordinationSpace = removeImageChannelInMetaCoordinationScopesHelper(
        coordinationScopesRaw,
        layerScope,
        channelScope,
        coordinationSpace,
      );
      expect(newCoordinationSpace).toEqual({
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              imageChannel: {
                histology: [
                  // The important part
                  'R',
                  'G',
                ],
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      });
    });
    it('removes the blue channel from an RGB image when image channels are per-view', () => {
      const coordinationScopesRaw = {
        metaCoordinationScopes: [
          'metaA',
        ],
        metaCoordinationScopesBy: [
          'metaA',
        ],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
        dataset: 'A',
        image: 'A',
        imageChannel: 'A',
        spatialTargetC: 'A',
        spatialLayerVisible: 'A',
        spatialLayerOpacity: 'A',
        spatialLayerColormap: 'A',
        spatialChannelVisible: 'A',
        spatialChannelOpacity: 'A',
        spatialChannelWindow: 'A',
        spatialChannelColor: 'A',
        photometricInterpretation: 'A',
      };
      const layerScope = 'histology';
      const channelScope = 'B';
      const coordinationSpace = {
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
            imageChannel: [
              'R', 'G', 'B',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      };
      const newCoordinationSpace = removeImageChannelInMetaCoordinationScopesHelper(
        coordinationScopesRaw,
        layerScope,
        channelScope,
        coordinationSpace,
      );
      expect(newCoordinationSpace).toEqual({
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
            imageChannel: [
              'R', 'G',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      });
    });
  });
  describe('addImageChannelInMetaCoordinationScopesHelper', () => {
    it('adds an image channel to an image layer when channels are per-image-layer', () => {
      const coordinationScopesRaw = {
        metaCoordinationScopes: [
          'metaA',
        ],
        metaCoordinationScopesBy: [
          'metaA',
        ],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
        dataset: 'A',
        image: 'A',
        imageChannel: 'A',
        spatialTargetC: 'A',
        spatialLayerVisible: 'A',
        spatialLayerOpacity: 'A',
        spatialLayerColormap: 'A',
        spatialChannelVisible: 'A',
        spatialChannelOpacity: 'A',
        spatialChannelWindow: 'A',
        spatialChannelColor: 'A',
        photometricInterpretation: 'A',
      };
      const layerScope = 'histology';
      const coordinationSpace = {
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              imageChannel: {
                histology: [
                  'R',
                  'G',
                ],
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      };
      const newCoordinationSpace = addImageChannelInMetaCoordinationScopesHelper(
        coordinationScopesRaw,
        layerScope,
        coordinationSpace,
      );
      expect(newCoordinationSpace).toEqual({
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              imageChannel: {
                histology: [
                  'R',
                  'G',
                  'A',
                ],
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
          A: '__dummy__',
        },

        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
          A: 0,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
          A: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
          A: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
          A: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
          A: [
            255,
            255,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      });
    });
    it('adds an image channel to an image layer when channels are per-view', () => {
      const coordinationScopesRaw = {
        metaCoordinationScopes: [
          'metaA',
        ],
        metaCoordinationScopesBy: [
          'metaA',
        ],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
        dataset: 'A',
        image: 'A',
        imageChannel: 'A',
        spatialTargetC: 'A',
        spatialLayerVisible: 'A',
        spatialLayerOpacity: 'A',
        spatialLayerColormap: 'A',
        spatialChannelVisible: 'A',
        spatialChannelOpacity: 'A',
        spatialChannelWindow: 'A',
        spatialChannelColor: 'A',
        photometricInterpretation: 'A',
      };
      const layerScope = 'histology';
      const coordinationSpace = {
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
            imageChannel: [
              'R', 'G',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
        },
        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      };
      const newCoordinationSpace = addImageChannelInMetaCoordinationScopesHelper(
        coordinationScopesRaw,
        layerScope,
        coordinationSpace,
      );
      expect(newCoordinationSpace).toEqual({
        metaCoordinationScopes: {
          metaA: {
            imageLayer: [
              'histology',
            ],
            imageChannel: [
              'R', 'G', 'A',
            ],
          },
        },
        metaCoordinationScopesBy: {
          metaA: {
            imageLayer: {
              image: {
                histology: 'rgb',
              },
              spatialLayerVisible: {
                histology: 'image',
              },
              spatialLayerOpacity: {
                histology: 'image',
              },
              photometricInterpretation: {
                histology: 'rgb',
              },
            },
            imageChannel: {
              spatialTargetC: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelColor: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelVisible: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelOpacity: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
              spatialChannelWindow: {
                R: 'imageR',
                G: 'imageG',
                B: 'imageB',
                A: 'A',
              },
            },
          },
        },
        spatialZoom: {
          A: -4,
        },
        spatialTargetX: {
          A: 10,
        },
        spatialTargetY: {
          A: 20,
        },
        image: {
          rgb: 'S-1905-017737_bf',
        },
        imageLayer: {
          histology: 'histology',
        },
        imageChannel: {
          R: 'R',
          G: 'G',
          B: 'B',
          A: '__dummy__',
        },

        spatialTargetC: {
          imageR: 0,
          imageG: 1,
          imageB: 2,
          A: 0,
        },
        spatialLayerVisible: {
          image: true,
        },
        spatialLayerOpacity: {
          image: 1,
        },
        spatialChannelVisible: {
          imageR: true,
          imageG: true,
          imageB: true,
          A: true,
        },
        spatialChannelOpacity: {
          imageR: 1,
          imageG: 1,
          imageB: 1,
          A: 1,
        },
        spatialChannelWindow: {
          imageR: [
            0,
            255,
          ],
          imageG: [
            0,
            255,
          ],
          imageB: [
            0,
            255,
          ],
          A: [
            0,
            255,
          ],
        },
        spatialChannelColor: {
          imageR: [
            255,
            0,
            0,
          ],
          imageG: [
            0,
            255,
            0,
          ],
          imageB: [
            0,
            0,
            255,
          ],
          A: [
            255,
            255,
            255,
          ],
        },
        photometricInterpretation: {
          rgb: 'RGB',
        },
        dataset: {
          A: 'S-1905-017737',
        },
        spatialLayerColormap: {
          A: null,
        },
      });
    });
  });
});
