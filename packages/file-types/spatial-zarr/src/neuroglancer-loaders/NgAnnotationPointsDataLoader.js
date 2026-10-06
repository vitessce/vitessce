import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';
import { fetchNeuroglancerInfo } from './utils.js';

export default class NgAnnotationPointsDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, requestInit, options } = this;

    if (!this.neuroglancerInfo) {
      this.neuroglancerInfo = fetchNeuroglancerInfo(url, requestInit);
    }
    const neuroglancerInfo = await this.neuroglancerInfo;

    return new LoaderResult(
      {
        obsIndex: null,
        obsPoints: null,
        featureIds: null,
        obsPointsModelMatrix: null,
        obsPointsTilingType: 'neuroglancer',
        neuroglancerOptions: options,
        // Contents of the annotation source's `info` JSON file
        // (e.g., lower_bound, upper_bound, spatial, properties).
        neuroglancerInfo,
      },
      url,
    );
  }
}
