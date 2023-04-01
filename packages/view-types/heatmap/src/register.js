import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { HeatmapSubscriber } from './HeatmapSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.HEATMAP,
    HeatmapSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.HEATMAP],
  );
}
