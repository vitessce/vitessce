import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';
import { fetchNeuroglancerInfo } from './utils.js';

export default class NgAnnotationLocationsDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, requestInit, options } = this;

    if (!this.neuroglancerInfo) {
      this.neuroglancerInfo = fetchNeuroglancerInfo(url, requestInit);
    }
    const neuroglancerInfo = await this.neuroglancerInfo;

    return new LoaderResult(
      {
        obsIndex: null,
        obsLocations: null,
        obsLocationsTilingType: 'neuroglancer',
        neuroglancerOptions: options,
        // Contents of the annotation source's `info` JSON file
        // (e.g., lower_bound, upper_bound, spatial, properties).
        neuroglancerInfo,
        // The multi-level data hooks only return the `data` part of the
        // LoaderResult, so the source URL is also included here.
        neuroglancerUrl: url,
      },
      url,
    );
  }
}
