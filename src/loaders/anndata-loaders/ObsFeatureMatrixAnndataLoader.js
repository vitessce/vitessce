import LoaderResult from '../LoaderResult';
import MatrixZarrLoader from './MatrixZarrLoader';

export default class ObsFeatureMatrixAnndataLoader extends MatrixZarrLoader {
  async load() {
    return Promise.all([
      this.dataSource.loadObsIndex(), // TODO: use updated options.
      this.loadFilteredGeneNames(), // TODO: use updated options.
      this.loadCellXGene(), // TODO: use updated options.
    ]).then(([obsIndex, featureIndex, obsFeatureMatrix]) => Promise.resolve(new LoaderResult(
      { obsIndex, featureIndex, obsFeatureMatrix },
      null,
    )));
  }
}
