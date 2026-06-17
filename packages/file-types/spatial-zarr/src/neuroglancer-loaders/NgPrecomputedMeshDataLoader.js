import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class PrecomputedMeshDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;
    return new LoaderResult(
      {
        obsIndex: null,
        obsSegmentations: {},
        obsSegmentationsType: 'mesh',
        neuroglancerOptions: options,
      },
      url,
    );
  }
}
