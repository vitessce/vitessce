export namespace legacyViewConfig0_1_0 {
    export let version: string;
    let _public: boolean;
    export { _public as public };
    export let name: string;
    export let description: string;
    export let layers: {
        name: string;
        type: string;
        fileType: string;
        url: string;
    }[];
    export let staticLayout: ({
        component: string;
        props: {
            description: string;
            mapping?: undefined;
            view?: undefined;
            cellRadius?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        props: {
            mapping: string;
            view: {
                zoom: number;
                target: number[];
            };
            description?: undefined;
            cellRadius?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        props: {
            cellRadius: number;
            view: {
                zoom: number;
                target: number[];
            };
            description?: undefined;
            mapping?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
}
export namespace upgradedLegacyViewConfig0_1_0 {
    let version_1: string;
    export { version_1 as version };
    let _public_1: boolean;
    export { _public_1 as public };
    let name_1: string;
    export { name_1 as name };
    let description_1: string;
    export { description_1 as description };
    export let initStrategy: string;
    export namespace coordinationSpace {
        namespace embeddingTargetX {
            let A: number;
        }
        namespace embeddingTargetY {
            let A_1: number;
            export { A_1 as A };
        }
        let embeddingType: {
            't-SNE': string;
        };
        namespace embeddingZoom {
            let A_2: number;
            export { A_2 as A };
        }
        namespace spatialTargetX {
            let A_3: number;
            export { A_3 as A };
        }
        namespace spatialTargetY {
            let A_4: number;
            export { A_4 as A };
        }
        namespace spatialZoom {
            let A_5: number;
            export { A_5 as A };
        }
    }
    export let datasets: {
        files: {
            fileType: string;
            type: string;
            url: string;
        }[];
        name: string;
        uid: string;
    }[];
    export let layout: ({
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
}
export namespace legacyViewConfig1_0_0 {
    let version_2: string;
    export { version_2 as version };
    let _public_2: boolean;
    export { _public_2 as public };
    let name_2: string;
    export { name_2 as name };
    let description_2: string;
    export { description_2 as description };
    let initStrategy_1: string;
    export { initStrategy_1 as initStrategy };
    export namespace coordinationSpace_1 {
        namespace dataset {
            let A_6: string;
            export { A_6 as A };
        }
        namespace spatialLayers {
            let A_7: ({
                type: string;
                radius: number;
                visible: boolean;
                index?: undefined;
            } | {
                type: string;
                visible: boolean;
                radius?: undefined;
                index?: undefined;
            } | {
                type: string;
                index: number;
                radius?: undefined;
                visible?: undefined;
            })[];
            export { A_7 as A };
        }
    }
    export { coordinationSpace_1 as coordinationSpace };
    let datasets_1: {
        files: never[];
        name: string;
        uid: string;
    }[];
    export { datasets_1 as datasets };
    let layout_1: ({
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialLayers: string;
        };
        h: number;
        props: {
            description: string;
            cellRadius?: undefined;
            view?: undefined;
        };
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialLayers: string;
        };
        h: number;
        props: {
            cellRadius: number;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
        };
        w: number;
        x: number;
        y: number;
    })[];
    export { layout_1 as layout };
}
export namespace upgradedLegacyViewConfig1_0_0 {
    let version_3: string;
    export { version_3 as version };
    let _public_3: boolean;
    export { _public_3 as public };
    let name_3: string;
    export { name_3 as name };
    let description_3: string;
    export { description_3 as description };
    let initStrategy_2: string;
    export { initStrategy_2 as initStrategy };
    export namespace coordinationSpace_2 {
        export namespace dataset_1 {
            let A_8: string;
            export { A_8 as A };
        }
        export { dataset_1 as dataset };
        export namespace spatialRasterLayers {
            let A_9: {
                index: number;
            }[];
            export { A_9 as A };
        }
        export namespace spatialCellsLayer {
            export namespace A_10 {
                let radius: number;
                let visible: boolean;
            }
            export { A_10 as A };
        }
        export namespace spatialMoleculesLayer {
            export namespace A_11 {
                let visible_1: boolean;
                export { visible_1 as visible };
            }
            export { A_11 as A };
        }
        export namespace spatialNeighborhoodsLayer {
            let A_12: null;
            export { A_12 as A };
        }
    }
    export { coordinationSpace_2 as coordinationSpace };
    let datasets_2: {
        files: never[];
        name: string;
        uid: string;
    }[];
    export { datasets_2 as datasets };
    let layout_2: ({
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialRasterLayers: string;
            spatialCellsLayer?: undefined;
            spatialMoleculesLayer?: undefined;
            spatialNeighborhoodsLayer?: undefined;
        };
        h: number;
        props: {
            description: string;
            cellRadius?: undefined;
            view?: undefined;
        };
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialRasterLayers: string;
            spatialCellsLayer: string;
            spatialMoleculesLayer: string;
            spatialNeighborhoodsLayer: string;
        };
        h: number;
        props: {
            cellRadius: number;
            view: {
                target: number[];
                zoom: number;
            };
            description?: undefined;
        };
        w: number;
        x: number;
        y: number;
    })[];
    export { layout_2 as layout };
}
export namespace missingViewUids {
    let version_4: string;
    export { version_4 as version };
    let name_4: string;
    export { name_4 as name };
    let description_4: string;
    export { description_4 as description };
    let initStrategy_3: string;
    export { initStrategy_3 as initStrategy };
    export namespace coordinationSpace_3 {
        export namespace dataset_2 {
            let A_13: string;
            export { A_13 as A };
        }
        export { dataset_2 as dataset };
    }
    export { coordinationSpace_3 as coordinationSpace };
    let datasets_3: {
        files: never[];
        name: string;
        uid: string;
    }[];
    export { datasets_3 as datasets };
    let layout_3: ({
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
    export { layout_3 as layout };
}
export namespace viewConfig1_0_10 {
    let version_5: string;
    export { version_5 as version };
    let name_5: string;
    export { name_5 as name };
    let description_5: string;
    export { description_5 as description };
    let initStrategy_4: string;
    export { initStrategy_4 as initStrategy };
    export namespace coordinationSpace_4 {
        export namespace embeddingTargetX_1 {
            let A_14: number;
            export { A_14 as A };
        }
        export { embeddingTargetX_1 as embeddingTargetX };
        export namespace embeddingTargetY_1 {
            let A_15: number;
            export { A_15 as A };
        }
        export { embeddingTargetY_1 as embeddingTargetY };
        let embeddingType_1: {
            't-SNE': string;
        };
        export { embeddingType_1 as embeddingType };
        export namespace embeddingZoom_1 {
            let A_16: number;
            export { A_16 as A };
        }
        export { embeddingZoom_1 as embeddingZoom };
        export namespace spatialTargetX_1 {
            let A_17: number;
            export { A_17 as A };
        }
        export { spatialTargetX_1 as spatialTargetX };
        export namespace spatialTargetY_1 {
            let A_18: number;
            export { A_18 as A };
        }
        export { spatialTargetY_1 as spatialTargetY };
        export namespace spatialZoom_1 {
            let A_19: number;
            export { A_19 as A };
        }
        export { spatialZoom_1 as spatialZoom };
    }
    export { coordinationSpace_4 as coordinationSpace };
    let datasets_4: {
        files: {
            fileType: string;
            type: string;
            url: string;
        }[];
        name: string;
        uid: string;
    }[];
    export { datasets_4 as datasets };
    let layout_4: ({
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
    export { layout_4 as layout };
}
export namespace initializedViewConfig {
    let version_6: string;
    export { version_6 as version };
    let name_6: string;
    export { name_6 as name };
    let description_6: string;
    export { description_6 as description };
    let initStrategy_5: string;
    export { initStrategy_5 as initStrategy };
    export namespace coordinationSpace_5 {
        export namespace obsType {
            let A_20: string;
            export { A_20 as A };
        }
        export namespace featureType {
            let A_21: string;
            export { A_21 as A };
        }
        export namespace featureValueType {
            let A_22: string;
            export { A_22 as A };
        }
        export namespace obsColorEncoding {
            let A_23: string;
            export { A_23 as A };
        }
        export namespace obsFilter {
            let A_24: null;
            export { A_24 as A };
        }
        export namespace obsHighlight {
            let A_25: null;
            export { A_25 as A };
        }
        export namespace obsSetHighlight {
            let A_26: null;
            export { A_26 as A };
        }
        export namespace obsSetSelection {
            let A_27: null;
            export { A_27 as A };
        }
        export namespace dataset_3 {
            let A_28: string;
            export { A_28 as A };
        }
        export { dataset_3 as dataset };
        export namespace embeddingObsOpacity {
            let A_29: number;
            export { A_29 as A };
        }
        export namespace embeddingObsOpacityMode {
            let A_30: string;
            export { A_30 as A };
        }
        export namespace embeddingObsRadius {
            let A_31: number;
            export { A_31 as A };
        }
        export namespace embeddingObsRadiusMode {
            let A_32: string;
            export { A_32 as A };
        }
        export namespace embeddingRotation {
            let A_33: number;
            export { A_33 as A };
        }
        export namespace embeddingTargetX_2 {
            let A_34: number;
            export { A_34 as A };
        }
        export { embeddingTargetX_2 as embeddingTargetX };
        export namespace embeddingTargetY_2 {
            let A_35: number;
            export { A_35 as A };
        }
        export { embeddingTargetY_2 as embeddingTargetY };
        export namespace embeddingTargetZ {
            let A_36: number;
            export { A_36 as A };
        }
        let embeddingType_2: {
            't-SNE': string;
        };
        export { embeddingType_2 as embeddingType };
        export namespace embeddingZoom_2 {
            let A_37: number;
            export { A_37 as A };
        }
        export { embeddingZoom_2 as embeddingZoom };
        export namespace embeddingObsSetLabelSize {
            let A_38: number;
            export { A_38 as A };
        }
        export namespace embeddingObsSetLabelsVisible {
            let A_39: boolean;
            export { A_39 as A };
        }
        export namespace embeddingObsSetPolygonsVisible {
            let A_40: boolean;
            export { A_40 as A };
        }
        export namespace featureValueColormap {
            let A_41: string;
            export { A_41 as A };
        }
        export namespace featureValueColormapRange {
            let A_42: number[];
            export { A_42 as A };
        }
        export namespace featureHighlight {
            let A_43: null;
            export { A_43 as A };
        }
        export namespace featureSelection {
            let A_44: null;
            export { A_44 as A };
        }
        export namespace spatialImageLayer {
            let A_45: null;
            export { A_45 as A };
        }
        export namespace spatialSegmentationLayer {
            let A_46: null;
            export { A_46 as A };
        }
        export namespace spatialPointLayer {
            let A_47: null;
            export { A_47 as A };
        }
        export namespace spatialNeighborhoodLayer {
            let A_48: null;
            export { A_48 as A };
        }
        export namespace spatialRotation {
            let A_49: number;
            export { A_49 as A };
        }
        export namespace spatialRotationOrbit {
            let A_50: number;
            export { A_50 as A };
        }
        export namespace spatialOrbitAxis {
            let A_51: string;
            export { A_51 as A };
        }
        export namespace spatialRotationX {
            let A_52: null;
            export { A_52 as A };
        }
        export namespace spatialRotationY {
            let A_53: null;
            export { A_53 as A };
        }
        export namespace spatialRotationZ {
            let A_54: null;
            export { A_54 as A };
        }
        export namespace spatialTargetX_2 {
            let A_55: number;
            export { A_55 as A };
        }
        export { spatialTargetX_2 as spatialTargetX };
        export namespace spatialTargetY_2 {
            let A_56: number;
            export { A_56 as A };
        }
        export { spatialTargetY_2 as spatialTargetY };
        export namespace spatialTargetZ {
            let A_57: null;
            export { A_57 as A };
        }
        export namespace spatialZoom_2 {
            let A_58: number;
            export { A_58 as A };
        }
        export { spatialZoom_2 as spatialZoom };
        export namespace spatialAxisFixed {
            let A_59: boolean;
            export { A_59 as A };
        }
        export namespace additionalObsSets {
            let A_60: null;
            export { A_60 as A };
        }
        export namespace obsSetColor {
            let A_61: null;
            export { A_61 as A };
        }
        export namespace obsLabelsType {
            let A_62: null;
            export { A_62 as A };
        }
        export namespace moleculeHighlight {
            let A_63: null;
            export { A_63 as A };
        }
    }
    export { coordinationSpace_5 as coordinationSpace };
    let datasets_5: {
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
    export { datasets_5 as datasets };
    let layout_5: ({
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
    export { layout_5 as layout };
}
export namespace implicitPerDatasetCoordinations {
    let version_7: string;
    export { version_7 as version };
    let name_7: string;
    export { name_7 as name };
    let description_7: string;
    export { description_7 as description };
    let initStrategy_6: string;
    export { initStrategy_6 as initStrategy };
    export namespace coordinationSpace_6 {
        export namespace dataset_4 {
            let A_64: string;
            export { A_64 as A };
            export let B: string;
        }
        export { dataset_4 as dataset };
        export namespace embeddingCellRadius {
            let small: number;
            let big: number;
        }
        export namespace embeddingCellRadiusMode {
            let all: string;
        }
    }
    export { coordinationSpace_6 as coordinationSpace };
    let datasets_6: {
        files: never[];
        name: string;
        uid: string;
    }[];
    export { datasets_6 as datasets };
    let layout_6: ({
        component: string;
        coordinationScopes: {
            dataset: string[];
            embeddingCellRadius: {
                A: string;
                B: string;
            };
            embeddingCellRadiusMode: string;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            dataset: string;
            embeddingCellRadius: string;
            embeddingCellRadiusMode: string;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    })[];
    export { layout_6 as layout };
}
export namespace explicitPerDatasetCoordinations {
    let version_8: string;
    export { version_8 as version };
    let name_8: string;
    export { name_8 as name };
    let description_8: string;
    export { description_8 as description };
    let initStrategy_7: string;
    export { initStrategy_7 as initStrategy };
    export namespace coordinationSpace_7 {
        export namespace dataset_5 {
            let A_65: string;
            export { A_65 as A };
            let B_1: string;
            export { B_1 as B };
        }
        export { dataset_5 as dataset };
        export namespace embeddingCellRadius_1 {
            let small_1: number;
            export { small_1 as small };
            let big_1: number;
            export { big_1 as big };
        }
        export { embeddingCellRadius_1 as embeddingCellRadius };
        export namespace embeddingCellRadiusMode_1 {
            let all_1: string;
            export { all_1 as all };
        }
        export { embeddingCellRadiusMode_1 as embeddingCellRadiusMode };
    }
    export { coordinationSpace_7 as coordinationSpace };
    let datasets_7: {
        files: never[];
        name: string;
        uid: string;
    }[];
    export { datasets_7 as datasets };
    let layout_7: ({
        component: string;
        coordinationScopes: {
            dataset: string[];
            embeddingCellRadiusMode: string;
            embeddingCellRadius?: undefined;
        };
        coordinationScopesBy: {
            dataset: {
                embeddingCellRadius: {
                    A: string;
                    B: string;
                };
            };
        };
        h: number;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            dataset: string;
            embeddingCellRadius: string;
            embeddingCellRadiusMode: string;
        };
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopesBy?: undefined;
    })[];
    export { layout_7 as layout };
}
//# sourceMappingURL=view-config-utils.test.fixtures.d.ts.map