import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';
import {useGLTF} from '@react-three/drei'

export default class GlbLoader extends AbstractTwoStepLoader {
    getSourceData() {
        const {
            url,
        } = this;
        return url;
    }

    async load() {
        const {scene} = useGLTF(this.url,
            'https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        return new LoaderResult(
            {
                scene: scene,
                url: this.url
            },
            this.url,
            {
                obsIndex: [],
                obsSegmentations: `Something here from ${this.url}`,
                obsSegmentationsType: 'mesh',
            }
        );
    }
}
