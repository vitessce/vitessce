import { configs } from '../demo/configs';

// Imported here to keep ../demo/configs.js "clean"
// since plugins use `window` which is not supported by docusaurus's SSR.
// Reference: https://docusaurus.io/docs/advanced/ssg
import { pluginViewType } from '../demo/view-configs/plugin-view-type';
import { pluginCoordinationType } from '../demo/view-configs/plugin-coordination-type';
import { pluginFileType } from '../demo/view-configs/plugin-file-type';

const configsWithPlugins = {
  ...configs,
  'plugin-view-type': pluginViewType,
  'plugin-coordination-type': pluginCoordinationType,
  'plugin-file-type': pluginFileType,
};

export function listConfigs(showAll) {
  return Object.entries(configsWithPlugins).filter(
    entry => showAll || entry[1].public,
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
