import { registerPluginViewType } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { CellSetExpressionPlotSubscriber } from './CellSetExpressionPlotSubscriber';
import { CellSetSizesPlotSubscriber } from './CellSetSizesPlotSubscriber';
import { ExpressionHistogramSubscriber } from './ExpressionHistogramSubscriber';
import { ObsAreaPlotSubscriber } from './ObsAreaPlotSubscriber';
import { ObsDensityPlotSubscriber } from './ObsDensityPlotSubscriber';
import { StratifiedFeaturePlotSubscriber } from './StratifiedFeaturePlotSubscriber';


export function registerCellSetExpression() {
  registerPluginViewType(
    ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION,
    CellSetExpressionPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION],
  );
}

export function registerCellSetSizes() {
  registerPluginViewType(
    ViewType.OBS_SET_SIZES,
    CellSetSizesPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES],
  );
}

export function registerExpressionHistogram() {
  registerPluginViewType(
    ViewType.FEATURE_VALUE_HISTOGRAM,
    ExpressionHistogramSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_VALUE_HISTOGRAM],
  );
}

export function registerStratifiedFeaturePlot() {
  registerPluginViewType(
    ViewType.STRATIFIED_FEATURE_VALUE_DISTRIBUTION,
    StratifiedFeaturePlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES],
  );
}

export function registerObsDensityPlot() {
  registerPluginViewType(
    ViewType.OBS_DENSITY,
    ObsDensityPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_DENSITY],
  );
}

export function registerObsAreaPlot() {
  registerPluginViewType(
    ViewType.OBS_AREA,
    ObsAreaPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_AREA],
  );
}
