export default class OmeZarrAsObsSegmentationsLoader extends OmeZarrLoader {
    load(): Promise<LoaderResult<{
        obsSegmentationsType: string;
        obsSegmentations: {
            loaders: any;
            meta: any;
            instance: import("@vitessce/image-utils").ImageWrapper;
        };
    }>>;
}
import OmeZarrLoader from './OmeZarrLoader.js';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=OmeZarrAsObsSegmentationsLoader.d.ts.map