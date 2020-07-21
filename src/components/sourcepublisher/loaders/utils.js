/* eslint-disable */
import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';

export const extensionToLoader = {
    '.json': JsonLoader,
    '.expression-matrix.zarr': MatrixZarrLoader,
    '.clusters.json': ClustersJsonAsMatrixZarrLoader,
};