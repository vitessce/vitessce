import CellSetsZarrLoader from './CellSetsZarrLoader';
import CellsZarrLoader from './CellsZarrLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
// To suppprt anndata-expression-matrix.zarr
import ObsIndexAnndataLoader from './ObsIndexAnndataLoader';
import FeatureIndexAnndataLoader from './FeatureIndexAnndataLoader';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader';
import ObsEmbeddingAnndataLoader from './ObsEmbeddingAnndataLoader';
import ObsLocationsAnndataLoader from './ObsLocationsAnndataLoader';
import ObsSegmentationsAnndataLoader from './ObsSegmentationsAnndataLoader';
import ObsSetsAnndataLoader from './ObsSetsAnndataLoader';

export default {
  CellSetsZarrLoader,
  CellsZarrLoader,
  MatrixZarrLoader,
  ObsIndexAnndataLoader,
  FeatureIndexAnndataLoader,
  ObsFeatureMatrixAnndataLoader,
  ObsEmbeddingAnndataLoader,
  ObsLocationsAnndataLoader,
  ObsSegmentationsAnndataLoader,
  ObsSetsAnndataLoader,
};
