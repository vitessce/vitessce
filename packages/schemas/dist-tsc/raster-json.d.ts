import { z } from 'zod';
export declare const rasterJsonSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"0.0.2">;
    usePhysicalSizeScaling: z.ZodOptional<z.ZodBoolean>;
    renderLayers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
        metadata: z.ZodOptional<z.ZodObject<{
            dimensions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                field: z.ZodString;
                type: z.ZodEnum<["quantitative", "nominal", "ordinal", "temporal"]>;
                values: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }, {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }>, "many">>;
            isPyramid: z.ZodOptional<z.ZodBoolean>;
            transform: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
                scale: z.ZodNumber;
                translate: z.ZodObject<{
                    y: z.ZodNumber;
                    x: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    x: number;
                    y: number;
                }, {
                    x: number;
                    y: number;
                }>;
            }, "strip", z.ZodTypeAny, {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            }, {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            }>, z.ZodObject<{
                matrix: z.ZodArray<z.ZodNumber, "many">;
            }, "strip", z.ZodTypeAny, {
                matrix: number[];
            }, {
                matrix: number[];
            }>]>>;
            isBitmask: z.ZodOptional<z.ZodBoolean>;
            omeTiffOffsetsUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        }, {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        }>>;
        requestInit: z.ZodOptional<z.ZodObject<{
            method: z.ZodOptional<z.ZodString>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            body: z.ZodOptional<z.ZodString>;
            mode: z.ZodOptional<z.ZodString>;
            credentials: z.ZodOptional<z.ZodString>;
            cache: z.ZodOptional<z.ZodString>;
            redirect: z.ZodOptional<z.ZodString>;
            referrer: z.ZodOptional<z.ZodString>;
            integrity: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            method?: string | undefined;
            headers?: Record<string, any> | undefined;
            body?: string | undefined;
            mode?: string | undefined;
            credentials?: string | undefined;
            cache?: string | undefined;
            redirect?: string | undefined;
            referrer?: string | undefined;
            integrity?: string | undefined;
        }, {
            method?: string | undefined;
            headers?: Record<string, any> | undefined;
            body?: string | undefined;
            mode?: string | undefined;
            credentials?: string | undefined;
            cache?: string | undefined;
            redirect?: string | undefined;
            referrer?: string | undefined;
            integrity?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        url: string;
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
        metadata?: {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        } | undefined;
    }, {
        type: string;
        name: string;
        url: string;
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
        metadata?: {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    schemaVersion: "0.0.2";
    images: {
        type: string;
        name: string;
        url: string;
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
        metadata?: {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        } | undefined;
    }[];
    usePhysicalSizeScaling?: boolean | undefined;
    renderLayers?: string[] | undefined;
}, {
    schemaVersion: "0.0.2";
    images: {
        type: string;
        name: string;
        url: string;
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
        metadata?: {
            dimensions?: {
                values: string[] | null;
                type: "quantitative" | "nominal" | "ordinal" | "temporal";
                field: string;
            }[] | undefined;
            isPyramid?: boolean | undefined;
            transform?: {
                scale: number;
                translate: {
                    x: number;
                    y: number;
                };
            } | {
                matrix: number[];
            } | undefined;
            isBitmask?: boolean | undefined;
            omeTiffOffsetsUrl?: string | undefined;
        } | undefined;
    }[];
    usePhysicalSizeScaling?: boolean | undefined;
    renderLayers?: string[] | undefined;
}>;
//# sourceMappingURL=raster-json.d.ts.map