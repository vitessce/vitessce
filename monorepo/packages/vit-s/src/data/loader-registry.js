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

export const fileTypeToLoaderAndSource = {
  // TODO(monorepo)
  /*
  [FileType.OBS_EMBEDDING_CSV]: [CsvSource, ObsEmbeddingCsvLoader],
  [FileType.OBS_LOCATIONS_CSV]: [CsvSource, ObsLocationsCsvLoader],
  [FileType.OBS_LABELS_CSV]: [CsvSource, ObsLabelsCsvLoader],
  [FileType.FEATURE_LABELS_CSV]: [CsvSource, FeatureLabelsCsvLoader],
  [FileType.OBS_FEATURE_MATRIX_CSV]: [CsvSource, ObsFeatureMatrixCsvLoader],
  [FileType.OBS_SEGMENTATIONS_JSON]: [JsonSource, ObsSegmentationsJsonLoader],
  [FileType.OBS_SETS_CSV]: [CsvSource, ObsSetsCsvLoader],
  [FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsFeatureMatrixAnndataLoader,
  ],
  [FileType.OBS_SETS_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsSetsAnndataLoader,
  ],
  [FileType.OBS_EMBEDDING_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsEmbeddingAnndataLoader,
  ],
  [FileType.OBS_LOCATIONS_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsLocationsAnndataLoader,
  ],
  [FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsSegmentationsAnndataLoader,
  ],
  [FileType.OBS_LABELS_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsLabelsAnndataLoader,
  ],
  [FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR]: [
    ZarrDataSource, MatrixZarrAsObsFeatureMatrixLoader,
  ],
  [FileType.FEATURE_LABELS_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.FeatureLabelsAnndataLoader,
  ],
  [FileType.IMAGE_OME_ZARR]: [ZarrDataSource, OmeZarrLoader],
  [FileType.IMAGE_RASTER_JSON]: [JsonSource, RasterJsonAsImageLoader],
  [FileType.OBS_SEGMENTATIONS_RASTER_JSON]: [JsonSource, RasterJsonAsObsSegmentationsLoader],
  [FileType.OBS_SETS_JSON]: [JsonSource, ObsSetsJsonLoader],
  [FileType.OBS_SETS_CELL_SETS_JSON]: [JsonSource, ObsSetsJsonLoader],
  [FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON]: [JsonSource, ClustersJsonAsObsFeatureMatrixLoader],
  [FileType.OBS_FEATURE_MATRIX_GENES_JSON]: [JsonSource, GenesJsonAsObsFeatureMatrixLoader],
  [FileType.OBS_LABELS_CELLS_JSON]: [JsonSource, CellsJsonAsObsLabelsLoader],
  [FileType.OBS_EMBEDDING_CELLS_JSON]: [JsonSource, CellsJsonAsObsEmbeddingLoader],
  [FileType.OBS_LOCATIONS_CELLS_JSON]: [JsonSource, CellsJsonAsObsLocationsLoader],
  [FileType.OBS_SEGMENTATIONS_CELLS_JSON]: [JsonSource, CellsJsonAsObsSegmentationsLoader],
  [FileType.OBS_LOCATIONS_MOLECULES_JSON]: [JsonSource, MoleculesJsonAsObsLocationsLoader],
  [FileType.OBS_LABELS_MOLECULES_JSON]: [JsonSource, MoleculesJsonAsObsLabelsLoader],
  // Old mappings:
  [FileType.NEIGHBORHOODS_JSON]: [JsonSource, JsonLoader],
  [FileType.GENOMIC_PROFILES_ZARR]: [ZarrDataSource, GenomicProfilesZarrLoader],
  */
};

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
