import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsObsFeatureMatrixLoader extends MatrixZarrLoader {
  load() {
    return Promise
      .all([this.loadAttrs(), this.loadArr()])
      .then(([attrs, arr]) => Promise.resolve(new LoaderResult(
        { obsIndex: attrs.data.rows, featureIndex: attrs.data.cols, obsFeatureMatrix: arr },
        null,
      )));
  }
}
