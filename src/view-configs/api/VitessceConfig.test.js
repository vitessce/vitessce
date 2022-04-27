import expect from 'expect';
import {
  VitessceConfig,
} from './VitessceConfig';
import {
  VitessceConfig as VitessceConfigV1,
} from './v1/v1-api';
import {
  VitessceConfig as VitessceConfigV2,
} from './v2/v2-api';

describe('src/view-configs/api/VitessceConfig.js', () => {
  describe('VitessceConfig', () => {
    it('can be instantiated', () => {
      const config = new VitessceConfig('My config');

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {},
        datasets: [],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '2.0.0',
      });
    });
    it('should return a v1 instance when the schemaVersion parameter is v1.0.0', () => {
      const vc = new VitessceConfig('My config', 'My description', '1.0.0');
      expect(vc).toBeInstanceOf(VitessceConfigV1);
    });
    it('should return a v2 instance when the schemaVersion parameter is v2.0.0', () => {
      const vc = new VitessceConfig('My config', 'My description', '2.0.0');
      expect(vc).toBeInstanceOf(VitessceConfigV2);
    });
  });
});
