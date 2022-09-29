import { ViewType } from './constants';
import { getPluginViewType, getPluginViewTypes } from './plugins';

import DescriptionSubscriber from '../components/description/DescriptionSubscriber';
import StatusSubscriber from '../components/status/StatusSubscriber';
import FeatureListSubscriber from '../components/feature-list/FeatureListSubscriber';
import ObsSetsManagerSubscriber from '../components/obs-sets/ObsSetsManagerSubscriber';
import EmbeddingScatterplotSubscriber from '../components/embedding-scatterplot/EmbeddingScatterplotSubscriber';
import GatingSubscriber from '../components/gating/GatingSubscriber';
import SpatialSubscriber from '../components/spatial/SpatialSubscriber';
import HeatmapSubscriber from '../components/heatmap/HeatmapSubscriber';
import LayerControllerSubscriber from '../components/layer-controller/LayerControllerSubscriber';
import HiGlassSubscriber from '../components/higlass/HiGlassSubscriber';
import GenomicProfilesSubscriber from '../components/higlass/GenomicProfilesSubscriber';
import CellSetSizesPlotSubscriber from '../components/statistical-plots/CellSetSizesPlotSubscriber';
import ExpressionHistogramSubscriber from '../components/statistical-plots/ExpressionHistogramSubscriber';
import CellSetExpressionPlotSubscriber from '../components/statistical-plots/CellSetExpressionPlotSubscriber';

const registry = {
  [ViewType.DESCRIPTION]: DescriptionSubscriber,
  [ViewType.STATUS]: StatusSubscriber,
  [ViewType.FEATURE_LIST]: FeatureListSubscriber,
  [ViewType.OBS_SETS]: ObsSetsManagerSubscriber,
  [ViewType.SCATTERPLOT]: EmbeddingScatterplotSubscriber,
  [ViewType.GATING]: GatingSubscriber,
  [ViewType.SPATIAL]: SpatialSubscriber,
  [ViewType.HEATMAP]: HeatmapSubscriber,
  [ViewType.LAYER_CONTROLLER]: LayerControllerSubscriber,
  [ViewType.OBS_SET_SIZES]: CellSetSizesPlotSubscriber,
  [ViewType.GENOMIC_PROFILES]: GenomicProfilesSubscriber,
  [ViewType.FEATURE_VALUE_HISTOGRAM]: ExpressionHistogramSubscriber,
  [ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION]: CellSetExpressionPlotSubscriber,
  // The plain higlass component does not abstract away the HiGlass view config,
  // so we probably want to avoid documenting it, only use it for development purposes.
  higlass: HiGlassSubscriber,
};

export function getComponent(name) {
  let component = registry[name];
  if (component === undefined) {
    component = getPluginViewType(name);
    if (component === undefined) {
      throw new Error(`Could not find definition for "${name}" in the core registry nor the plugin registry.`);
    }
  }
  return component;
}

export function getViewTypes() {
  return [
    ...Object.keys(registry),
    ...getPluginViewTypes(),
  ];
}
