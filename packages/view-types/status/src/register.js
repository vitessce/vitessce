import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { StatusSubscriber } from './StatusSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.STATUS,
    StatusSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.STATUS],
  );
}
