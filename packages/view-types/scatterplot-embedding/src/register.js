import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { EmbeddingScatterplotSubscriber } from './EmbeddingScatterplotSubscriber';

export function register() {
  registerPluginViewType(
    ViewType.SCATTERPLOT,
    EmbeddingScatterplotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT],
  );
}
