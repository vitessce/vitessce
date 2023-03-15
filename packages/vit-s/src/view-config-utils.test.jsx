/* eslint-disable camelcase */
import { z } from '@vitessce/schemas';
import { PluginViewType, PluginCoordinationType, PluginJointFileType } from '@vitessce/plugins';
import {
  getExistingScopesForCoordinationType,
  initialize,
} from './view-config-utils';
import {
  upgradeFrom0_1_0,
  upgradeFrom1_0_0,
  upgradeFrom1_0_15,
} from './view-config-upgraders';
import {
  legacyViewConfig0_1_0,
  upgradedLegacyViewConfig0_1_0,
  legacyViewConfig1_0_0,
  upgradedLegacyViewConfig1_0_0,
  viewConfig1_0_10,
  missingViewUids,
  implicitPerDatasetCoordinations,
  explicitPerDatasetCoordinations,
} from './view-config-utils.test.fixtures';

function FakeComponent(props) {
  const { text } = props;
  return <span>{text}</span>;
}

const jointFileTypes = [];
const coordinationTypes = [
  new PluginCoordinationType('dataset', null, z.string().nullable()),
  new PluginCoordinationType('embeddingTargetX', 0, z.number()),
  new PluginCoordinationType('embeddingTargetY', 0, z.number()),
  new PluginCoordinationType('embeddingZoom', 3, z.number()),
  new PluginCoordinationType('embeddingType', null, z.string().nullable()),
];
const viewTypes = [
  new PluginViewType('description', FakeComponent, ['dataset']),
  new PluginViewType('scatterplot', FakeComponent, ['dataset', 'embeddingType', 'embeddingZoom', 'embeddingTargetX', 'embeddingTargetY']),
];

describe('src/app/view-config-utils.js', () => {
  describe('getExistingScopesForCoordinationType', () => {
    it('gets all scope names for a particular coordination type', () => {
      const config = {
        coordinationSpace: {
          dataset: {
            A: 'my-dataset-1',
            B: 'my-dataset-2',
          },
        },
        layout: [
          {
            coordinationScopes: {
              dataset: 'A',
            },
          },
          {
            coordinationScopes: {
              dataset: 'C',
            },
          },
        ],
      };
      expect(getExistingScopesForCoordinationType(config, 'dataset')).toEqual(['A', 'B', 'C']);
    });
  });

  describe('upgrade', () => {
    it('upgrade view config from v0.1.0 to v1.0.0', () => {
      expect(upgradeFrom0_1_0(legacyViewConfig0_1_0, 'A')).toEqual(upgradedLegacyViewConfig0_1_0);
    });

    it('upgrade view config from v1.0.0 to v1.0.1', () => {
      expect(upgradeFrom1_0_0(legacyViewConfig1_0_0)).toEqual(upgradedLegacyViewConfig1_0_0);
    });

    it('upgrade view config from v1.0.9 to v1.0.16', () => {
      expect(upgradeFrom1_0_15(implicitPerDatasetCoordinations))
        .toEqual(explicitPerDatasetCoordinations);
    });
  });

  describe('initialize', () => {
    it('initializes coordination space and component coordination scopes when initStrategy is auto', () => {
      const preInitializationConfig = {
        version: '1.0.16',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'auto',
        coordinationSpace: {
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {},
            h: 2,
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
            },
            h: 4,
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };

      const initializedViewConfig = {
        version: '1.0.16',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'auto',
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
          embeddingZoom: {
            A: 3,
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {
              dataset: 'A',
            },
            h: 2,
            uid: 'A',
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
              embeddingZoom: 'A',
            },
            h: 4,
            uid: 'B',
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };

      expect(initialize(preInitializationConfig, jointFileTypes, coordinationTypes, viewTypes))
        .toEqual(initializedViewConfig);
    });
/*
    it('does not change the result when initialized twice when initStrategy is auto', () => {
      const firstResult = initialize(viewConfig1_0_10, jointFileTypes, coordinationTypes, viewTypes);
      expect(firstResult).toEqual(initializedViewConfig);
      const secondResult = initialize(firstResult, jointFileTypes, coordinationTypes, viewTypes);
      expect(secondResult).toEqual(initializedViewConfig);
    });

    it('generates unique ids for the view uid property when missing', () => {
      const withUids = initialize(missingViewUids, jointFileTypes, coordinationTypes, viewTypes);
      expect(withUids.layout[0].uid).toEqual('A');
      // Should not overwrite uid when present:
      expect(withUids.layout[1].uid).toEqual('some-umap');
      expect(withUids.layout[2].uid).toEqual('B');
      expect(withUids.layout[3].uid).toEqual('C');
    });
*/
    it('does not initialize when initStrategy is none', () => {
      const preInitializationConfig = {
        version: '1.0.16',
        name: 'My config name',
        description: 'My config description',
        initStrategy: 'none', // initStrategy is none
        coordinationSpace: {
          embeddingTargetX: {
            A: 0,
          },
          embeddingTargetY: {
            A: 0,
          },
          embeddingType: {
            't-SNE': 't-SNE',
          },
        },
        datasets: [
          {
            files: [],
            name: 'A',
            uid: 'A',
          },
        ],
        layout: [
          {
            component: 'description',
            coordinationScopes: {},
            h: 2,
            w: 3,
            x: 9,
            y: 0,
          },
          {
            component: 'scatterplot',
            coordinationScopes: {
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingType: 't-SNE',
            },
            h: 4,
            w: 5,
            x: 0,
            y: 2,
          },
        ],
      };
      expect(initialize(preInitializationConfig, jointFileTypes, coordinationTypes, viewTypes).coordinationSpace)
        .toEqual(preInitializationConfig.coordinationSpace);
    });
  });
});
