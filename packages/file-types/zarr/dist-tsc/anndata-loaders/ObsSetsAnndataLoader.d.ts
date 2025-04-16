/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class ObsSetsAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    loadObsIndices(): Promise<any[]>;
    loadCellSetIds(): any;
    loadCellSetScores(): any;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        obsSets: any;
        obsSetsMembership: Map<any, any>;
    }>>;
    cachedResult: Promise<any[]> | undefined;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=ObsSetsAnndataLoader.d.ts.map