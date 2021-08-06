import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';
import RosslerAttractorLoader from './RosslerAttractorLoader';

import { AnnDataSource, ZarrDataSource, JsonSource } from './data-sources';

const ANNDATA = 'anndata';

const fileTypeToLoaderAndSource = {
  'expression-matrix.zarr': [ZarrDataSource, MatrixZarrLoader],
  'clusters.json': [JsonSource, ClustersJsonAsMatrixZarrLoader],
  'genes.json': [JsonSource, GenesJsonAsMatrixZarrLoader],
  'cells.json': [JsonSource, JsonLoader],
  'molecules.json': [JsonSource, JsonLoader],
  'neighborhoods.json': [JsonSource, JsonLoader],
  'raster.json': [JsonSource, RasterJsonLoader],
  'raster.ome-zarr': [ZarrDataSource, OmeZarrLoader],
  'cell-sets.json': [JsonSource, CellSetsJsonLoader],
  [`${ANNDATA}-cell-sets.zarr`]: [AnnDataSource, AnnDataLoaders.CellSetsZarrLoader],
  [`${ANNDATA}-cells.zarr`]: [AnnDataSource, AnnDataLoaders.CellsZarrLoader],
  [`${ANNDATA}-expression-matrix.zarr`]: [AnnDataSource, AnnDataLoaders.MatrixZarrLoader],
  'genomic-profiles.zarr': [ZarrDataSource, GenomicProfilesZarrLoader],
  'rossler-attractor': [JsonSource, RosslerAttractorLoader],
};

export function getSourceAndLoaderFromFileType(type) {
  return fileTypeToLoaderAndSource[type] || [JsonSource, JsonLoader];
}
