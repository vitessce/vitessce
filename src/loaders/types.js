
import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterLoader from './RasterLoader';


export const fileTypeToLoader = {
  'expression-matrix.zarr': MatrixZarrLoader,
  'clusters.json': ClustersJsonAsMatrixZarrLoader,
  'genes.json': GenesJsonAsMatrixZarrLoader,
  'cells.json': JsonLoader,
  'factors.json': JsonLoader,
  'molecules.json': JsonLoader,
  'neighborhoods.json': JsonLoader,
  'raster.json': RasterLoader,
  'cell-sets.json': JsonLoader,
};
