import { Heatmap } from './components/heatmap';
import { Spatial } from './components/spatial';
import { Scatterplot } from './components/scatterplot';
import VitessceGrid from './app/VitessceGrid';
import {
  createApp,
  Vitessce,
  encodeConfInUrl,
  decodeURLParamsToConf,
  registerPluginFileType,
  registerPluginViewType,
} from './app';
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from './api';
import {
  Component,
  DataType,
  FileType,
  CoordinationType,
} from './app/constants';
// For plugin views to use:
import TitleInfo from './components/TitleInfo';
import { useReady, useUrls } from './components/hooks';
import {
  useDescription,
  useCellsData,
  useCellSetsData,
  useExpressionMatrixData,
  useGeneSelection,
  useExpressionAttrs,
  useMoleculesData,
  useNeighborhoodsData,
  useRasterData,
  useGenomicProfilesData,
} from './components/data-hooks';
import {
  useCoordination,
  useLoaders,
} from './app/state/hooks';


export {
  Heatmap,
  Spatial,
  Scatterplot,
  VitessceGrid,
  createApp,
  Vitessce,
  encodeConfInUrl,
  decodeURLParamsToConf,
  VitessceConfig,
  hconcat,
  vconcat,
  Component,
  DataType,
  FileType,
  CoordinationType,
  // Plugin registration functions
  registerPluginFileType,
  registerPluginViewType,
  // Exports for plugins
  // (not guaranteed to be compatible across different Vitessce versions)
  TitleInfo,
  useReady,
  useUrls,
  useCoordination,
  useLoaders,
  useDescription,
  useCellsData,
  useCellSetsData,
  useExpressionMatrixData,
  useGeneSelection,
  useExpressionAttrs,
  useMoleculesData,
  useNeighborhoodsData,
  useRasterData,
  useGenomicProfilesData,
};
