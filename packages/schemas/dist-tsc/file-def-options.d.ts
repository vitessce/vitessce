import { z } from 'zod';
export declare const imageOmeTiffSchema: z.ZodObject<{
    offsetsUrl: z.ZodOptional<z.ZodString>;
    coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"identity">;
    }, "strip", z.ZodTypeAny, {
        type: "identity";
    }, {
        type: "identity";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"translation">;
        translation: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "translation";
        translation: number[];
    }, {
        type: "translation";
        translation: number[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"scale">;
        scale: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "scale";
        scale: number[];
    }, {
        type: "scale";
        scale: number[];
    }>]>, "many">>;
}, "strip", z.ZodTypeAny, {
    offsetsUrl?: string | undefined;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}, {
    offsetsUrl?: string | undefined;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}>;
export declare const obsSegmentationsOmeTiffSchema: z.ZodObject<z.objectUtil.extendShape<{
    offsetsUrl: z.ZodOptional<z.ZodString>;
    coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"identity">;
    }, "strip", z.ZodTypeAny, {
        type: "identity";
    }, {
        type: "identity";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"translation">;
        translation: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "translation";
        translation: number[];
    }, {
        type: "translation";
        translation: number[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"scale">;
        scale: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "scale";
        scale: number[];
    }, {
        type: "scale";
        scale: number[];
    }>]>, "many">>;
}, {
    obsTypesFromChannelNames: z.ZodOptional<z.ZodBoolean>;
}>, "strip", z.ZodTypeAny, {
    offsetsUrl?: string | undefined;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
    obsTypesFromChannelNames?: boolean | undefined;
}, {
    offsetsUrl?: string | undefined;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
    obsTypesFromChannelNames?: boolean | undefined;
}>;
export declare const imageOmeZarrSchema: z.ZodObject<{
    coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"identity">;
    }, "strip", z.ZodTypeAny, {
        type: "identity";
    }, {
        type: "identity";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"translation">;
        translation: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "translation";
        translation: number[];
    }, {
        type: "translation";
        translation: number[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"scale">;
        scale: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "scale";
        scale: number[];
    }, {
        type: "scale";
        scale: number[];
    }>]>, "many">>;
}, "strip", z.ZodTypeAny, {
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}, {
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}>;
export declare const obsSegmentationsOmeZarrSchema: z.ZodObject<z.objectUtil.extendShape<{
    coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"identity">;
    }, "strip", z.ZodTypeAny, {
        type: "identity";
    }, {
        type: "identity";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"translation">;
        translation: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "translation";
        translation: number[];
    }, {
        type: "translation";
        translation: number[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"scale">;
        scale: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "scale";
        scale: number[];
    }, {
        type: "scale";
        scale: number[];
    }>]>, "many">>;
}, {
    obsTypesFromChannelNames: z.ZodOptional<z.ZodBoolean>;
}>, "strip", z.ZodTypeAny, {
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
    obsTypesFromChannelNames?: boolean | undefined;
}, {
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
    obsTypesFromChannelNames?: boolean | undefined;
}>;
export declare const imageSpatialdataSchema: z.ZodObject<z.objectUtil.extendShape<{
    coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"identity">;
    }, "strip", z.ZodTypeAny, {
        type: "identity";
    }, {
        type: "identity";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"translation">;
        translation: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "translation";
        translation: number[];
    }, {
        type: "translation";
        translation: number[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"scale">;
        scale: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "scale";
        scale: number[];
    }, {
        type: "scale";
        scale: number[];
    }>]>, "many">>;
}, {
    path: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    path: string;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}, {
    path: string;
    coordinateTransformations?: ({
        type: "identity";
    } | {
        type: "translation";
        translation: number[];
    } | {
        type: "scale";
        scale: number[];
    })[] | undefined;
}>;
export declare const obsSegmentationsSpatialdataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const obsLocationsSpatialdataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const obsSpotsSpatialdataSchema: z.ZodObject<{
    path: z.ZodString;
    tablePath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    tablePath?: string | undefined;
}, {
    path: string;
    tablePath?: string | undefined;
}>;
export declare const obsFeatureMatrixSpatialdataSchema: z.ZodObject<z.objectUtil.extendShape<{
    path: z.ZodString;
    featureFilterPath: z.ZodOptional<z.ZodString>;
    initialFeatureFilterPath: z.ZodOptional<z.ZodString>;
}, {
    region: z.ZodOptional<z.ZodString>;
}>, "strip", z.ZodTypeAny, {
    path: string;
    featureFilterPath?: string | undefined;
    initialFeatureFilterPath?: string | undefined;
    region?: string | undefined;
}, {
    path: string;
    featureFilterPath?: string | undefined;
    initialFeatureFilterPath?: string | undefined;
    region?: string | undefined;
}>;
export declare const obsSetsSpatialdataSchema: z.ZodObject<{
    region: z.ZodOptional<z.ZodString>;
    tablePath: z.ZodOptional<z.ZodString>;
    obsSets: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        scorePath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }, {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    obsSets: {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }[];
    tablePath?: string | undefined;
    region?: string | undefined;
}, {
    obsSets: {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }[];
    tablePath?: string | undefined;
    region?: string | undefined;
}>;
export declare const meshGlbSchema: z.ZodNullable<z.ZodObject<{
    targetX: z.ZodOptional<z.ZodNumber>;
    targetY: z.ZodOptional<z.ZodNumber>;
    targetZ: z.ZodOptional<z.ZodNumber>;
    rotationX: z.ZodOptional<z.ZodNumber>;
    rotationY: z.ZodOptional<z.ZodNumber>;
    rotationZ: z.ZodOptional<z.ZodNumber>;
    scaleX: z.ZodOptional<z.ZodNumber>;
    scaleY: z.ZodOptional<z.ZodNumber>;
    scaleZ: z.ZodOptional<z.ZodNumber>;
    sceneRotationX: z.ZodOptional<z.ZodNumber>;
    sceneRotationY: z.ZodOptional<z.ZodNumber>;
    sceneRotationZ: z.ZodOptional<z.ZodNumber>;
    sceneScaleX: z.ZodOptional<z.ZodNumber>;
    sceneScaleY: z.ZodOptional<z.ZodNumber>;
    sceneScaleZ: z.ZodOptional<z.ZodNumber>;
    materialSide: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
}, "strip", z.ZodTypeAny, {
    targetX?: number | undefined;
    targetY?: number | undefined;
    targetZ?: number | undefined;
    rotationX?: number | undefined;
    rotationY?: number | undefined;
    rotationZ?: number | undefined;
    scaleX?: number | undefined;
    scaleY?: number | undefined;
    scaleZ?: number | undefined;
    sceneRotationX?: number | undefined;
    sceneRotationY?: number | undefined;
    sceneRotationZ?: number | undefined;
    sceneScaleX?: number | undefined;
    sceneScaleY?: number | undefined;
    sceneScaleZ?: number | undefined;
    materialSide?: "front" | "back" | undefined;
}, {
    targetX?: number | undefined;
    targetY?: number | undefined;
    targetZ?: number | undefined;
    rotationX?: number | undefined;
    rotationY?: number | undefined;
    rotationZ?: number | undefined;
    scaleX?: number | undefined;
    scaleY?: number | undefined;
    scaleZ?: number | undefined;
    sceneRotationX?: number | undefined;
    sceneRotationY?: number | undefined;
    sceneRotationZ?: number | undefined;
    sceneScaleX?: number | undefined;
    sceneScaleY?: number | undefined;
    sceneScaleZ?: number | undefined;
    materialSide?: "front" | "back" | undefined;
}>>;
/**
 * Options schemas for atomic file types.
 */
export declare const obsEmbeddingAnndataSchema: z.ZodObject<{
    path: z.ZodString;
    dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    dims?: number[] | undefined;
}, {
    path: string;
    dims?: number[] | undefined;
}>;
export declare const obsSpotsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
    dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    dims?: number[] | undefined;
}, {
    path: string;
    dims?: number[] | undefined;
}>;
export declare const obsPointsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
    dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    dims?: number[] | undefined;
}, {
    path: string;
    dims?: number[] | undefined;
}>;
export declare const obsLocationsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
    dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    dims?: number[] | undefined;
}, {
    path: string;
    dims?: number[] | undefined;
}>;
export declare const obsSegmentationsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const obsSetsAnndataSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    path: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    scorePath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string | string[];
    name: string;
    scorePath?: string | undefined;
}, {
    path: string | string[];
    name: string;
    scorePath?: string | undefined;
}>, "many">;
export declare const obsFeatureMatrixAnndataSchema: z.ZodObject<{
    path: z.ZodString;
    featureFilterPath: z.ZodOptional<z.ZodString>;
    initialFeatureFilterPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    featureFilterPath?: string | undefined;
    initialFeatureFilterPath?: string | undefined;
}, {
    path: string;
    featureFilterPath?: string | undefined;
    initialFeatureFilterPath?: string | undefined;
}>;
export declare const obsLabelsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const featureLabelsAnndataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const obsFeatureColumnsAnndataSchema: z.ZodArray<z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>, "many">;
export declare const sampleEdgesAnndataSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const obsEmbeddingCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsEmbedding: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    obsIndex: string;
    obsEmbedding: string[];
}, {
    obsIndex: string;
    obsEmbedding: string[];
}>;
export declare const obsSpotsCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsSpots: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    obsIndex: string;
    obsSpots: string[];
}, {
    obsIndex: string;
    obsSpots: string[];
}>;
export declare const obsPointsCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsPoints: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    obsIndex: string;
    obsPoints: string[];
}, {
    obsIndex: string;
    obsPoints: string[];
}>;
export declare const obsLocationsCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsLocations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    obsIndex: string;
    obsLocations: string[];
}, {
    obsIndex: string;
    obsLocations: string[];
}>;
export declare const obsLabelsCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsLabels: z.ZodString;
}, "strip", z.ZodTypeAny, {
    obsIndex: string;
    obsLabels: string;
}, {
    obsIndex: string;
    obsLabels: string;
}>;
export declare const featureLabelsCsvSchema: z.ZodObject<{
    featureIndex: z.ZodString;
    featureLabels: z.ZodString;
}, "strip", z.ZodTypeAny, {
    featureIndex: string;
    featureLabels: string;
}, {
    featureIndex: string;
    featureLabels: string;
}>;
export declare const obsSetsCsvSchema: z.ZodObject<{
    obsIndex: z.ZodString;
    obsSets: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        column: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        scoreColumn: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }, {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    obsSets: {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }[];
    obsIndex: string;
}, {
    obsSets: {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }[];
    obsIndex: string;
}>;
export declare const sampleSetsCsvSchema: z.ZodObject<{
    sampleIndex: z.ZodString;
    sampleSets: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        column: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        scoreColumn: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }, {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sampleIndex: string;
    sampleSets: {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }[];
}, {
    sampleIndex: string;
    sampleSets: {
        name: string;
        column: string | string[];
        scoreColumn?: string | undefined;
    }[];
}>;
/**
 * Options schemas for joint file types.
 */
export declare const anndataZarrSchema: z.ZodObject<{
    obsLabels: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>, z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        obsLabelsType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        obsLabelsType: string;
    }, {
        path: string;
        obsLabelsType: string;
    }>, "many">]>>;
    featureLabels: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>, z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        featureLabelsType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        featureLabelsType: string;
    }, {
        path: string;
        featureLabelsType: string;
    }>, "many">]>>;
    obsFeatureMatrix: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        featureFilterPath: z.ZodOptional<z.ZodString>;
        initialFeatureFilterPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
    }, {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
    }>>;
    obsSets: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        scorePath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }, {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }>, "many">>;
    obsSpots: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        dims?: number[] | undefined;
    }, {
        path: string;
        dims?: number[] | undefined;
    }>>;
    obsPoints: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        dims?: number[] | undefined;
    }, {
        path: string;
        dims?: number[] | undefined;
    }>>;
    obsLocations: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        dims?: number[] | undefined;
    }, {
        path: string;
        dims?: number[] | undefined;
    }>>;
    obsSegmentations: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>>;
    obsEmbedding: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        path: z.ZodString;
        dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        dims?: number[] | undefined;
    }, {
        path: string;
        dims?: number[] | undefined;
    }>, z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        dims: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        embeddingType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
        embeddingType: string;
        dims?: number[] | undefined;
    }, {
        path: string;
        embeddingType: string;
        dims?: number[] | undefined;
    }>, "many">]>>;
}, "strip", z.ZodTypeAny, {
    obsSets?: {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }[] | undefined;
    obsEmbedding?: {
        path: string;
        dims?: number[] | undefined;
    } | {
        path: string;
        embeddingType: string;
        dims?: number[] | undefined;
    }[] | undefined;
    obsSpots?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsPoints?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsLocations?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsLabels?: {
        path: string;
    } | {
        path: string;
        obsLabelsType: string;
    }[] | undefined;
    featureLabels?: {
        path: string;
    } | {
        path: string;
        featureLabelsType: string;
    }[] | undefined;
    obsFeatureMatrix?: {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
    } | undefined;
    obsSegmentations?: {
        path: string;
    } | undefined;
}, {
    obsSets?: {
        path: string | string[];
        name: string;
        scorePath?: string | undefined;
    }[] | undefined;
    obsEmbedding?: {
        path: string;
        dims?: number[] | undefined;
    } | {
        path: string;
        embeddingType: string;
        dims?: number[] | undefined;
    }[] | undefined;
    obsSpots?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsPoints?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsLocations?: {
        path: string;
        dims?: number[] | undefined;
    } | undefined;
    obsLabels?: {
        path: string;
    } | {
        path: string;
        obsLabelsType: string;
    }[] | undefined;
    featureLabels?: {
        path: string;
    } | {
        path: string;
        featureLabelsType: string;
    }[] | undefined;
    obsFeatureMatrix?: {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
    } | undefined;
    obsSegmentations?: {
        path: string;
    } | undefined;
}>;
export declare const spatialdataZarrSchema: z.ZodObject<{
    image: z.ZodOptional<z.ZodObject<z.objectUtil.extendShape<{
        coordinateTransformations: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"identity">;
        }, "strip", z.ZodTypeAny, {
            type: "identity";
        }, {
            type: "identity";
        }>, z.ZodObject<{
            type: z.ZodLiteral<"translation">;
            translation: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "translation";
            translation: number[];
        }, {
            type: "translation";
            translation: number[];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"scale">;
            scale: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "scale";
            scale: number[];
        }, {
            type: "scale";
            scale: number[];
        }>]>, "many">>;
    }, {
        path: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        path: string;
        coordinateTransformations?: ({
            type: "identity";
        } | {
            type: "translation";
            translation: number[];
        } | {
            type: "scale";
            scale: number[];
        })[] | undefined;
    }, {
        path: string;
        coordinateTransformations?: ({
            type: "identity";
        } | {
            type: "translation";
            translation: number[];
        } | {
            type: "scale";
            scale: number[];
        })[] | undefined;
    }>>;
    labels: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>>;
    obsFeatureMatrix: z.ZodOptional<z.ZodObject<z.objectUtil.extendShape<{
        path: z.ZodString;
        featureFilterPath: z.ZodOptional<z.ZodString>;
        initialFeatureFilterPath: z.ZodOptional<z.ZodString>;
    }, {
        region: z.ZodOptional<z.ZodString>;
    }>, "strip", z.ZodTypeAny, {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
        region?: string | undefined;
    }, {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
        region?: string | undefined;
    }>>;
    obsSpots: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        tablePath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        tablePath?: string | undefined;
    }, {
        path: string;
        tablePath?: string | undefined;
    }>>;
    obsSets: z.ZodOptional<z.ZodObject<{
        region: z.ZodOptional<z.ZodString>;
        tablePath: z.ZodOptional<z.ZodString>;
        obsSets: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
            scorePath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }, {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        obsSets: {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }[];
        tablePath?: string | undefined;
        region?: string | undefined;
    }, {
        obsSets: {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }[];
        tablePath?: string | undefined;
        region?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    obsSets?: {
        obsSets: {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }[];
        tablePath?: string | undefined;
        region?: string | undefined;
    } | undefined;
    obsSpots?: {
        path: string;
        tablePath?: string | undefined;
    } | undefined;
    obsFeatureMatrix?: {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
        region?: string | undefined;
    } | undefined;
    image?: {
        path: string;
        coordinateTransformations?: ({
            type: "identity";
        } | {
            type: "translation";
            translation: number[];
        } | {
            type: "scale";
            scale: number[];
        })[] | undefined;
    } | undefined;
    labels?: {
        path: string;
    } | undefined;
}, {
    obsSets?: {
        obsSets: {
            path: string | string[];
            name: string;
            scorePath?: string | undefined;
        }[];
        tablePath?: string | undefined;
        region?: string | undefined;
    } | undefined;
    obsSpots?: {
        path: string;
        tablePath?: string | undefined;
    } | undefined;
    obsFeatureMatrix?: {
        path: string;
        featureFilterPath?: string | undefined;
        initialFeatureFilterPath?: string | undefined;
        region?: string | undefined;
    } | undefined;
    image?: {
        path: string;
        coordinateTransformations?: ({
            type: "identity";
        } | {
            type: "translation";
            translation: number[];
        } | {
            type: "scale";
            scale: number[];
        })[] | undefined;
    } | undefined;
    labels?: {
        path: string;
    } | undefined;
}>;
//# sourceMappingURL=file-def-options.d.ts.map