import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsObsFeatureMatrixLoader extends MatrixZarrLoader {
  load() {
    return this.loadArr().then(
      arr => Promise.resolve(new LoaderResult(arr, null)),
    );
  }
}
