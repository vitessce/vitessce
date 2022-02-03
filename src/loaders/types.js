import { FileType } from '../app/constants';

import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
<<<<<<< HEAD
import QuPathCellsJsonLoader from './QuPathCellsJsonLoader';
import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';

export const fileTypeToLoaderAndSource = {
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
  [FileType.QUPATH_CELLS_JSON]: [JsonSource, QuPathCellsJsonLoader],
=======
import GeoJsonJsonLoader from './GeoJsonJsonLoader';

const ANNDATA = 'anndata';

export const fileTypeToLoader = {
  'expression-matrix.zarr': MatrixZarrLoader,
  'clusters.json': ClustersJsonAsMatrixZarrLoader,
  'genes.json': GenesJsonAsMatrixZarrLoader,
  'cells.json': JsonLoader,
  'molecules.json': JsonLoader,
  'neighborhoods.json': JsonLoader,
  'raster.json': RasterJsonLoader,
  'raster.ome-zarr': OmeZarrLoader,
  'cell-sets.json': CellSetsJsonLoader,
  [`${ANNDATA}-cell-sets.zarr`]: AnnDataLoaders.CellSetsZarrLoader,
  [`${ANNDATA}-cells.zarr`]: AnnDataLoaders.CellsZarrLoader,
  [`${ANNDATA}-expression-matrix.zarr`]: AnnDataLoaders.MatrixZarrLoader,
  'genomic-profiles.zarr': GenomicProfilesZarrLoader,
  'geojson-cells.json': GeoJsonJsonLoader,
>>>>>>> 8c88cca6 (Rename)
};

export function getSourceAndLoaderFromFileType(type) {
  return fileTypeToLoaderAndSource[type] || [JsonSource, JsonLoader];
}
