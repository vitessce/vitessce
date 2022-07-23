import { FileType } from '../app/constants';
import {
  getLoaderClassesForPluginFileType,
} from '../app/plugins';

import JsonLoader from './JsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import ObsSetsJsonLoader from './ObsSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';
import CellsJsonAsObsLabelsLoader from './cells-json-loaders/CellsJsonAsObsLabels';
import CellsJsonAsObsEmbeddingLoader from './cells-json-loaders/CellsJsonAsObsEmbedding';
import CellsJsonAsObsSegmentationsLoader from './cells-json-loaders/CellsJsonAsObsSegmentations';
import ClustersJsonAsObsFeatureMatrixLoader from './clusters-json-loaders/ClustersJsonAsObsFeatureMatrix';
import GenesJsonAsObsFeatureMatrixLoader from './genes-json-loaders/GenesJsonAsObsFeatureMatrix';
import RasterJsonAsImageLoader from './raster-json-loaders/RasterJsonAsImageLoader';
import RasterJsonAsObsSegmentationsLoader from './raster-json-loaders/RasterJsonAsObsSegmentationsLoader';
import MatrixZarrAsObsFeatureMatrixLoader from './matrix-loaders/MatrixZarrAsObsFeatureMatrix';
import MoleculesJsonAsObsLocationsLoader from './molecules-json-loaders/MoleculesJsonAsObsLocations';
import MoleculesJsonAsObsLabelsLoader from './molecules-json-loaders/MoleculesJsonAsObsLabels';
import CellsJsonAsObsLocationsLoader from './cells-json-loaders/CellsJsonAsObsLocations';

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
