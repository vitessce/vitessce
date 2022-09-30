import { configs, publicConfigs } from './configs';

// Imported here to keep ../demo/configs.js "clean"
// since plugins use `window` which is not supported by docusaurus's SSR.
// Reference: https://docusaurus.io/docs/advanced/ssg

// TODO(monorepo)
// import { pluginViewType } from './view-configs/plugin-view-type';
// import { pluginCoordinationType } from './view-configs/plugin-coordination-type';
// import { pluginFileType } from './view-configs/plugin-file-type';

const configsWithPlugins = {
  ...configs,
  // TODO(monorepo)
  // 'plugin-view-type': pluginViewType,
  // 'plugin-coordination-type': pluginCoordinationType,
  // 'plugin-file-type': pluginFileType,
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
