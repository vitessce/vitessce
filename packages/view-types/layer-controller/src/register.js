import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { LayerControllerSubscriber } from './LayerControllerSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.LAYER_CONTROLLER,
    LayerControllerSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER],
  );
}
