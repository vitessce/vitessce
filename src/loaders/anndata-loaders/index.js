import CellSetsZarrLoader from './CellSetsZarrLoader';
import CellsZarrLoader from './CellsZarrLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
// To suppprt anndata-expression-matrix.zarr
import ObsIndexAnndataLoader from './ObsIndexAnndataLoader';
import FeatureIndexAnndataLoader from './FeatureIndexAnndataLoader';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader';

export default {
  CellSetsZarrLoader,
  CellsZarrLoader,
  MatrixZarrLoader,
  ObsIndexAnndataLoader,
  FeatureIndexAnndataLoader,
  ObsFeatureMatrixAnndataLoader,
};
