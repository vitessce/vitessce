import { describe, it, expect } from 'vitest';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  VitessceConfig,
  hconcat,
  vconcat,
  CL,
} from './VitessceConfig.js';

describe('src/api/VitessceConfig.js', () => {
  describe('VitessceConfig', () => {
    it('can be instantiated in the old way for backwards compatibility', () => {
      const config = new VitessceConfig('My config');

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {},
        datasets: [],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.7',
      });
    });
    it('can be instantiated', () => {
      const config = new VitessceConfig({ schemaVersion: '1.0.4', name: 'My config' });

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {},
        datasets: [],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.4',
      });
    });
    it('can add a dataset', () => {
      const config = new VitessceConfig({ schemaVersion: '1.0.4', name: 'My config' });
      config.addDataset('My dataset');

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.4',
      });
    });
    it('can add a file to a dataset in the old way for backwards compatibility', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
        description: 'My config description',
      });
      // Positional arguments.
      config.addDataset('My dataset', 'My dataset description').addFile(
        'http://example.com/cells.json',
        'cells',
        'cells.json',
      );

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          description: 'My dataset description',
          uid: 'A',
          files: [{
            url: 'http://example.com/cells.json',
            fileType: 'cells.json',
          }],
        }],
        description: 'My config description',
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.4',
      });
    });
    it('can add a file to a dataset', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
        description: 'My config description',
      });
      // Named arguments.
      config.addDataset('My dataset', 'My dataset description').addFile({
        url: 'http://example.com/cells.json',
        fileType: 'cells.json',
      });

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          description: 'My dataset description',
          uid: 'A',
          files: [{
            url: 'http://example.com/cells.json',
            fileType: 'cells.json',
          }],
        }],
        description: 'My config description',
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.4',
      });
    });

    it('can add a view', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');
      config.addView(dataset, 'description');
      config.addView(dataset, 'scatterplot', { mapping: 'PCA' });

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            component: 'description',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '1.0.4',
      });
    });
    it('can add a coordination scope', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');
      const pca = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const tsne = config.addView(dataset, 'scatterplot', { mapping: 't-SNE' });

      const [ezScope, etxScope, etyScope] = config.addCoordination(
        CoordinationType.EMBEDDING_ZOOM,
        CoordinationType.EMBEDDING_TARGET_X,
        CoordinationType.EMBEDDING_TARGET_Y,
      );
      pca.useCoordination(ezScope, etxScope, etyScope);
      tsne.useCoordination(ezScope, etxScope, etyScope);

      ezScope.setValue(10);
      etxScope.setValue(11);
      etyScope.setValue(12);


      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
            B: 't-SNE',
          },
          embeddingZoom: {
            A: 10,
          },
          embeddingTargetX: {
            A: 11,
          },
          embeddingTargetY: {
            A: 12,
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'B',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '1.0.4',
      });
    });

    it('can add complex coordination', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'My config',
      });
      config.addCoordinationByObject({
        spatialImageLayer: CL([
          {
            image: 'S-1905-017737_bf',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialImageChannel: CL([
              {
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                spatialTargetC: 1,
                spatialChannelColor: [0, 255, 0],
              },
            ]),
          },
        ]),
        spatialSegmentationLayer: CL([
          {
            image: 'S-1905-017737',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialSegmentationChannel: CL([
              {
                obsType: 'Cortical Interstitia',
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Non-Globally Sclerotic Glomeruli',
                spatialTargetC: 1,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Globally Sclerotic Glomeruli',
                spatialTargetC: 2,
                spatialChannelColor: [255, 0, 0],
              },
            ]),
          },
        ]),
      });
      const configJSON = config.toJSON();
      expect(configJSON.coordinationSpace).toEqual({
        spatialImageLayer: { A: '__dummy__' },
        image: { A: 'S-1905-017737_bf', B: 'S-1905-017737' },
        spatialLayerVisible: { A: true, B: true },
        spatialLayerOpacity: { A: 1, B: 1 },
        spatialImageChannel: { A: '__dummy__', B: '__dummy__' },
        spatialTargetC: {
          A: 0, B: 1, C: 0, D: 1, E: 2,
        },
        spatialChannelColor: {
          A: [255, 0, 0], B: [0, 255, 0], C: [255, 0, 0], D: [255, 0, 0], E: [255, 0, 0],
        },
        spatialSegmentationLayer: { A: '__dummy__' },
        spatialSegmentationChannel: { A: '__dummy__', B: '__dummy__', C: '__dummy__' },
        obsType: {
          A: 'Cortical Interstitia',
          B: 'Non-Globally Sclerotic Glomeruli',
          C: 'Globally Sclerotic Glomeruli',
        },
      });
    });

    it('can add _and use_ complex coordination', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');

      // Coordinate all segmentation channels on the same color,
      // to test out the use of a coordination scope instance as a value.
      const [colorScope] = config.addCoordination(
        'spatialChannelColor',
      );
      colorScope.setValue([255, 0, 0]);

      const scopes = config.addCoordinationByObject({
        spatialImageLayer: CL([
          {
            image: 'S-1905-017737_bf',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialImageChannel: CL([
              {
                spatialTargetC: 0,
                spatialChannelColor: [0, 255, 0],
              },
              {
                spatialTargetC: 1,
                spatialChannelColor: [0, 0, 255],
              },
            ]),
          },
        ]),
        spatialSegmentationLayer: CL([
          {
            image: 'S-1905-017737',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialSegmentationChannel: CL([
              {
                obsType: 'Cortical Interstitia',
                spatialTargetC: 0,
                spatialChannelColor: colorScope,
              },
              {
                obsType: 'Non-Globally Sclerotic Glomeruli',
                spatialTargetC: 1,
                spatialChannelColor: colorScope,
              },
              {
                obsType: 'Globally Sclerotic Glomeruli',
                spatialTargetC: 2,
                spatialChannelColor: colorScope,
              },
            ]),
          },
        ]),
      });

      const spatialView = config.addView(dataset, 'spatial');
      spatialView.useCoordinationByObject(scopes);

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        version: '1.0.16',
        name: 'My config',
        datasets: [{ uid: 'A', name: 'My dataset', files: [] }],
        coordinationSpace: {
          dataset: { A: 'A' },
          spatialImageLayer: { A: '__dummy__' },
          image: { A: 'S-1905-017737_bf', B: 'S-1905-017737' },
          spatialLayerVisible: { A: true, B: true },
          spatialLayerOpacity: { A: 1, B: 1 },
          spatialImageChannel: { A: '__dummy__', B: '__dummy__' },
          spatialTargetC: {
            A: 0, B: 1, C: 0, D: 1, E: 2,
          },
          spatialChannelColor: {
            A: [255, 0, 0],
            B: [0, 255, 0],
            C: [0, 0, 255],
          },
          spatialSegmentationLayer: { A: '__dummy__' },
          spatialSegmentationChannel: { A: '__dummy__', B: '__dummy__', C: '__dummy__' },
          obsType: {
            A: 'Cortical Interstitia',
            B: 'Non-Globally Sclerotic Glomeruli',
            C: 'Globally Sclerotic Glomeruli',
          },
        },
        layout: [{
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
            spatialImageLayer: ['A'],
            spatialSegmentationLayer: ['A'],
          },
          coordinationScopesBy: {
            spatialImageLayer: {
              image: { A: 'A' },
              spatialLayerVisible: { A: 'A' },
              spatialLayerOpacity: { A: 'A' },
              spatialImageChannel: { A: ['A', 'B'] },
            },
            spatialImageChannel: {
              spatialTargetC: { A: 'A', B: 'B' },
              spatialChannelColor: { A: 'B', B: 'C' },
            },
            spatialSegmentationLayer: {
              image: { A: 'B' },
              spatialLayerVisible: { A: 'B' },
              spatialLayerOpacity: { A: 'B' },
              spatialSegmentationChannel: { A: ['A', 'B', 'C'] },
            },
            spatialSegmentationChannel: {
              obsType: { A: 'A', B: 'B', C: 'C' },
              spatialTargetC: { A: 'C', B: 'D', C: 'E' },
              spatialChannelColor: { A: 'A', B: 'A', C: 'A' },
            },
          },
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        }],
        initStrategy: 'auto',
      });
    });

    it('can use _meta_ complex coordination', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');

      const scopes = config.addCoordinationByObject({
        spatialImageLayer: CL([
          {
            image: 'S-1905-017737_bf',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialImageChannel: CL([
              {
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                spatialTargetC: 1,
                spatialChannelColor: [0, 255, 0],
              },
            ]),
          },
        ]),
        spatialSegmentationLayer: CL([
          {
            image: 'S-1905-017737',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialSegmentationChannel: CL([
              {
                obsType: 'Cortical Interstitia',
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Non-Globally Sclerotic Glomeruli',
                spatialTargetC: 1,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Globally Sclerotic Glomeruli',
                spatialTargetC: 2,
                spatialChannelColor: [255, 0, 0],
              },
            ]),
          },
        ]),
      });

      const metaCoordinationScope = config.addMetaCoordination();
      metaCoordinationScope.useCoordinationByObject(scopes);

      const spatialView = config.addView(dataset, 'spatial');
      const lcView = config.addView(dataset, 'layerController');
      spatialView.useMetaCoordination(metaCoordinationScope);
      lcView.useMetaCoordination(metaCoordinationScope);

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        version: '1.0.16',
        name: 'My config',
        datasets: [{ uid: 'A', name: 'My dataset', files: [] }],
        coordinationSpace: {
          dataset: { A: 'A' },
          spatialImageLayer: { A: '__dummy__' },
          image: { A: 'S-1905-017737_bf', B: 'S-1905-017737' },
          spatialLayerVisible: { A: true, B: true },
          spatialLayerOpacity: { A: 1, B: 1 },
          spatialImageChannel: { A: '__dummy__', B: '__dummy__' },
          spatialTargetC: {
            A: 0, B: 1, C: 0, D: 1, E: 2,
          },
          spatialChannelColor: {
            A: [255, 0, 0],
            B: [0, 255, 0],
            C: [255, 0, 0],
            D: [255, 0, 0],
            E: [255, 0, 0],
          },
          spatialSegmentationLayer: { A: '__dummy__' },
          spatialSegmentationChannel: { A: '__dummy__', B: '__dummy__', C: '__dummy__' },
          obsType: {
            A: 'Cortical Interstitia',
            B: 'Non-Globally Sclerotic Glomeruli',
            C: 'Globally Sclerotic Glomeruli',
          },
          metaCoordinationScopes: {
            A: {
              spatialImageLayer: ['A'],
              spatialSegmentationLayer: ['A'],
            },
          },
          metaCoordinationScopesBy: {
            A: {
              spatialImageLayer: {
                image: { A: 'A' },
                spatialLayerVisible: { A: 'A' },
                spatialLayerOpacity: { A: 'A' },
                spatialImageChannel: { A: ['A', 'B'] },
              },
              spatialImageChannel: {
                spatialTargetC: { A: 'A', B: 'B' },
                spatialChannelColor: { A: 'A', B: 'B' },
              },
              spatialSegmentationLayer: {
                image: { A: 'B' },
                spatialLayerVisible: { A: 'B' },
                spatialLayerOpacity: { A: 'B' },
                spatialSegmentationChannel: { A: ['A', 'B', 'C'] },
              },
              spatialSegmentationChannel: {
                obsType: { A: 'A', B: 'B', C: 'C' },
                spatialTargetC: { A: 'C', B: 'D', C: 'E' },
                spatialChannelColor: { A: 'C', B: 'D', C: 'E' },
              },
            },
          },
        },
        layout: [{
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
            metaCoordinationScopes: ['A'],
            metaCoordinationScopesBy: ['A'],
          },
          // eslint-disable-next-line object-property-newline
          x: 0, y: 0, w: 1, h: 1,
        }, {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
            metaCoordinationScopes: ['A'],
            metaCoordinationScopesBy: ['A'],
          },
          // eslint-disable-next-line object-property-newline
          x: 0, y: 0, w: 1, h: 1,
        }],
        initStrategy: 'auto',
      });
    });

    it('can use _meta_ complex coordination via the linkViewsByObject convenience function', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.16',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');

      const spatialView = config.addView(dataset, 'spatial');
      const lcView = config.addView(dataset, 'layerController');

      config.linkViewsByObject([spatialView, lcView], {
        spatialImageLayer: CL([
          {
            image: 'S-1905-017737_bf',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialImageChannel: CL([
              {
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                spatialTargetC: 1,
                spatialChannelColor: [0, 255, 0],
              },
            ]),
          },
        ]),
        spatialSegmentationLayer: CL([
          {
            image: 'S-1905-017737',
            spatialLayerVisible: true,
            spatialLayerOpacity: 1,
            spatialSegmentationChannel: CL([
              {
                obsType: 'Cortical Interstitia',
                spatialTargetC: 0,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Non-Globally Sclerotic Glomeruli',
                spatialTargetC: 1,
                spatialChannelColor: [255, 0, 0],
              },
              {
                obsType: 'Globally Sclerotic Glomeruli',
                spatialTargetC: 2,
                spatialChannelColor: [255, 0, 0],
              },
            ]),
          },
        ]),
      });

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        version: '1.0.16',
        name: 'My config',
        datasets: [{ uid: 'A', name: 'My dataset', files: [] }],
        coordinationSpace: {
          dataset: { A: 'A' },
          spatialImageLayer: { A: '__dummy__' },
          image: { A: 'S-1905-017737_bf', B: 'S-1905-017737' },
          spatialLayerVisible: { A: true, B: true },
          spatialLayerOpacity: { A: 1, B: 1 },
          spatialImageChannel: { A: '__dummy__', B: '__dummy__' },
          spatialTargetC: {
            A: 0, B: 1, C: 0, D: 1, E: 2,
          },
          spatialChannelColor: {
            A: [255, 0, 0],
            B: [0, 255, 0],
            C: [255, 0, 0],
            D: [255, 0, 0],
            E: [255, 0, 0],
          },
          spatialSegmentationLayer: { A: '__dummy__' },
          spatialSegmentationChannel: { A: '__dummy__', B: '__dummy__', C: '__dummy__' },
          obsType: {
            A: 'Cortical Interstitia',
            B: 'Non-Globally Sclerotic Glomeruli',
            C: 'Globally Sclerotic Glomeruli',
          },
          metaCoordinationScopes: {
            A: {
              spatialImageLayer: ['A'],
              spatialSegmentationLayer: ['A'],
            },
          },
          metaCoordinationScopesBy: {
            A: {
              spatialImageLayer: {
                image: { A: 'A' },
                spatialLayerVisible: { A: 'A' },
                spatialLayerOpacity: { A: 'A' },
                spatialImageChannel: { A: ['A', 'B'] },
              },
              spatialImageChannel: {
                spatialTargetC: { A: 'A', B: 'B' },
                spatialChannelColor: { A: 'A', B: 'B' },
              },
              spatialSegmentationLayer: {
                image: { A: 'B' },
                spatialLayerVisible: { A: 'B' },
                spatialLayerOpacity: { A: 'B' },
                spatialSegmentationChannel: { A: ['A', 'B', 'C'] },
              },
              spatialSegmentationChannel: {
                obsType: { A: 'A', B: 'B', C: 'C' },
                spatialTargetC: { A: 'C', B: 'D', C: 'E' },
                spatialChannelColor: { A: 'C', B: 'D', C: 'E' },
              },
            },
          },
        },
        layout: [{
          component: 'spatial',
          coordinationScopes: {
            dataset: 'A',
            metaCoordinationScopes: ['A'],
            metaCoordinationScopesBy: ['A'],
          },
          // eslint-disable-next-line object-property-newline
          x: 0, y: 0, w: 1, h: 1,
        }, {
          component: 'layerController',
          coordinationScopes: {
            dataset: 'A',
            metaCoordinationScopes: ['A'],
            metaCoordinationScopesBy: ['A'],
          },
          // eslint-disable-next-line object-property-newline
          x: 0, y: 0, w: 1, h: 1,
        }],
        initStrategy: 'auto',
      });
    });

    it('can add a coordination scope using the link views convenience function', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');
      const pca = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const tsne = config.addView(dataset, 'scatterplot', { mapping: 't-SNE' });

      config.linkViews(
        [pca, tsne],
        [
          CoordinationType.EMBEDDING_ZOOM,
        ],
      );

      config.linkViews(
        [pca, tsne],
        [
          CoordinationType.EMBEDDING_TARGET_X,
          CoordinationType.EMBEDDING_TARGET_Y,
        ],
        [
          2,
          3,
        ],
      );

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
            B: 't-SNE',
          },
          embeddingZoom: {
            A: null,
          },
          embeddingTargetX: {
            A: 2,
          },
          embeddingTargetY: {
            A: 3,
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'B',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '1.0.4',
      });
    });

    it('can create a layout', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');
      const v1 = config.addView(dataset, 'spatial');
      const v2 = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const v3 = config.addView(dataset, 'status');

      config.layout(hconcat(v1, vconcat(v2, v3)));

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            component: 'spatial',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 6,
            h: 12,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 6,
            y: 0,
            w: 6,
            h: 6,
          },
          {
            component: 'status',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 6,
            y: 6,
            w: 6,
            h: 6,
          },
        ],
        name: 'My config',
        version: '1.0.4',
      });
    });

    it('can load a view config from JSON', () => {
      const config = new VitessceConfig({
        schemaVersion: '1.0.4',
        name: 'My config',
      });
      const dataset = config.addDataset('My dataset');
      const v1 = config.addView(dataset, 'spatial');
      const v2 = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const v3 = config.addView(dataset, 'status');

      config.layout(hconcat(v1, vconcat(v2, v3)));

      const origConfigJSON = config.toJSON();

      const loadedConfig = VitessceConfig.fromJSON(origConfigJSON);
      const loadedConfigJSON = loadedConfig.toJSON();

      expect(loadedConfigJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            component: 'spatial',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 6,
            h: 12,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 6,
            y: 0,
            w: 6,
            h: 6,
          },
          {
            component: 'status',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 6,
            y: 6,
            w: 6,
            h: 6,
          },
        ],
        name: 'My config',
        version: '1.0.4',
      });
    });
  });
});
