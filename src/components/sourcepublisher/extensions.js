import {
  JsonLoader,
  MatrixZarrLoader,
  ClustersJsonAsMatrixZarrLoader,
  GenesJsonAsMatrixZarrLoader,
} from '../../loaders/index';

// Map here is important,
// since this is ordered by reverse specificity / priority.
export const extensionToLoader = new Map([
  // Least specific
  ['.json', JsonLoader],
  ['.expression-matrix.zarr', MatrixZarrLoader],
  ['.genes.json', GenesJsonAsMatrixZarrLoader],
  ['.clusters.json', ClustersJsonAsMatrixZarrLoader],
  // Most specific
]);
