import { AbstractTwoStepLoader, AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';

export default class CsvLoader extends AbstractTwoStepLoader {
    getSourceData() {
        const {
            url,
        } = this;
        return null;
    }

    async load() {
        const payload = await this.getSourceData().catch(reason => Promise.resolve(reason));
        if (payload instanceof AbstractLoaderError) {
            return Promise.reject(payload);
        }
        const { data, url } = payload;
        const result = this.loadFromCache(data);
        return Promise.resolve(new LoaderResult(
            result,
            url,
        ));
    }
}
