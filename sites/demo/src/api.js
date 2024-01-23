import { configs, publicConfigs } from '@vitessce/example-configs';
import { configsWithPlugins as pluginConfigs, pluginProps } from '@vitessce/example-plugins';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import exemplarSmallCellsAdata from './json-fixtures/exemplar-small/exemplar-001.crop.cells.adata.json';
import exemplarSmallImageOmeZarr from './json-fixtures/exemplar-small/exemplar-001.crop.image.ome.json';
import exemplarSmallSegmentationsOmeZarr from './json-fixtures/exemplar-small/exemplar-001.crop.segmentations.ome.json';


const configsWithPlugins = {
  ...configs,
  ...pluginConfigs,
};

const configToMemoryStores = {
  'exemplar-small': {
    'exemplar-001.crop.cells.adata.zarr': createStoreFromMapContents(exemplarSmallCellsAdata),
    'exemplar-001.crop.image.ome.zarr': createStoreFromMapContents(exemplarSmallImageOmeZarr),
    'exemplar-001.crop.segmentations.ome.zarr': createStoreFromMapContents(exemplarSmallSegmentationsOmeZarr),
  },
};

export function listConfigs(showAll) {
  return Object.entries(configsWithPlugins).filter(
    entry => showAll || publicConfigs.includes(entry[0]),
  ).map(
    ([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
    }),
  );
}

export function getConfig(id) {
  return configsWithPlugins[id];
}

export function getPlugins(id) {
  return pluginProps[id] || {};
}

export function getStores(id) {
  if (configToMemoryStores[id]) {
    return configToMemoryStores[id];
  }
  return null;
}
