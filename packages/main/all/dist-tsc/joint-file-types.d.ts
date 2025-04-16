import type { z } from 'zod';
import type { latestFileDefSchema } from '@vitessce/schemas';
export declare function expandAnndataZarr(fileDef: z.infer<typeof latestFileDefSchema>): any[];
export declare function expandSpatialdataZarr(fileDef: z.infer<typeof latestFileDefSchema>): ({
    fileType: string;
    options: any;
    coordinationValues: {
        obsType: string;
        featureType: string;
        featureValueType: string;
    };
    url?: string | undefined;
    requestInit?: any;
} | {
    fileType: string;
    options: any;
    coordinationValues: {
        obsType: string;
    };
    url?: string | undefined;
    requestInit?: any;
} | {
    fileType: string;
    options: any;
    coordinationValues: {
        featureType: string;
    };
    url?: string | undefined;
    requestInit?: any;
})[];
//# sourceMappingURL=joint-file-types.d.ts.map