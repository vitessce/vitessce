import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class PrecomputedMeshDataLoader extends AbstractTwoStepLoader {
  /* eslint-disable class-methods-use-this */
  async load(url) {
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
