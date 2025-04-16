import { z } from 'zod';
import { configSchema0_1_0, configSchema1_0_0, configSchema1_0_1, configSchema1_0_15, configSchema1_0_16 } from './previous-config-schemas.js';
export declare const legacyViewConfig0_1_0: z.infer<typeof configSchema0_1_0>;
export declare const upgradedLegacyViewConfig0_1_0: z.infer<typeof configSchema1_0_0>;
export declare const legacyViewConfig1_0_0: z.infer<typeof configSchema1_0_0>;
export declare const upgradedLegacyViewConfig1_0_0: z.infer<typeof configSchema1_0_1>;
export declare const missingViewUids: {
    version: string;
    name: string;
    description: string;
    initStrategy: string;
    coordinationSpace: {
        dataset: {
            A: string;
        };
    };
    datasets: {
        files: never[];
        name: string;
        uid: string;
    }[];
    layout: ({
        component: string;
        coordinationScopes: {
            dataset: string;
        };
        h: number;
        w: number;
        x: number;
        y: number;
        uid?: undefined;
    } | {
        component: string;
        uid: string;
        coordinationScopes: {
            dataset: string;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    })[];
};
export declare const viewConfig1_0_10: {
    version: string;
    name: string;
    description: string;
    initStrategy: string;
    coordinationSpace: {
        embeddingTargetX: {
            A: number;
        };
        embeddingTargetY: {
            A: number;
        };
        embeddingType: {
            't-SNE': string;
        };
        embeddingZoom: {
            A: number;
        };
        spatialTargetX: {
            A: number;
        };
        spatialTargetY: {
            A: number;
        };
        spatialZoom: {
            A: number;
        };
    };
    datasets: {
        files: {
            fileType: string;
            type: string;
            url: string;
        }[];
        name: string;
        uid: string;
    }[];
    layout: ({
        component: string;
        coordinationScopes: {
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialZoom?: undefined;
        };
        h: number;
        props: {
            description: string;
            mapping?: undefined;
            view?: undefined;
            cellRadius?: undefined;
        };
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            embeddingTargetX: string;
            embeddingTargetY: string;
            embeddingType: string;
            embeddingZoom: string;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialZoom?: undefined;
        };
        h: number;
        props: {
            mapping: string;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
            cellRadius?: undefined;
        };
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            spatialTargetX: string;
            spatialTargetY: string;
            spatialZoom: string;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
        };
        h: number;
        props: {
            cellRadius: number;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
            mapping?: undefined;
        };
        w: number;
        x: number;
        y: number;
    })[];
};
export declare const initializedViewConfig: {
    version: string;
    name: string;
    description: string;
    initStrategy: string;
    coordinationSpace: {
        obsType: {
            A: string;
        };
        featureType: {
            A: string;
        };
        featureValueType: {
            A: string;
        };
        obsColorEncoding: {
            A: string;
        };
        obsFilter: {
            A: null;
        };
        obsHighlight: {
            A: null;
        };
        obsSetHighlight: {
            A: null;
        };
        obsSetSelection: {
            A: null;
        };
        dataset: {
            A: string;
        };
        embeddingObsOpacity: {
            A: number;
        };
        embeddingObsOpacityMode: {
            A: string;
        };
        embeddingObsRadius: {
            A: number;
        };
        embeddingObsRadiusMode: {
            A: string;
        };
        embeddingRotation: {
            A: number;
        };
        embeddingTargetX: {
            A: number;
        };
        embeddingTargetY: {
            A: number;
        };
        embeddingTargetZ: {
            A: number;
        };
        embeddingType: {
            't-SNE': string;
        };
        embeddingZoom: {
            A: number;
        };
        embeddingObsSetLabelSize: {
            A: number;
        };
        embeddingObsSetLabelsVisible: {
            A: boolean;
        };
        embeddingObsSetPolygonsVisible: {
            A: boolean;
        };
        featureValueColormap: {
            A: string;
        };
        featureValueColormapRange: {
            A: number[];
        };
        featureHighlight: {
            A: null;
        };
        featureSelection: {
            A: null;
        };
        spatialImageLayer: {
            A: null;
        };
        spatialSegmentationLayer: {
            A: null;
        };
        spatialPointLayer: {
            A: null;
        };
        spatialNeighborhoodLayer: {
            A: null;
        };
        spatialRotation: {
            A: number;
        };
        spatialRotationOrbit: {
            A: number;
        };
        spatialOrbitAxis: {
            A: string;
        };
        spatialRotationX: {
            A: null;
        };
        spatialRotationY: {
            A: null;
        };
        spatialRotationZ: {
            A: null;
        };
        spatialTargetX: {
            A: number;
        };
        spatialTargetY: {
            A: number;
        };
        spatialTargetZ: {
            A: null;
        };
        spatialZoom: {
            A: number;
        };
        spatialAxisFixed: {
            A: boolean;
        };
        additionalObsSets: {
            A: null;
        };
        obsSetColor: {
            A: null;
        };
        obsLabelsType: {
            A: null;
        };
        moleculeHighlight: {
            A: null;
        };
    };
    datasets: {
        files: {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
            };
        }[];
        name: string;
        uid: string;
    }[];
    layout: ({
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialImageLayer: string;
            obsType?: undefined;
            obsLabelsType?: undefined;
            featureType?: undefined;
            featureValueType?: undefined;
            obsColorEncoding?: undefined;
            obsFilter?: undefined;
            obsHighlight?: undefined;
            obsSetHighlight?: undefined;
            obsSetSelection?: undefined;
            obsSetColor?: undefined;
            embeddingObsOpacity?: undefined;
            embeddingObsOpacityMode?: undefined;
            embeddingObsRadius?: undefined;
            embeddingObsRadiusMode?: undefined;
            embeddingRotation?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingTargetZ?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingObsSetLabelSize?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
            embeddingObsSetPolygonsVisible?: undefined;
            featureValueColormap?: undefined;
            featureValueColormapRange?: undefined;
            featureHighlight?: undefined;
            featureSelection?: undefined;
            additionalObsSets?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialPointLayer?: undefined;
            spatialNeighborhoodLayer?: undefined;
            spatialRotation?: undefined;
            spatialRotationOrbit?: undefined;
            spatialOrbitAxis?: undefined;
            spatialRotationX?: undefined;
            spatialRotationY?: undefined;
            spatialRotationZ?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialTargetZ?: undefined;
            spatialAxisFixed?: undefined;
            spatialZoom?: undefined;
            moleculeHighlight?: undefined;
        };
        h: number;
        props: {
            description: string;
            mapping?: undefined;
            view?: undefined;
            cellRadius?: undefined;
        };
        uid: string;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            obsLabelsType: string;
            featureType: string;
            featureValueType: string;
            obsColorEncoding: string;
            obsFilter: string;
            obsHighlight: string;
            obsSetHighlight: string;
            obsSetSelection: string;
            obsSetColor: string;
            dataset: string;
            embeddingObsOpacity: string;
            embeddingObsOpacityMode: string;
            embeddingObsRadius: string;
            embeddingObsRadiusMode: string;
            embeddingRotation: string;
            embeddingTargetX: string;
            embeddingTargetY: string;
            embeddingTargetZ: string;
            embeddingType: string;
            embeddingZoom: string;
            embeddingObsSetLabelSize: string;
            embeddingObsSetLabelsVisible: string;
            embeddingObsSetPolygonsVisible: string;
            featureValueColormap: string;
            featureValueColormapRange: string;
            featureHighlight: string;
            featureSelection: string;
            additionalObsSets: string;
            spatialImageLayer?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialPointLayer?: undefined;
            spatialNeighborhoodLayer?: undefined;
            spatialRotation?: undefined;
            spatialRotationOrbit?: undefined;
            spatialOrbitAxis?: undefined;
            spatialRotationX?: undefined;
            spatialRotationY?: undefined;
            spatialRotationZ?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialTargetZ?: undefined;
            spatialAxisFixed?: undefined;
            spatialZoom?: undefined;
            moleculeHighlight?: undefined;
        };
        h: number;
        props: {
            mapping: string;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
            cellRadius?: undefined;
        };
        uid: string;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            obsLabelsType: string;
            obsColorEncoding: string;
            obsFilter: string;
            obsHighlight: string;
            obsSetHighlight: string;
            obsSetSelection: string;
            obsSetColor: string;
            dataset: string;
            featureValueColormap: string;
            featureValueColormapRange: string;
            featureValueType: string;
            featureHighlight: string;
            featureSelection: string;
            featureType: string;
            spatialImageLayer: string;
            spatialSegmentationLayer: string;
            spatialPointLayer: string;
            spatialNeighborhoodLayer: string;
            spatialRotation: string;
            spatialRotationOrbit: string;
            spatialOrbitAxis: string;
            spatialRotationX: string;
            spatialRotationY: string;
            spatialRotationZ: string;
            spatialTargetX: string;
            spatialTargetY: string;
            spatialTargetZ: string;
            spatialAxisFixed: string;
            spatialZoom: string;
            additionalObsSets: string;
            moleculeHighlight: string;
            embeddingObsOpacity?: undefined;
            embeddingObsOpacityMode?: undefined;
            embeddingObsRadius?: undefined;
            embeddingObsRadiusMode?: undefined;
            embeddingRotation?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingTargetZ?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingObsSetLabelSize?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
            embeddingObsSetPolygonsVisible?: undefined;
        };
        h: number;
        props: {
            cellRadius: number;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
            mapping?: undefined;
        };
        uid: string;
        w: number;
        x: number;
        y: number;
    })[];
};
export declare const implicitPerDatasetCoordinations: z.infer<typeof configSchema1_0_15>;
export declare const explicitPerDatasetCoordinations: z.infer<typeof configSchema1_0_16>;
//# sourceMappingURL=view-config-utils.test.fixtures.d.ts.map