import { CoordinationType } from '@vitessce/constants-internal';
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from './VitessceConfig';

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
      const dataset = config.addDataset('My dataset');
      const spatialView = config.addView(dataset, 'spatial');
      const lcView = config.addView(dataset, 'layerController');

      // would import as CL for convenience
      class CoordinationLevel {

      }

      function CL(val) {
        return new CoordinationLevel(val);
      }

      // This function initializes the coordination space
      // using the provided values and returns a nested structure to pass into .useComplexCoordination
      const scopes = config.addComplexCoordination({
        [CoordinationType.SPATIAL_IMAGE_LAYER]: CL([ // check if value of object is instanceof CoordinationLevel (otherwise assume it is the coordination value)
          {
            [CoordinationType.IMAGE]: 'S-1905-017737_bf',
            [CoordinationType.SPATIAL_LAYER_VISIBLE]: true,
            [CoordinationType.SPATIAL_LAYER_OPACITY]: 1,
            [CoordinationType.SPATIAL_IMAGE_CHANNEL]: CL([
              {
                [CoordinationType.SPATIAL_TARGET_C]: 0,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.SPATIAL_TARGET_C]: 1,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [0, 255, 0],
              },
            ]),
          },
        ]),
        [CoordinationType.SPATIAL_SEGMENTATION_LAYER]: CL([
          {
            [CoordinationType.IMAGE]: 'S-1905-017737',
            [CoordinationType.SPATIAL_LAYER_VISIBLE]: true,
            [CoordinationType.SPATIAL_LAYER_OPACITY]: 1,
            [CoordinationType.SPATIAL_SEGMENTATION_CHANNEL]: CL([
              {
                [CoordinationType.OBS_TYPE]: 'Cortical Interstitia',
                [CoordinationType.SPATIAL_TARGET_C]: 0,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.OBS_TYPE]: 'Non-Globally Sclerotic Glomeruli',
                [CoordinationType.SPATIAL_TARGET_C]: 1,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
              {
                [CoordinationType.OBS_TYPE]: 'Globally Sclerotic Glomeruli',
                [CoordinationType.SPATIAL_TARGET_C]: 2,
                [CoordinationType.SPATIAL_CHANNEL_COLOR]: [255, 0, 0],
              },
            ]),
          },
        ]),
      });

      // Destructure
      const {
        [CoordinationType.SPATIAL_IMAGE_LAYER]: [
          {
            scope: imageLayerScope,
            children: {
              [CoordinationType.IMAGE]: imageScope,
              [CoordinationType.SPATIAL_LAYER_VISIBLE]: imageVisibleScope,
              [CoordinationType.SPATIAL_LAYER_OPACITY]: imageOpacityScope,
              [CoordinationType.SPATIAL_IMAGE_CHANNEL]: [
                {
                  scope: imageChannelScopeR,
                  children: {
                    [CoordinationType.SPATIAL_TARGET_C]: rTargetScope,
                    [CoordinationType.SPATIAL_CHANNEL_COLOR]: rColorScope,
                  },
                },
                {
                  scope: imageChannelScopeG,
                  children: {
                    [CoordinationType.SPATIAL_TARGET_C]: gTargetScope,
                    [CoordinationType.SPATIAL_CHANNEL_COLOR]: gColorScope,
                  },
                },
              ],
            },
          },
        ],
        // ...
      } = scopes;

      // Should correspond to one scope of metaCoordinationScopes
      // and one scope of metaCoordinationScopesBy.
      // Should be an instance with the methods .useCoordination and .useComplexCoordination
      const metaScope = config.addMetaCoordination();

      // view.useMetaCoordination should append one element to each view's metaScopes and metaScopesBy arrays:
      // coordinationScopes: {
      //  metaCoordinationScopes: ['metaA'],
      //  metaCoordinationScopesBy: ['metaA'],
      // }
      spatialView.useMetaCoordination(metaScope);
      lcView.useMetaCoordination(metaScope);

      // VitessceConfig.addCoordination with META_COORDINATION_SCOPES and META_COORDINATION_SCOPES_BY 
      // should return special VitessceConfigCoordinationScope instances
      // with useCoordination and useComplexCoordination functions (as if they were views).
      metaScope.useComplexCoordination(scopes);
      // In order to manually coordinate two different channels to the same color:
      metaScope.useComplexCoordination({
        [CoordinationType.SPATIAL_IMAGE_CHANNEL]: [
          {
            scope: imageChannelScopeR,
            children: {
              [CoordinationType.SPATIAL_TARGET_C]: rTargetScope,
              [CoordinationType.SPATIAL_CHANNEL_COLOR]: rColorScope,
            },
          },
          {
            scope: imageChannelScopeG,
            children: {
              [CoordinationType.SPATIAL_TARGET_C]: gTargetScope,
              [CoordinationType.SPATIAL_CHANNEL_COLOR]: rColorScope, // Manually map both channels to the same color
            },
          },
        ],
      });

      // Views should also have a .useComplexCoordination function.

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
