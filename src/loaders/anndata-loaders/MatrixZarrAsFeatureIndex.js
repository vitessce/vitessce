import MatrixZarrLoader from './MatrixZarrLoader';
import LoaderResult from '../LoaderResult';

export default class MatrixZarrAsFeatureIndexLoader extends MatrixZarrLoader {
  load() {
    return this.loadAttrs().then(
      async (attrs) => {
        const {
          options: { matrixGeneFilter: matrixGeneFilterZarr },
        } = this;
        let { cols: featureIndex } = attrs;
        // In order to return the correct gene list with the heatmap data,
        // we need to filter the columns of attrs so it matches the cellXGene data.
        if (matrixGeneFilterZarr) {
          const matrixGeneFilter = await this.dataSource.getFlatArrDecompressed(
            matrixGeneFilterZarr,
          );
          featureIndex = featureIndex.filter((_, i) => matrixGeneFilter[i]);
        }
        return Promise.resolve(new LoaderResult(featureIndex, null));
      },
    );
  }
}
