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
            null,
            this.url,
        ));
    }
}
