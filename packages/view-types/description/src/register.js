import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { DescriptionSubscriber } from './DescriptionSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.DESCRIPTION,
    DescriptionSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.DESCRIPTION],
  );
}
