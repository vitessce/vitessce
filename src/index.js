import { Heatmap } from './components/heatmap';
import { Spatial } from './components/spatial';
import { Scatterplot } from './components/scatterplot';
import VitessceGrid from './app/VitessceGrid';
import {
  createApp,
  Vitessce,
  encodeConfInUrl,
  decodeURLParamsToConf,
  registerPluginViewType,
  registerPluginCoordinationType,
  registerPluginFileType,
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
// For plugin view types:
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
  useMultiDatasetCoordination,
  useLoaders,
} from './app/state/hooks';
// For plugin file type:
import {
  JsonLoader,
  LoaderResult,
  AbstractTwoStepLoader,
  AnnDataLoaders,
} from './loaders';
import {
  JsonSource,
  ZarrDataSource,
  AnnDataSource,
} from './loaders/data-sources';


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
  registerPluginCoordinationType,
  registerPluginViewType,
  registerPluginFileType,
  // Exports for plugins
  // (not guaranteed to be compatible across different Vitessce versions)
  TitleInfo,
  useReady,
  useUrls,
  useCoordination,
  useMultiDatasetCoordination,
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
  JsonLoader,
  LoaderResult,
  AbstractTwoStepLoader,
  AnnDataLoaders,
  JsonSource,
  ZarrDataSource,
  AnnDataSource,
};
