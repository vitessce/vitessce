import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import QuPathCellsJsonLoader from './QuPathCellsJsonLoader';

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
  'qupath-cells.json': QuPathCellsJsonLoader,
};
