import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
    return new Promise((resolve, onError) => {
      loader.load(this.url, (gltf) => {
        const { scene } = gltf;
        resolve(new LoaderResult(
          {
            scene,
            url: this.url,
          },
          this.url,
          {
            obsIndex: [],
            obsSegmentations: `Something here from ${this.url}`,
            obsSegmentationsType: 'mesh',
          },
        ));
      }),
      (xhr) => {
      },
      error => console.log('An error happened', error);
    });
  }
}
