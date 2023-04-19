import { pluginViewType, pluginViewTypeProps } from './plugins/plugin-view-type';
import { pluginCoordinationType, pluginCoordinationTypeProps } from './plugins/plugin-coordination-type';
import { pluginFileType, pluginFileTypeProps } from './plugins/plugin-file-type';
import { pluginImageView, pluginImageViewProps } from './plugins/plugin-image-view';

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
