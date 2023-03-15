import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { ObsSetsManagerSubscriber } from './ObsSetsManagerSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.OBS_SETS,
    ObsSetsManagerSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS],
  );
}
