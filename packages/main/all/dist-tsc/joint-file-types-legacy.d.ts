import type { z } from 'zod';
import type { latestFileDefSchema } from '@vitessce/schemas';
type legacyFileDefSchema = z.infer<typeof latestFileDefSchema> & {
    type?: string;
};
export declare function expandMoleculesJson(fileDef: legacyFileDefSchema): {
    fileType: string;
    coordinationValues: {
        obsType: string;
    };
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    type?: string | undefined;
}[];
export declare function expandExpressionMatrixZarr(fileDef: legacyFileDefSchema): {
    fileType: string;
    coordinationValues: {
        obsType: string;
        featureType: string;
        featureValueType: string;
    };
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    type?: string | undefined;
}[];
export declare function expandRasterJson(fileDef: legacyFileDefSchema): {
    fileType: string;
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    coordinationValues?: Record<string, string> | undefined;
    type?: string | undefined;
}[];
export declare function expandRasterOmeZarr(fileDef: legacyFileDefSchema): {
    fileType: string;
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    coordinationValues?: Record<string, string> | undefined;
    type?: string | undefined;
}[];
export declare function expandCellSetsJson(fileDef: legacyFileDefSchema): {
    fileType: string;
    coordinationValues: {
        obsType: string;
    };
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    type?: string | undefined;
}[];
export declare function expandCellsJson(fileDef: legacyFileDefSchema): any[];
export declare function expandClustersJson(fileDef: legacyFileDefSchema): {
    fileType: string;
    coordinationValues: {
        obsType: string;
        featureType: string;
        featureValueType: string;
    };
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    type?: string | undefined;
}[];
export declare function expandGenesJson(fileDef: legacyFileDefSchema): {
    fileType: string;
    coordinationValues: {
        obsType: string;
        featureType: string;
        featureValueType: string;
    };
    options?: any;
    name?: string | undefined;
    url?: string | undefined;
    requestInit?: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
    type?: string | undefined;
}[];
export declare function expandAnndataCellsZarr(fileDef: legacyFileDefSchema): any[];
export declare function expandAnndataCellSetsZarr(fileDef: legacyFileDefSchema): {
    fileType: string;
    options: any;
    coordinationValues: {
        obsType: string;
    };
    url: string | undefined;
    requestInit: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
}[];
export declare function expandAnndataExpressionMatrixZarr(fileDef: legacyFileDefSchema): ({
    fileType: string;
    options: {
        path: any;
        featureFilterPath?: undefined;
        initialFeatureFilterPath?: undefined;
    };
    coordinationValues: {
        featureType: string;
        obsType?: undefined;
        featureValueType?: undefined;
    };
    url: string | undefined;
    requestInit: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
} | {
    fileType: string;
    options: {
        path: any;
        featureFilterPath: any;
        initialFeatureFilterPath: any;
    };
    coordinationValues: {
        obsType: string;
        featureType: string;
        featureValueType: string;
    };
    url: string | undefined;
    requestInit: {
        method?: string | undefined;
        headers?: Record<string, any> | undefined;
        body?: string | undefined;
        mode?: string | undefined;
        credentials?: string | undefined;
        cache?: string | undefined;
        redirect?: string | undefined;
        referrer?: string | undefined;
        integrity?: string | undefined;
    } | undefined;
})[];
export {};
//# sourceMappingURL=joint-file-types-legacy.d.ts.map