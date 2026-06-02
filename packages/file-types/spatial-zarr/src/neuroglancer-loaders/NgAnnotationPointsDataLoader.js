import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class NgAnnotationPointsDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;

    return new LoaderResult(
      {
        obsIndex: null,
        obsPoints: null,
        featureIds: null,
        obsPointsModelMatrix: null,
        obsPointsTilingType: 'neuroglancer',
        neuroglancerOptions: options,
      },
      url,
    );
  }
}
