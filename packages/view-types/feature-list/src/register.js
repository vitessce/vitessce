import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { FeatureListSubscriber } from './FeatureListSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.FEATURE_LIST,
    FeatureListSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_LIST],
  );
}
