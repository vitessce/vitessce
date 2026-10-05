import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';
import { fetchNeuroglancerInfo } from './utils.js';

export default class PrecomputedMeshDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, requestInit, options } = this;

    if (!this.neuroglancerInfo) {
      this.neuroglancerInfo = fetchNeuroglancerInfo(url, requestInit);
    }
    const neuroglancerInfo = await this.neuroglancerInfo;

    return new LoaderResult(
      {
        obsIndex: null,
        obsSegmentations: {},
        obsSegmentationsType: 'mesh',
        neuroglancerOptions: options,
        // Contents of the segmentation source's `info` JSON file
        // (e.g., scales[].size, scales[].voxel_offset, scales[].resolution).
        neuroglancerInfo,
      },
      url,
    );
  }
}
