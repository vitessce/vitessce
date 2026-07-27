import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class GlbDataLoader extends AbstractTwoStepLoader {
  async load() {
    const { url, options } = this;
    // Loaded dynamically so three stays out of the eager bundle: consumers that
    // never load .glb meshes do not need three installed.
    const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
      // eslint-disable-next-line import/no-unresolved
      import('three/addons/loaders/GLTFLoader.js'),
      // eslint-disable-next-line import/no-unresolved
      import('three/addons/loaders/DRACOLoader.js'),
    ]);
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        // onLoad
        (gltf) => {
          const { scene } = gltf;
          resolve(new LoaderResult(
            {
              obsIndex: null,
              obsSegmentations: { scene, sceneOptions: options },
              obsSegmentationsType: 'mesh',
            },
            url,
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
