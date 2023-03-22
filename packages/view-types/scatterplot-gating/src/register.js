import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { GatingSubscriber } from './GatingSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.GATING,
    GatingSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.GATING],
  );
}
