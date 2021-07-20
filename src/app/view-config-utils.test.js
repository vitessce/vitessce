/* eslint-disable camelcase */
import expect from 'expect';
import {
  getExistingScopesForCoordinationType,
  initialize,
} from './view-config-utils';
import {
  upgradeFrom0_1_0,
  upgradeFrom1_0_0,
} from './view-config-upgraders';
import {
  legacyViewConfig0_1_0,
  upgradedLegacyViewConfig0_1_0,
  legacyViewConfig1_0_0,
  upgradedLegacyViewConfig1_0_0,
  initializedViewConfig,
} from './view-config-utils.test.fixtures';

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
  });

  describe('initialize', () => {
    it('initializes coordination space and component coordination scopes when initStrategy is auto', () => {
      expect(initialize(upgradedLegacyViewConfig0_1_0)).toEqual(initializedViewConfig);
    });

    it('does not change the result when initialized twice when initStrategy is auto', () => {
      const firstResult = initialize(upgradedLegacyViewConfig0_1_0);
      expect(firstResult).toEqual(initializedViewConfig);
      const secondResult = initialize(firstResult);
      expect(secondResult).toEqual(initializedViewConfig);
    });

    it('does not initialize when initStrategy is none', () => {
      const noneInitViewConfig = {
        ...upgradedLegacyViewConfig0_1_0,
        initStrategy: 'none',
      };
      expect(initialize(noneInitViewConfig)).toEqual(noneInitViewConfig);
    });
  });
});
