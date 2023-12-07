import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export default class GlbLoader extends AbstractTwoStepLoader {
    getSourceData() {
        const {
            url,
        } = this;
        console.log("Here with " + url)
        return url;
    }

    async load() {
        console.log("Loading")
        console.log("Delivering url " + this.url)
        return Promise.resolve(new LoaderResult(
            null,
            this.url,
            {
                obsIndex: [],
                obsSegmentations: `Something here from ${this.url}`,
                obsSegmentationsType: 'mesh',
            },
        ));
    }
}
