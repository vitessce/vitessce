import { PluginFileType, PluginJointFileType, PluginViewType, PluginCoordinationType } from '@vitessce/plugins';
import type { DataLoader, DataSource } from '@vitessce/plugins';
import { z } from '@vitessce/schemas';
export declare const baseViewTypes: PluginViewType[];
export declare const baseFileTypes: PluginFileType<DataLoader, DataSource, z.ZodTypeAny>[];
export declare const baseJointFileTypes: (PluginJointFileType<z.ZodObject<{
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
}>> | PluginJointFileType<z.ZodObject<{
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
}>> | PluginJointFileType<z.ZodObject<{
    xy: z.ZodOptional<z.ZodString>;
    poly: z.ZodOptional<z.ZodString>;
    factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    mappings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        key: z.ZodString;
        dims: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        key: string;
        dims: number[];
    }, {
        key: string;
        dims: number[];
    }>>>;
}, "strip", z.ZodTypeAny, {
    xy?: string | undefined;
    poly?: string | undefined;
    factors?: string[] | undefined;
    mappings?: Record<string, {
        key: string;
        dims: number[];
    }> | undefined;
}, {
    xy?: string | undefined;
    poly?: string | undefined;
    factors?: string[] | undefined;
    mappings?: Record<string, {
        key: string;
        dims: number[];
    }> | undefined;
}>> | PluginJointFileType<z.ZodArray<z.ZodObject<{
    groupName: z.ZodString;
    setName: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    scoreName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    groupName: string;
    setName: string | string[];
    scoreName?: string | undefined;
}, {
    groupName: string;
    setName: string | string[];
    scoreName?: string | undefined;
}>, "many">> | PluginJointFileType<z.ZodObject<{
    matrix: z.ZodString;
    geneFilter: z.ZodOptional<z.ZodString>;
    matrixGeneFilter: z.ZodOptional<z.ZodString>;
    geneAlias: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    matrix: string;
    geneFilter?: string | undefined;
    matrixGeneFilter?: string | undefined;
    geneAlias?: string | undefined;
}, {
    matrix: string;
    geneFilter?: string | undefined;
    matrixGeneFilter?: string | undefined;
    geneAlias?: string | undefined;
}>> | PluginJointFileType<z.ZodNull> | PluginJointFileType<z.ZodObject<{
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
}>> | PluginJointFileType<z.ZodOptional<z.ZodObject<{
    obsLabelsTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    embeddingTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    obsLabelsTypes?: string[] | undefined;
    embeddingTypes?: string[] | undefined;
}, {
    obsLabelsTypes?: string[] | undefined;
    embeddingTypes?: string[] | undefined;
}>>>)[];
export declare const baseCoordinationTypes: (PluginCoordinationType<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>> | PluginCoordinationType<z.ZodNullable<z.ZodString>> | PluginCoordinationType<z.ZodString> | PluginCoordinationType<z.ZodNullable<z.ZodNumber>> | PluginCoordinationType<z.ZodBoolean> | PluginCoordinationType<z.ZodNumber> | PluginCoordinationType<z.ZodEnum<["manual", "auto"]>> | PluginCoordinationType<z.ZodNullable<z.ZodBoolean>> | PluginCoordinationType<z.ZodNullable<z.ZodArray<z.ZodObject<{
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
}>, "many">>> | PluginCoordinationType<z.ZodNullable<z.ZodUnion<[z.ZodObject<{
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
}>, z.ZodArray<z.ZodObject<{
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
}>, "many">]>>> | PluginCoordinationType<z.ZodNullable<z.ZodObject<{
    visible: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    visible: boolean;
}, {
    visible: boolean;
}>>> | PluginCoordinationType<z.ZodNullable<z.ZodArray<z.ZodString, "many">>> | PluginCoordinationType<z.ZodNullable<z.ZodArray<z.ZodArray<z.ZodString, "many">, "many">>> | PluginCoordinationType<z.ZodNullable<z.ZodArray<z.ZodObject<{
    path: z.ZodArray<z.ZodString, "many">;
    color: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    path: string[];
    color: number[];
}, {
    path: string[];
    color: number[];
}>, "many">>> | PluginCoordinationType<z.ZodEnum<["geneSelection", "cellSetSelection", "spatialChannelColor", "spatialLayerColor", "obsLabels"]>> | PluginCoordinationType<z.ZodNullable<z.ZodEnum<["log1p", "arcsinh"]>>> | PluginCoordinationType<z.ZodArray<z.ZodNumber, "many">> | PluginCoordinationType<z.ZodNullable<z.ZodEffects<z.ZodUnion<[z.ZodObject<{
    version: z.ZodLiteral<"0.1.3">;
    tree: z.ZodArray<z.ZodType<{
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    }, z.ZodTypeDef, {
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version: "0.1.3";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}, {
    version: "0.1.3";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}>, z.ZodObject<{
    version: z.ZodLiteral<"0.1.2">;
    tree: z.ZodArray<z.ZodType<{
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: string[];
            name: string;
            color?: number[] | undefined;
        })[];
    }, z.ZodTypeDef, {
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: string[];
            name: string;
            color?: number[] | undefined;
        })[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version: "0.1.2";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: string[];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}, {
    version: "0.1.2";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: string[];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}>]>, {
    version: "0.1.3";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}, {
    version: "0.1.2";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: string[];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
} | {
    version: "0.1.3";
    tree: ({
        name: string;
        color?: number[] | undefined;
    } & {
        children: (({
            name: string;
            color?: number[] | undefined;
        } & any) | {
            set: [string, number | null][];
            name: string;
            color?: number[] | undefined;
        })[];
    })[];
}>>> | PluginCoordinationType<z.ZodNullable<z.ZodUnion<[z.ZodNumber, z.ZodString]>>> | PluginCoordinationType<z.ZodNullable<z.ZodArray<z.ZodNumber, "many">>> | PluginCoordinationType<z.ZodNullable<z.ZodEnum<["BlackIsZero", "RGB"]>>> | PluginCoordinationType<z.ZodNullable<z.ZodEnum<["2D", "3D"]>>> | PluginCoordinationType<z.ZodEnum<["maximumIntensityProjection", "additive"]>> | PluginCoordinationType<z.ZodEnum<["vertical", "horizontal"]>>)[];
//# sourceMappingURL=base-plugins.d.ts.map