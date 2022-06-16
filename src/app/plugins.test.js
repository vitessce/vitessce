/* eslint-disable camelcase */
import expect from 'expect';
import {
  registerPluginFileType,
  registerPluginConvenienceFileType,
  getFileTypeDataTypeMapping,
  getConvenienceFileTypes,
} from './plugins';
import {
  convenienceFileDefsCollapsed,
  convenienceFileDefsExpanded,
  pluginExpandAnnDataConvenience,
} from './plugins.test.fixtures';
import {
  initialize,
} from './view-config-utils';

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
  describe('convenience file types', () => {
    it('registers plugin convenience file types', () => {
      registerPluginConvenienceFileType('anndata.convenience.zarr', pluginExpandAnnDataConvenience);
      const expansionFuncs = getConvenienceFileTypes();
      expect(Object.keys(expansionFuncs).includes('anndata.convenience.zarr')).toBeTruthy();
      expect(typeof expansionFuncs['anndata.convenience.zarr']).toEqual('function');
    });
    it('uses plugin convenience file types in view config initialization', () => {
      registerPluginConvenienceFileType('anndata.convenience.zarr', pluginExpandAnnDataConvenience);
      expect(initialize(convenienceFileDefsCollapsed).datasets)
        .toEqual(convenienceFileDefsExpanded.datasets);
    });
  });
});
