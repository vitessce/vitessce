import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsFeatureIndexLoader extends MatrixZarrLoader {
  load() {
    return this.loadAttrs().then((attrs) => {
      const { cols: featureIndex } = attrs;
      return Promise.resolve(new LoaderResult(featureIndex, null));
    });
  }
}
