import { z } from 'zod';
export declare const imageLayerObj: z.ZodArray<z.ZodObject<{
    channels: z.ZodArray<z.ZodObject<{
        color: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        selection: z.ZodRecord<z.ZodString, z.ZodAny>;
        slider: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        visible: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        selection: Record<string, any>;
        color?: number[] | undefined;
        slider?: number[] | undefined;
        visible?: boolean | undefined;
    }, {
        selection: Record<string, any>;
        color?: number[] | undefined;
        slider?: number[] | undefined;
        visible?: boolean | undefined;
    }>, "many">;
    colormap: z.ZodNullable<z.ZodString>;
    transparentColor: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodNumber, "many">>>;
    index: z.ZodNumber;
    opacity: z.ZodNumber;
    modelMatrix: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    domainType: z.ZodOptional<z.ZodEnum<["Full", "Min/Max"]>>;
    resolution: z.ZodOptional<z.ZodNumber>;
    xSlice: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny, "many">>>;
    renderingMode: z.ZodOptional<z.ZodString>;
    ySlice: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny, "many">>>;
    zSlice: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodAny, "many">>>;
    type: z.ZodOptional<z.ZodEnum<["raster", "bitmask"]>>;
    use3d: z.ZodOptional<z.ZodBoolean>;
    visible: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    channels: {
        selection: Record<string, any>;
        color?: number[] | undefined;
        slider?: number[] | undefined;
        visible?: boolean | undefined;
    }[];
    colormap: string | null;
    index: number;
    opacity: number;
    type?: "raster" | "bitmask" | undefined;
    visible?: boolean | undefined;
    transparentColor?: number[] | null | undefined;
    modelMatrix?: number[] | undefined;
    domainType?: "Full" | "Min/Max" | undefined;
    resolution?: number | undefined;
    xSlice?: any[] | null | undefined;
    renderingMode?: string | undefined;
    ySlice?: any[] | null | undefined;
    zSlice?: any[] | null | undefined;
    use3d?: boolean | undefined;
}, {
    channels: {
        selection: Record<string, any>;
        color?: number[] | undefined;
        slider?: number[] | undefined;
        visible?: boolean | undefined;
    }[];
    colormap: string | null;
    index: number;
    opacity: number;
    type?: "raster" | "bitmask" | undefined;
    visible?: boolean | undefined;
    transparentColor?: number[] | null | undefined;
    modelMatrix?: number[] | undefined;
    domainType?: "Full" | "Min/Max" | undefined;
    resolution?: number | undefined;
    xSlice?: any[] | null | undefined;
    renderingMode?: string | undefined;
    ySlice?: any[] | null | undefined;
    zSlice?: any[] | null | undefined;
    use3d?: boolean | undefined;
}>, "many">;
export declare const cellsLayerObj: z.ZodObject<{
    visible: z.ZodBoolean;
    stroked: z.ZodBoolean;
    radius: z.ZodNumber;
    opacity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    visible: boolean;
    opacity: number;
    stroked: boolean;
    radius: number;
}, {
    visible: boolean;
    opacity: number;
    stroked: boolean;
    radius: number;
}>;
export declare const neighborhoodsLayerObj: z.ZodObject<{
    visible: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    visible: boolean;
}, {
    visible: boolean;
}>;
export declare const moleculesLayerObj: z.ZodObject<{
    visible: z.ZodBoolean;
    radius: z.ZodNumber;
    opacity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    visible: boolean;
    opacity: number;
    radius: number;
}, {
    visible: boolean;
    opacity: number;
    radius: number;
}>;
//# sourceMappingURL=spatial-layers.d.ts.map