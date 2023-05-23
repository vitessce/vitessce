import { pluginViewType, pluginViewTypeProps } from './plugins/plugin-view-type.js';
import { pluginCoordinationType, pluginCoordinationTypeProps } from './plugins/plugin-coordination-type.js';
import { pluginFileType, pluginFileTypeProps } from './plugins/plugin-file-type.js';
import { pluginImageView, pluginImageViewProps } from './plugins/plugin-image-view.js';

export const configsWithPlugins = {
  'plugin-view-type': pluginViewType,
  'plugin-coordination-type': pluginCoordinationType,
  'plugin-file-type': pluginFileType,
  'plugin-image-view': pluginImageView,
};

export const pluginProps = {
  'plugin-view-type': pluginViewTypeProps,
  'plugin-coordination-type': pluginCoordinationTypeProps,
  'plugin-file-type': pluginFileTypeProps,
  'plugin-image-view': pluginImageViewProps,
};
