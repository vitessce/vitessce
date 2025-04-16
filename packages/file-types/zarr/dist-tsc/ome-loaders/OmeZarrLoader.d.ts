export default class OmeZarrLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: any);
    storeRoot: any;
    load(): Promise<LoaderResult<{
        image: {
            loaders: any;
            meta: any;
            instance: ImageWrapper;
        };
        featureIndex: string[];
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { ImageWrapper } from '@vitessce/image-utils';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=OmeZarrLoader.d.ts.map