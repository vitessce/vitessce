/* eslint-disable camelcase */
import { describe, expect, it } from 'vitest';
import {
  upgradeFrom0_1_0,
  upgradeFrom1_0_0,
  upgradeFrom1_0_15,
} from './previous-config-upgraders.js';
import {
  legacyViewConfig0_1_0,
  upgradedLegacyViewConfig0_1_0,
  legacyViewConfig1_0_0,
  upgradedLegacyViewConfig1_0_0,
  implicitPerDatasetCoordinations,
  explicitPerDatasetCoordinations,
} from './view-config-utils.test.fixtures.js';
import {
  upgradeAndParse,
} from './view-config-versions.js';

describe('src/app/view-config-utils.js', () => {
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
    it('upgrades more than once', () => {
      const latestConfig = upgradeAndParse(legacyViewConfig1_0_0);
      expect(latestConfig.version).toEqual('1.0.16');
    });
  });
});
