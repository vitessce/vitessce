export namespace kpmp2023 {
    let version: string;
    let name: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            options: {
                offsetsUrl: string;
                path?: undefined;
            };
            coordinationValues: {
                fileUid: string;
                obsType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            options: {
                path: string;
                offsetsUrl?: undefined;
            };
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                fileUid?: undefined;
            };
        })[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace fileUid {
            let bitmask: string;
            let rgb: string;
        }
        namespace imageLayer {
            let histology: string;
        }
        namespace imageChannel {
            let R: string;
            let G: string;
            let B: string;
        }
        namespace segmentationLayer {
            let ml: string;
        }
        namespace segmentationChannel {
            let ci: string;
            let ngsg: string;
            let gsg: string;
            let t: string;
            let a: string;
            let ifta: string;
            let ptc: string;
        }
        namespace obsType {
            let ci_1: string;
            export { ci_1 as ci };
            let ngsg_1: string;
            export { ngsg_1 as ngsg };
            let gsg_1: string;
            export { gsg_1 as gsg };
            let t_1: string;
            export { t_1 as t };
            let a_1: string;
            export { a_1 as a };
            let ifta_1: string;
            export { ifta_1 as ifta };
            let ptc_1: string;
            export { ptc_1 as ptc };
        }
        namespace obsColorEncoding {
            let ci_2: string;
            export { ci_2 as ci };
            let ngsg_2: string;
            export { ngsg_2 as ngsg };
            let gsg_2: string;
            export { gsg_2 as gsg };
            let t_2: string;
            export { t_2 as t };
            let a_2: string;
            export { a_2 as a };
            let ifta_2: string;
            export { ifta_2 as ifta };
            let ptc_2: string;
            export { ptc_2 as ptc };
        }
        namespace featureValueColormap {
            let ci_3: string;
            export { ci_3 as ci };
            let ngsg_3: string;
            export { ngsg_3 as ngsg };
            let gsg_3: string;
            export { gsg_3 as gsg };
            let t_3: string;
            export { t_3 as t };
            let a_3: string;
            export { a_3 as a };
            let ifta_3: string;
            export { ifta_3 as ifta };
            let ptc_3: string;
            export { ptc_3 as ptc };
        }
        namespace featureValueColormapRange {
            let ci_4: number[];
            export { ci_4 as ci };
            let ngsg_4: number[];
            export { ngsg_4 as ngsg };
            let gsg_4: number[];
            export { gsg_4 as gsg };
            let t_4: number[];
            export { t_4 as t };
            let a_4: number[];
            export { a_4 as a };
            let ifta_4: number[];
            export { ifta_4 as ifta };
            let ptc_4: number[];
            export { ptc_4 as ptc };
        }
        namespace featureType {
            let global: string;
        }
        namespace featureValueType {
            let global_1: string;
            export { global_1 as global };
        }
        namespace featureSelection {
            let ci_5: null;
            export { ci_5 as ci };
            let ngsg_5: null;
            export { ngsg_5 as ngsg };
            let gsg_5: null;
            export { gsg_5 as gsg };
            let t_5: null;
            export { t_5 as t };
            let a_5: null;
            export { a_5 as a };
            let ifta_5: null;
            export { ifta_5 as ifta };
            let ptc_5: null;
            export { ptc_5 as ptc };
        }
        namespace spatialTargetC {
            let ci_6: number;
            export { ci_6 as ci };
            let ngsg_6: number;
            export { ngsg_6 as ngsg };
            let gsg_6: number;
            export { gsg_6 as gsg };
            let t_6: number;
            export { t_6 as t };
            let a_6: number;
            export { a_6 as a };
            let ifta_6: number;
            export { ifta_6 as ifta };
            let ptc_6: number;
            export { ptc_6 as ptc };
            export let imageR: number;
            export let imageG: number;
            export let imageB: number;
        }
        namespace spatialChannelColor {
            let ci_7: number[];
            export { ci_7 as ci };
            let ngsg_7: number[];
            export { ngsg_7 as ngsg };
            let gsg_7: number[];
            export { gsg_7 as gsg };
            let t_7: number[];
            export { t_7 as t };
            let a_7: number[];
            export { a_7 as a };
            let ifta_7: number[];
            export { ifta_7 as ifta };
            let ptc_7: number[];
            export { ptc_7 as ptc };
            let imageR_1: number[];
            export { imageR_1 as imageR };
            let imageG_1: number[];
            export { imageG_1 as imageG };
            let imageB_1: number[];
            export { imageB_1 as imageB };
        }
        namespace spatialChannelVisible {
            let ci_8: boolean;
            export { ci_8 as ci };
            let ngsg_8: boolean;
            export { ngsg_8 as ngsg };
            let gsg_8: boolean;
            export { gsg_8 as gsg };
            let t_8: boolean;
            export { t_8 as t };
            let a_8: boolean;
            export { a_8 as a };
            let ifta_8: boolean;
            export { ifta_8 as ifta };
            let ptc_8: boolean;
            export { ptc_8 as ptc };
            let imageR_2: boolean;
            export { imageR_2 as imageR };
            let imageG_2: boolean;
            export { imageG_2 as imageG };
            let imageB_2: boolean;
            export { imageB_2 as imageB };
        }
        namespace spatialLayerVisible {
            export let image: boolean;
            let bitmask_1: boolean;
            export { bitmask_1 as bitmask };
        }
        namespace spatialChannelOpacity {
            let ci_9: number;
            export { ci_9 as ci };
            let ngsg_9: number;
            export { ngsg_9 as ngsg };
            let gsg_9: number;
            export { gsg_9 as gsg };
            let t_9: number;
            export { t_9 as t };
            let a_9: number;
            export { a_9 as a };
            let ifta_9: number;
            export { ifta_9 as ifta };
            let ptc_9: number;
            export { ptc_9 as ptc };
            let imageR_3: number;
            export { imageR_3 as imageR };
            let imageG_3: number;
            export { imageG_3 as imageG };
            let imageB_3: number;
            export { imageB_3 as imageB };
        }
        namespace spatialLayerOpacity {
            let image_1: number;
            export { image_1 as image };
            let bitmask_2: number;
            export { bitmask_2 as bitmask };
        }
        namespace spatialSegmentationFilled {
            let ci_10: boolean;
            export { ci_10 as ci };
            let ngsg_10: boolean;
            export { ngsg_10 as ngsg };
            let gsg_10: boolean;
            export { gsg_10 as gsg };
            let t_10: boolean;
            export { t_10 as t };
            let a_10: boolean;
            export { a_10 as a };
            let ifta_10: boolean;
            export { ifta_10 as ifta };
            let ptc_10: boolean;
            export { ptc_10 as ptc };
        }
        namespace spatialSegmentationStrokeWidth {
            let ci_11: number;
            export { ci_11 as ci };
            let ngsg_11: number;
            export { ngsg_11 as ngsg };
            let gsg_11: number;
            export { gsg_11 as gsg };
            let t_11: number;
            export { t_11 as t };
            let a_11: number;
            export { a_11 as a };
            let ifta_11: number;
            export { ifta_11 as ifta };
            let ptc_11: number;
            export { ptc_11 as ptc };
        }
        namespace obsHighlight {
            let ci_12: null;
            export { ci_12 as ci };
            let ngsg_12: null;
            export { ngsg_12 as ngsg };
            let gsg_12: null;
            export { gsg_12 as gsg };
            let t_12: null;
            export { t_12 as t };
            let a_12: null;
            export { a_12 as a };
            let ifta_12: null;
            export { ifta_12 as ifta };
            let ptc_12: null;
            export { ptc_12 as ptc };
        }
        namespace spatialTargetX {
            let A: number;
        }
        namespace spatialTargetY {
            let A_1: number;
            export { A_1 as A };
        }
        namespace spatialZoom {
            let A_2: number;
            export { A_2 as A };
        }
        namespace photometricInterpretation {
            let rgb_1: string;
            export { rgb_1 as rgb };
            export let multiChannel: string;
        }
        namespace spatialChannelWindow {
            let imageR_4: number[];
            export { imageR_4 as imageR };
            let imageG_4: number[];
            export { imageG_4 as imageG };
            let imageB_4: number[];
            export { imageB_4 as imageB };
        }
        namespace metaCoordinationScopes {
            namespace metaA {
                let obsType_1: string[];
                export { obsType_1 as obsType };
                let segmentationLayer_1: string[];
                export { segmentationLayer_1 as segmentationLayer };
                let imageLayer_1: string[];
                export { imageLayer_1 as imageLayer };
            }
        }
        namespace metaCoordinationScopesBy {
            export namespace metaA_1 {
                export namespace imageLayer_2 {
                    export namespace fileUid_1 {
                        let histology_1: string;
                        export { histology_1 as histology };
                    }
                    export { fileUid_1 as fileUid };
                    export namespace imageChannel_1 {
                        let histology_2: string[];
                        export { histology_2 as histology };
                    }
                    export { imageChannel_1 as imageChannel };
                    export namespace spatialLayerVisible_1 {
                        let histology_3: string;
                        export { histology_3 as histology };
                    }
                    export { spatialLayerVisible_1 as spatialLayerVisible };
                    export namespace spatialLayerOpacity_1 {
                        let histology_4: string;
                        export { histology_4 as histology };
                    }
                    export { spatialLayerOpacity_1 as spatialLayerOpacity };
                    export namespace photometricInterpretation_1 {
                        let histology_5: string;
                        export { histology_5 as histology };
                    }
                    export { photometricInterpretation_1 as photometricInterpretation };
                }
                export { imageLayer_2 as imageLayer };
                export namespace imageChannel_2 {
                    export namespace spatialTargetC_1 {
                        let R_1: string;
                        export { R_1 as R };
                        let G_1: string;
                        export { G_1 as G };
                        let B_1: string;
                        export { B_1 as B };
                    }
                    export { spatialTargetC_1 as spatialTargetC };
                    export namespace spatialChannelColor_1 {
                        let R_2: string;
                        export { R_2 as R };
                        let G_2: string;
                        export { G_2 as G };
                        let B_2: string;
                        export { B_2 as B };
                    }
                    export { spatialChannelColor_1 as spatialChannelColor };
                    export namespace spatialChannelVisible_1 {
                        let R_3: string;
                        export { R_3 as R };
                        let G_3: string;
                        export { G_3 as G };
                        let B_3: string;
                        export { B_3 as B };
                    }
                    export { spatialChannelVisible_1 as spatialChannelVisible };
                    export namespace spatialChannelOpacity_1 {
                        let R_4: string;
                        export { R_4 as R };
                        let G_4: string;
                        export { G_4 as G };
                        let B_4: string;
                        export { B_4 as B };
                    }
                    export { spatialChannelOpacity_1 as spatialChannelOpacity };
                    export namespace spatialChannelWindow_1 {
                        let R_5: string;
                        export { R_5 as R };
                        let G_5: string;
                        export { G_5 as G };
                        let B_5: string;
                        export { B_5 as B };
                    }
                    export { spatialChannelWindow_1 as spatialChannelWindow };
                }
                export { imageChannel_2 as imageChannel };
                export namespace segmentationLayer_2 {
                    export namespace fileUid_2 {
                        let ml_1: string;
                        export { ml_1 as ml };
                    }
                    export { fileUid_2 as fileUid };
                    export namespace segmentationChannel_1 {
                        let ml_2: string[];
                        export { ml_2 as ml };
                    }
                    export { segmentationChannel_1 as segmentationChannel };
                    export namespace spatialLayerVisible_2 {
                        let ml_3: string;
                        export { ml_3 as ml };
                    }
                    export { spatialLayerVisible_2 as spatialLayerVisible };
                    export namespace spatialLayerOpacity_2 {
                        let ml_4: string;
                        export { ml_4 as ml };
                    }
                    export { spatialLayerOpacity_2 as spatialLayerOpacity };
                }
                export { segmentationLayer_2 as segmentationLayer };
                export namespace segmentationChannel_2 {
                    export namespace obsType_2 {
                        let ci_13: string;
                        export { ci_13 as ci };
                        let ngsg_13: string;
                        export { ngsg_13 as ngsg };
                        let gsg_13: string;
                        export { gsg_13 as gsg };
                        let t_13: string;
                        export { t_13 as t };
                        let a_13: string;
                        export { a_13 as a };
                        let ifta_13: string;
                        export { ifta_13 as ifta };
                        let ptc_13: string;
                        export { ptc_13 as ptc };
                    }
                    export { obsType_2 as obsType };
                    export namespace featureType_1 {
                        let ci_14: string;
                        export { ci_14 as ci };
                        let ngsg_14: string;
                        export { ngsg_14 as ngsg };
                        let gsg_14: string;
                        export { gsg_14 as gsg };
                        let t_14: string;
                        export { t_14 as t };
                        let a_14: string;
                        export { a_14 as a };
                        let ifta_14: string;
                        export { ifta_14 as ifta };
                        let ptc_14: string;
                        export { ptc_14 as ptc };
                    }
                    export { featureType_1 as featureType };
                    export namespace featureValueType_1 {
                        let ci_15: string;
                        export { ci_15 as ci };
                        let ngsg_15: string;
                        export { ngsg_15 as ngsg };
                        let gsg_15: string;
                        export { gsg_15 as gsg };
                        let t_15: string;
                        export { t_15 as t };
                        let a_15: string;
                        export { a_15 as a };
                        let ifta_15: string;
                        export { ifta_15 as ifta };
                        let ptc_15: string;
                        export { ptc_15 as ptc };
                    }
                    export { featureValueType_1 as featureValueType };
                    export namespace featureSelection_1 {
                        let ci_16: string;
                        export { ci_16 as ci };
                        let ngsg_16: string;
                        export { ngsg_16 as ngsg };
                        let gsg_16: string;
                        export { gsg_16 as gsg };
                        let t_16: string;
                        export { t_16 as t };
                        let a_16: string;
                        export { a_16 as a };
                        let ifta_16: string;
                        export { ifta_16 as ifta };
                        let ptc_16: string;
                        export { ptc_16 as ptc };
                    }
                    export { featureSelection_1 as featureSelection };
                    export namespace spatialTargetC_2 {
                        let ci_17: string;
                        export { ci_17 as ci };
                        let ngsg_17: string;
                        export { ngsg_17 as ngsg };
                        let gsg_17: string;
                        export { gsg_17 as gsg };
                        let t_17: string;
                        export { t_17 as t };
                        let a_17: string;
                        export { a_17 as a };
                        let ifta_17: string;
                        export { ifta_17 as ifta };
                        let ptc_17: string;
                        export { ptc_17 as ptc };
                    }
                    export { spatialTargetC_2 as spatialTargetC };
                    export namespace obsColorEncoding_1 {
                        let ci_18: string;
                        export { ci_18 as ci };
                        let ngsg_18: string;
                        export { ngsg_18 as ngsg };
                        let gsg_18: string;
                        export { gsg_18 as gsg };
                        let t_18: string;
                        export { t_18 as t };
                        let a_18: string;
                        export { a_18 as a };
                        let ifta_18: string;
                        export { ifta_18 as ifta };
                        let ptc_18: string;
                        export { ptc_18 as ptc };
                    }
                    export { obsColorEncoding_1 as obsColorEncoding };
                    export namespace featureValueColormap_1 {
                        let ci_19: string;
                        export { ci_19 as ci };
                        let ngsg_19: string;
                        export { ngsg_19 as ngsg };
                        let gsg_19: string;
                        export { gsg_19 as gsg };
                        let t_19: string;
                        export { t_19 as t };
                        let a_19: string;
                        export { a_19 as a };
                        let ifta_19: string;
                        export { ifta_19 as ifta };
                        let ptc_19: string;
                        export { ptc_19 as ptc };
                    }
                    export { featureValueColormap_1 as featureValueColormap };
                    export namespace featureValueColormapRange_1 {
                        let ci_20: string;
                        export { ci_20 as ci };
                        let ngsg_20: string;
                        export { ngsg_20 as ngsg };
                        let gsg_20: string;
                        export { gsg_20 as gsg };
                        let t_20: string;
                        export { t_20 as t };
                        let a_20: string;
                        export { a_20 as a };
                        let ifta_20: string;
                        export { ifta_20 as ifta };
                        let ptc_20: string;
                        export { ptc_20 as ptc };
                    }
                    export { featureValueColormapRange_1 as featureValueColormapRange };
                    export namespace spatialChannelVisible_2 {
                        let ci_21: string;
                        export { ci_21 as ci };
                        let ngsg_21: string;
                        export { ngsg_21 as ngsg };
                        let gsg_21: string;
                        export { gsg_21 as gsg };
                        let t_21: string;
                        export { t_21 as t };
                        let a_21: string;
                        export { a_21 as a };
                        let ifta_21: string;
                        export { ifta_21 as ifta };
                        let ptc_21: string;
                        export { ptc_21 as ptc };
                    }
                    export { spatialChannelVisible_2 as spatialChannelVisible };
                    export namespace spatialChannelOpacity_2 {
                        let ci_22: string;
                        export { ci_22 as ci };
                        let ngsg_22: string;
                        export { ngsg_22 as ngsg };
                        let gsg_22: string;
                        export { gsg_22 as gsg };
                        let t_22: string;
                        export { t_22 as t };
                        let a_22: string;
                        export { a_22 as a };
                        let ifta_22: string;
                        export { ifta_22 as ifta };
                        let ptc_22: string;
                        export { ptc_22 as ptc };
                    }
                    export { spatialChannelOpacity_2 as spatialChannelOpacity };
                    export namespace spatialChannelColor_2 {
                        let ci_23: string;
                        export { ci_23 as ci };
                        let ngsg_23: string;
                        export { ngsg_23 as ngsg };
                        let gsg_23: string;
                        export { gsg_23 as gsg };
                        let t_23: string;
                        export { t_23 as t };
                        let a_23: string;
                        export { a_23 as a };
                        let ifta_23: string;
                        export { ifta_23 as ifta };
                        let ptc_23: string;
                        export { ptc_23 as ptc };
                    }
                    export { spatialChannelColor_2 as spatialChannelColor };
                    export namespace spatialSegmentationFilled_1 {
                        let ci_24: string;
                        export { ci_24 as ci };
                        let ngsg_24: string;
                        export { ngsg_24 as ngsg };
                        let gsg_24: string;
                        export { gsg_24 as gsg };
                        let t_24: string;
                        export { t_24 as t };
                        let a_24: string;
                        export { a_24 as a };
                        let ifta_24: string;
                        export { ifta_24 as ifta };
                        let ptc_24: string;
                        export { ptc_24 as ptc };
                    }
                    export { spatialSegmentationFilled_1 as spatialSegmentationFilled };
                    export namespace spatialSegmentationStrokeWidth_1 {
                        let ci_25: string;
                        export { ci_25 as ci };
                        let ngsg_25: string;
                        export { ngsg_25 as ngsg };
                        let gsg_25: string;
                        export { gsg_25 as gsg };
                        let t_25: string;
                        export { t_25 as t };
                        let a_25: string;
                        export { a_25 as a };
                        let ifta_25: string;
                        export { ifta_25 as ifta };
                        let ptc_25: string;
                        export { ptc_25 as ptc };
                    }
                    export { spatialSegmentationStrokeWidth_1 as spatialSegmentationStrokeWidth };
                    export namespace obsHighlight_1 {
                        let ci_26: string;
                        export { ci_26 as ci };
                        let ngsg_26: string;
                        export { ngsg_26 as ngsg };
                        let gsg_26: string;
                        export { gsg_26 as gsg };
                        let t_26: string;
                        export { t_26 as t };
                        let a_26: string;
                        export { a_26 as a };
                        let ifta_26: string;
                        export { ifta_26 as ifta };
                        let ptc_26: string;
                        export { ptc_26 as ptc };
                    }
                    export { obsHighlight_1 as obsHighlight };
                }
                export { segmentationChannel_2 as segmentationChannel };
            }
            export { metaA_1 as metaA };
        }
    }
    let layout: ({
        component: string;
        coordinationScopes: {
            metaCoordinationScopes: string[];
            metaCoordinationScopesBy: string[];
            spatialTargetX: string;
            spatialTargetY: string;
            spatialZoom: string;
            obsType?: undefined;
            featureType?: undefined;
            featureValueType?: undefined;
            featureSelection?: undefined;
            obsColorEncoding?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            featureType: string;
            featureValueType: string;
            featureSelection: string;
            obsColorEncoding: string;
            metaCoordinationScopes?: undefined;
            metaCoordinationScopesBy?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialZoom?: undefined;
        };
        props: {
            title: string;
            aggregateFeatureValues?: undefined;
            omitFeatures?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            featureType: string;
            featureValueType: string;
            featureSelection: string;
            metaCoordinationScopes?: undefined;
            metaCoordinationScopesBy?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialZoom?: undefined;
            obsColorEncoding?: undefined;
        };
        props: {
            aggregateFeatureValues: boolean;
            title?: undefined;
            omitFeatures?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            featureType: string;
            featureValueType: string;
            featureSelection: string;
            obsColorEncoding: string;
            metaCoordinationScopes?: undefined;
            metaCoordinationScopesBy?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialZoom?: undefined;
        };
        props: {
            omitFeatures: string[];
            title: string;
            aggregateFeatureValues?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
}
//# sourceMappingURL=kpmp.d.ts.map