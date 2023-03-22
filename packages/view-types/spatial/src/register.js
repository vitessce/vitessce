import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { SpatialSubscriber } from './SpatialSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.SPATIAL,
    SpatialSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL],
  );
}
