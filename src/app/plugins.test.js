/* eslint-disable camelcase */
import expect from 'expect';
import {
  registerPluginFileType,
  getFileTypeDataTypeMapping,
} from './plugins';

describe('src/app/plugins.js', () => {
  describe('getFileTypeDataTypeMapping', () => {
    it('returns the correct data type for built-in file types', () => {
      const dataType = getFileTypeDataTypeMapping('raster.json');
      expect(dataType).toEqual('raster');
    });
    it('returns the correct data type for plugin file types', () => {
      registerPluginFileType('plugin-cells.json', 'cells', null, null);
      const dataType = getFileTypeDataTypeMapping('plugin-cells.json');
      expect(dataType).toEqual('cells');
    });
  });
});
