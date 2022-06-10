import LoaderResult from '../LoaderResult';
import MatrixZarrLoader from './MatrixZarrLoader';

export default class ObsIndexAnndataLoader extends MatrixZarrLoader {
  load() {
    return this.loadAttrs().then((attrs) => {
      const { rows: obsIndex } = attrs.data;
      return Promise.resolve(new LoaderResult(obsIndex, null));
    });
  }
}
