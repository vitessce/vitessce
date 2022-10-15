import { getPluginViewType, getPluginViewTypes } from './plugins';

// TODO(monorepo): this code can be simplified
const registry = {};

export function getComponent(name) {
  let component = registry[name];
  if (component === undefined) {
    component = getPluginViewType(name);
    if (component === undefined) {
      throw new Error(
        `Could not find definition for "${name}" in the core registry nor the plugin registry.`,
      );
    }
  }
  return component;
}

export function getViewTypes() {
  return [...Object.keys(registry), ...getPluginViewTypes()];
}
