import expect from 'expect';
import {
  getExistingScopesForCoordinationType,
  upgrade,
  initialize,
} from './view-config-utils';
import {
  legacyViewConfig,
  upgradedViewConfig,
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
      expect(upgrade(legacyViewConfig, 'A')).toEqual(upgradedViewConfig);
    });
  });

  describe('initialize', () => {
    it('initializes coordination space and component coordination scopes when initStrategy is auto', () => {
      expect(initialize(upgradedViewConfig)).toEqual(initializedViewConfig);
    });

    it('does not change the result when initialized twice when initStrategy is auto', () => {
      const firstResult = initialize(upgradedViewConfig);
      expect(firstResult).toEqual(initializedViewConfig);
      const secondResult = initialize(firstResult);
      expect(secondResult).toEqual(initializedViewConfig);
    });

    it('does not initialize when initStrategy is none', () => {
      const noneInitViewConfig = {
        ...upgradedViewConfig,
        initStrategy: 'none',
      };
      expect(initialize(noneInitViewConfig)).toEqual(noneInitViewConfig);
    });
  });
});
