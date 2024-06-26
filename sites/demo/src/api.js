import { configs, publicConfigs, configStores, configPages } from '@vitessce/example-configs';
import { configsWithPlugins as pluginConfigs, pluginProps } from '@vitessce/example-plugins';


const configsWithPlugins = {
  ...configs,
  ...pluginConfigs,
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
  return configStores?.[id];
}

export function getPage(id) {
  return configPages?.[id];
}
