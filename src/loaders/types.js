import { FileType } from '../app/constants';
import {
  getLoaderClassesForPluginFileType,
} from '../app/plugins';

import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './clusters-json-loaders/ClustersJsonAsMatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './genes-json-loaders/GenesJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import ObsSetsJsonLoader from './ObsSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';
import CellsJsonAsObsLabelsLoader from './cells-json-loaders/CellsJsonAsObsLabels';
import CellsJsonAsObsEmbeddingLoader from './cells-json-loaders/CellsJsonAsObsEmbedding';
import CellsJsonAsObsLocationsLoader from './cells-json-loaders/CellsJsonAsObsLocations';
import CellsJsonAsObsSegmentationsLoader from './cells-json-loaders/CellsJsonAsObsSegmentations';
import ClustersJsonAsObsFeatureMatrixLoader from './clusters-json-loaders/ClustersJsonAsObsFeatureMatrix';
import GenesJsonAsObsFeatureMatrixLoader from './genes-json-loaders/GenesJsonAsObsFeatureMatrix';

export const fileTypeToLoaderAndSource = {
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
  [FileType.OBS_SETS_JSON]: [JsonSource, ObsSetsJsonLoader],
  [FileType.OBS_SETS_CELL_SETS_JSON]: [JsonSource, ObsSetsJsonLoader],
  [FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON]: [JsonSource, ClustersJsonAsObsFeatureMatrixLoader],
  [FileType.OBS_FEATURE_MATRIX_GENES_JSON]: [JsonSource, GenesJsonAsObsFeatureMatrixLoader],
  [FileType.OBS_LABELS_CELLS_JSON]: [JsonSource, CellsJsonAsObsLabelsLoader],
  [FileType.OBS_EMBEDDING_CELLS_JSON]: [JsonSource, CellsJsonAsObsEmbeddingLoader],
  [FileType.OBS_LOCATIONS_CELLS_JSON]: [JsonSource, CellsJsonAsObsLocationsLoader],
  [FileType.OBS_SEGMENTATIONS_CELLS_JSON]: [JsonSource, CellsJsonAsObsSegmentationsLoader],
  [FileType.EXPRESSION_MATRIX_ZARR]: [ZarrDataSource, MatrixZarrLoader],
  [FileType.CLUSTERS_JSON]: [JsonSource, ClustersJsonAsMatrixZarrLoader],
  [FileType.GENES_JSON]: [JsonSource, GenesJsonAsMatrixZarrLoader],
  [FileType.CELLS_JSON]: [JsonSource, JsonLoader],
  [FileType.MOLECULES_JSON]: [JsonSource, JsonLoader],
  [FileType.NEIGHBORHOODS_JSON]: [JsonSource, JsonLoader],
  [FileType.RASTER_JSON]: [JsonSource, RasterJsonLoader],
  [FileType.RASTER_OME_ZARR]: [ZarrDataSource, OmeZarrLoader],
  [FileType.CELL_SETS_JSON]: [JsonSource, ObsSetsJsonLoader],
  [FileType.ANNDATA_CELL_SETS_ZARR]: [AnnDataSource, AnnDataLoaders.CellSetsZarrLoader],
  [FileType.ANNDATA_CELLS_ZARR]: [AnnDataSource, AnnDataLoaders.CellsZarrLoader],
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: [AnnDataSource, AnnDataLoaders.MatrixZarrLoader],
  [FileType.GENOMIC_PROFILES_ZARR]: [ZarrDataSource, GenomicProfilesZarrLoader],
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
  return [JsonSource, JsonLoader];
}
