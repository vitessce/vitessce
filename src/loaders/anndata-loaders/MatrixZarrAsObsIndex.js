import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsObsIndexLoader extends MatrixZarrLoader {
  load() {
    return this.loadAttrs().then(
      async (attrs) => {
        const { rows: obsIndex } = attrs;
        return Promise.resolve(new LoaderResult(obsIndex, null));
      },
    );
  }
}
