import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';

import { AnnDataSource, ZarrDataSource } from './data-sources';

const ANNDATA = 'anndata';

export const fileTypeToLoader = {
  'expression-matrix.zarr': [ZarrDataSource, MatrixZarrLoader],
  'clusters.json': ClustersJsonAsMatrixZarrLoader,
  'genes.json': GenesJsonAsMatrixZarrLoader,
  'cells.json': JsonLoader,
  'molecules.json': JsonLoader,
  'neighborhoods.json': JsonLoader,
  'raster.json': RasterJsonLoader,
  'raster.ome-zarr': [ZarrDataSource, OmeZarrLoader],
  'cell-sets.json': CellSetsJsonLoader,
  [`${ANNDATA}-cell-sets.zarr`]: [AnnDataSource, AnnDataLoaders.CellSetsZarrLoader],
  [`${ANNDATA}-cells.zarr`]: [AnnDataSource, AnnDataLoaders.CellsZarrLoader],
  [`${ANNDATA}-expression-matrix.zarr`]: [AnnDataSource, AnnDataLoaders.MatrixZarrLoader],
  'genomic-profiles.zarr': [ZarrDataSource, GenomicProfilesZarrLoader],
};
