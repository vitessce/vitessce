import { FileType } from '@vitessce/constants-internal';
import {
  getLoaderClassesForPluginFileType,
} from '../plugins';

// TODO(monorepo)
/*
import {
  AnnDataSource,
  ZarrDataSource,
  JsonSource,
  CsvSource,
} from './data-sources';
import JsonLoader from './json-loaders/JsonLoader';
import ObsSetsJsonLoader from './json-loaders/ObsSetsJson';
import ObsSegmentationsJsonLoader from './json-loaders/ObsSegmentationsJson';
import OmeZarrLoader from './OmeZarrLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import CellsJsonAsObsLabelsLoader from './legacy-loaders/CellsJsonAsObsLabels';
import CellsJsonAsObsEmbeddingLoader from './legacy-loaders/CellsJsonAsObsEmbedding';
import CellsJsonAsObsSegmentationsLoader from './legacy-loaders/CellsJsonAsObsSegmentations';
import ClustersJsonAsObsFeatureMatrixLoader from './legacy-loaders/ClustersJsonAsObsFeatureMatrix';
import GenesJsonAsObsFeatureMatrixLoader from './legacy-loaders/GenesJsonAsObsFeatureMatrix';
import RasterJsonAsImageLoader from './raster-json-loaders/RasterJsonAsImageLoader';
import RasterJsonAsObsSegmentationsLoader from './raster-json-loaders/RasterJsonAsObsSegmentationsLoader';
import MatrixZarrAsObsFeatureMatrixLoader from './matrix-loaders/MatrixZarrAsObsFeatureMatrix';
import MoleculesJsonAsObsLocationsLoader from './legacy-loaders/MoleculesJsonAsObsLocations';
import MoleculesJsonAsObsLabelsLoader from './legacy-loaders/MoleculesJsonAsObsLabels';
import CellsJsonAsObsLocationsLoader from './legacy-loaders/CellsJsonAsObsLocations';
import ObsEmbeddingCsvLoader from './csv-loaders/ObsEmbeddingCsv';
import ObsLocationsCsvLoader from './csv-loaders/ObsLocationsCsv';
import ObsLabelsCsvLoader from './csv-loaders/ObsLabelsCsv';
import FeatureLabelsCsvLoader from './csv-loaders/FeatureLabelsCsv';
import ObsFeatureMatrixCsvLoader from './csv-loaders/ObsFeatureMatrixCsv';
import ObsSetsCsvLoader from './csv-loaders/ObsSetsCsv';
*/

export const fileTypeToLoaderAndSource = {};

export function getSourceAndLoaderFromFileType(type) {
  if (fileTypeToLoaderAndSource[type]) {
    return fileTypeToLoaderAndSource[type];
  }
  const pluginFileType = getLoaderClassesForPluginFileType(type);
  if (pluginFileType) {
    return pluginFileType;
  }
  // Fallback to JSON.
  // TODO(monorepo)
  // return [JsonSource, JsonLoader];
  return [null, null];
}
