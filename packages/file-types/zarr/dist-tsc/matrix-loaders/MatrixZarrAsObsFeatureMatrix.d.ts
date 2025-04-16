export default class MatrixZarrAsObsFeatureMatrixLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    loadAttrs(): Promise<{
        data: any;
        url: null;
    }>;
    attrs: {
        data: any;
        url: null;
    } | undefined;
    loadArr(): Promise<any>;
    arr: any;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        featureIndex: any;
        obsFeatureMatrix: any;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=MatrixZarrAsObsFeatureMatrix.d.ts.map