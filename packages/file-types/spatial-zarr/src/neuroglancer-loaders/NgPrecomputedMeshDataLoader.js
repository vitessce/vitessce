import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class PrecomputedMeshDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;
    return new LoaderResult(
      {
        obsIndex: null,
        obsSegmentations: {},
        obsSegmentationsType: 'mesh',
        // TODO: the "Right way" to do this would be to pass these options via the coordination space,
        // but that would require defining new coordination types or aligning with existing ones,
        // and we need to think carefully about that.
        neuroglancerOptions: options,
      },
      url,
    );
  }
}
