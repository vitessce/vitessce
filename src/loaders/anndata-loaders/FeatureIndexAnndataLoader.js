import LoaderResult from '../LoaderResult';
import MatrixZarrLoader from './MatrixZarrLoader';

export default class FeatureIndexAnndataLoader extends MatrixZarrLoader {
  load() {
    return this.loadAttrs().then(async (attrs) => {
      let { cols: featureIndex } = attrs.data;
      const {
        options: { matrixGeneFilter: matrixGeneFilterZarr },
      } = this;
      // In order to return the correct gene list with the heatmap data,
      // we need to filter the columns of attrs so it matches the cellXGene data.
      if (matrixGeneFilterZarr) {
        const matrixGeneFilter = await this.dataSource.getFlatArrDecompressed(
          matrixGeneFilterZarr,
        );
        featureIndex = featureIndex.filter((_, i) => matrixGeneFilter[i]);
      }
      return Promise.resolve(new LoaderResult(featureIndex, null));
    });
  }
}
