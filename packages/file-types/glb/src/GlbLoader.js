import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export default class GlbLoader extends AbstractTwoStepLoader {
    getSourceData() {
        const {
            url,
        } = this;
        return url;
    }

    async load() {
        return Promise.resolve(new LoaderResult(
            {
                obsIndex: [],
                obsSegmentations: `Something here from ${this.url}`,
                obsSegmentationsType: 'mesh',
            },
            this.url,
        ));
    }
}
