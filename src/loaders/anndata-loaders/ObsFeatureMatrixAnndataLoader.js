import LoaderResult from '../LoaderResult';
import MatrixZarrLoader from './MatrixZarrLoader';

export default class ObsFeatureMatrixAnndataLoader extends MatrixZarrLoader {
  async load() {
    return Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadFilteredGeneNames(),
      this.loadCellXGene(),
    ]).then(([obsIndex, featureIndex, obsFeatureMatrix]) => Promise.resolve(new LoaderResult(
      { obsIndex, featureIndex, obsFeatureMatrix },
      null,
    )));
  }
}
