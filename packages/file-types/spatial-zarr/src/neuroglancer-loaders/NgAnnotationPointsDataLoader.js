import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class NgAnnotationPointsDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url } = this;
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
