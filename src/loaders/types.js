import { FileType } from '../app/constants';
import {
  getLoaderClassesForPluginFileType,
} from '../app/plugins';

import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';

export const fileTypeToLoaderAndSource = {
  [FileType.OBS_INDEX_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.ObsIndexAnndataLoader,
  ],
  [FileType.FEATURE_INDEX_ANNDATA_ZARR]: [
    AnnDataSource, AnnDataLoaders.FeatureIndexAnndataLoader,
  ],
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
  [FileType.EXPRESSION_MATRIX_ZARR]: [ZarrDataSource, MatrixZarrLoader],
  [FileType.CLUSTERS_JSON]: [JsonSource, ClustersJsonAsMatrixZarrLoader],
  [FileType.GENES_JSON]: [JsonSource, GenesJsonAsMatrixZarrLoader],
  [FileType.CELLS_JSON]: [JsonSource, JsonLoader],
  [FileType.MOLECULES_JSON]: [JsonSource, JsonLoader],
  [FileType.NEIGHBORHOODS_JSON]: [JsonSource, JsonLoader],
  [FileType.RASTER_JSON]: [JsonSource, RasterJsonLoader],
  [FileType.RASTER_OME_ZARR]: [ZarrDataSource, OmeZarrLoader],
  [FileType.CELL_SETS_JSON]: [JsonSource, CellSetsJsonLoader],
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
