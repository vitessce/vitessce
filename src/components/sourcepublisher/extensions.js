import {
  JsonLoader,
  MatrixZarrLoader,
  ClustersJsonAsMatrixZarrLoader,
  GenesJsonAsMatrixZarrLoader,
} from '../../loaders/index';

// Map here is important,
// since this is ordered by specificity / priority.
export const extensionToLoader = new Map([
  // Most specific
  ['.expression-matrix.zarr', MatrixZarrLoader],
  ['.clusters.json', ClustersJsonAsMatrixZarrLoader],
  ['.genes.json', GenesJsonAsMatrixZarrLoader],
  ['.json', JsonLoader],
  // Least specific
]);
