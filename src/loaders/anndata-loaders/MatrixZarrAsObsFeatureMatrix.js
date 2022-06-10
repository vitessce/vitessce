import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsObsFeatureMatrixLoader extends MatrixZarrLoader {
  load() {
    return this.loadCellXGene().then(
      async arr => Promise.resolve(new LoaderResult(arr, null)),
    );
  }
}
