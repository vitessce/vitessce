/* eslint-disable */
import JsonLoader from './loaders/JsonLoader';
import MatrixZarrLoader from './loaders/MatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './loaders/ClustersJsonAsMatrixZarrLoader';

// Map here is important, since this is ordered by specificity / priority.
export const extensionToLoader = new Map([
    ['.json', JsonLoader],
    ['.expression-matrix.zarr', MatrixZarrLoader],
    ['.clusters.json', ClustersJsonAsMatrixZarrLoader],
]);