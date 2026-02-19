import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class NgAnnotationPointsDataLoader extends AbstractTwoStepLoader {
  /* eslint-disable class-methods-use-this */
  async load(url) {
    return new LoaderResult(
      {
        obsIndex: null,
        obsPoints: null,
        featureIds: null,
        obsPointsModelMatrix: null,
        obsPointsTilingType: 'neuroglancer',
      },
      url,
    );
  }
}
