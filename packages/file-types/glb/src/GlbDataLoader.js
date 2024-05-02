import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';
// eslint-disable-next-line import/no-unresolved
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// eslint-disable-next-line import/no-unresolved
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default class GlbDataLoader extends AbstractTwoStepLoader {
  getSourceData() {
    const {
      url,
    } = this;
    return url;
  }

  async load() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    return new Promise((resolve, reject) => {
      loader.load(
        this.url,
        // onLoad
        (gltf) => {
          const { scene } = gltf;
          resolve(new LoaderResult(
            {
              obsIndex: null,
              obsSegmentations: { scene },
              obsSegmentationsType: 'mesh',
            },
            this.url,
          ));
        },
        // onProgress
        () => {},
        // onError
        error => reject(error),
      );
    });
  }
}
