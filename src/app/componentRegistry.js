import DescriptionSubscriber from '../components/description/DescriptionSubscriber';
import StatusSubscriber from '../components/status/StatusSubscriber';
import FactorsSubscriber from '../components/factors/FactorsSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import CellSetsManagerSubscriber from '../components/sets/CellSetsManagerSubscriber';
import HoverableScatterplotSubscriber from '../components/scatterplot/HoverableScatterplotSubscriber';
import HoverableSpatialSubscriber from '../components/spatial/HoverableSpatialSubscriber';
import HoverableHeatmapSubscriber from '../components/heatmap/HoverableHeatmapSubscriber';
import LayerControllerSubscriber from '../components/layer-controller/LayerControllerSubscriber';
import HiGlassSubscriber from '../components/higlass/HiGlassSubscriber';
import CellSetSizePlotSubscriber from '../components/sets/CellSetSizePlotSubscriber';

const registry = {
  description: DescriptionSubscriber,
  status: StatusSubscriber,
  factors: FactorsSubscriber,
  genes: GenesSubscriber,
  cellSets: CellSetsManagerSubscriber,
  scatterplot: HoverableScatterplotSubscriber,
  spatial: HoverableSpatialSubscriber,
  heatmap: HoverableHeatmapSubscriber,
  layerController: LayerControllerSubscriber,
  higlass: HiGlassSubscriber,
  cellSetSize: CellSetSizePlotSubscriber,
};

export default function getComponent(name) {
  const component = registry[name];
  if (component === undefined) {
    throw new Error(`Could not find definition for "${name}" in registry.`);
  }
  return registry[name];
}
