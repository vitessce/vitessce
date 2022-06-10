import LoaderResult from '../LoaderResult';
import MatrixZarrLoader from './MatrixZarrLoader';

export default class ObsFeatureMatrixAnndataLoader extends MatrixZarrLoader {
  load() {
    return this.loadCellXGene().then(
      arr => Promise.resolve(new LoaderResult(arr, null)),
    );
  }
}
