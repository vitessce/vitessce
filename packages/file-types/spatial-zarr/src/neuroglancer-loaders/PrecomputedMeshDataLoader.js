import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class PrecomputedMeshDataLoader extends AbstractTwoStepLoader {
  async load() {
    return new LoaderResult(
      {
        obsIndex: null,
        obsSegmentations: {},
        obsSegmentationsType: 'mesh',
      },
      url,
    );
  }
}
