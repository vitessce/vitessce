import DescriptionSubscriber from '../components/description/DescriptionSubscriber';
import StatusSubscriber from '../components/status/StatusSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import CellSetsManagerSubscriber from '../components/sets/CellSetsManagerSubscriber';
import ScatterplotSubscriber from '../components/scatterplot/ScatterplotSubscriber';
import SpatialSubscriber from '../components/spatial/SpatialSubscriber';
import HeatmapSubscriber from '../components/heatmap/HeatmapSubscriber';
import LayerControllerSubscriber from '../components/layer-controller/LayerControllerSubscriber';
import HiGlassSubscriber from '../components/higlass/HiGlassSubscriber';
import CellSetSizesPlotSubscriber from '../components/sets/CellSetSizesPlotSubscriber';
import GenomicProfilesSubscriber from '../components/higlass/GenomicProfilesSubscriber';
import ExpressionHistogramSubscriber from '../components/genes/ExpressionHistogramSubscriber';
import CellSetExpressionPlotSubscriber from '../components/sets/CellSetExpressionPlotSubscriber';

const registry = {
  description: DescriptionSubscriber,
  status: StatusSubscriber,
  genes: GenesSubscriber,
  cellSets: CellSetsManagerSubscriber,
  scatterplot: ScatterplotSubscriber,
  spatial: SpatialSubscriber,
  heatmap: HeatmapSubscriber,
  layerController: LayerControllerSubscriber,
  cellSetSizes: CellSetSizesPlotSubscriber,
  expressionHistogram: ExpressionHistogramSubscriber,
  genomicProfiles: GenomicProfilesSubscriber,
  cellSetExpression: CellSetExpressionPlotSubscriber,
  // The plain higlass component does not abstract away the HiGlass view config,
  // so we probably want to avoid documenting it, only use it for development purposes.
  higlass: HiGlassSubscriber,
};

export function getComponent(name) {
  const component = registry[name];
  if (component === undefined) {
    throw new Error(`Could not find definition for "${name}" in registry.`);
  }
  return registry[name];
}
