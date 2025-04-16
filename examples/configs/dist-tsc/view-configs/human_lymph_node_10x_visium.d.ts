export namespace humanLymphNode10xVisium {
    let version: string;
    let name: string;
    let description: string;
    let initStrategy: string;
    let datasets: {
        uid: string;
        files: ({
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
            options: {
                obsFeatureMatrix: {
                    path: string;
                    featureFilterPath: string;
                };
                obsLocations: {
                    path: string;
                };
                obsSegmentations: {
                    path: string;
                };
                obsEmbedding: {
                    path: string;
                    embeddingType: string;
                }[];
                obsSets: {
                    name: string;
                    path: string;
                }[];
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues?: undefined;
            options?: undefined;
        })[];
    }[];
    namespace coordinationSpace {
        namespace obsType {
            let A: string;
        }
        namespace spatialSegmentationLayer {
            export namespace A_1 {
                let radius: number;
                let stroked: boolean;
                let visible: boolean;
                let opacity: number;
            }
            export { A_1 as A };
        }
        namespace spatialImageLayer {
            let A_2: {
                type: string;
                index: number;
                colormap: null;
                transparentColor: null;
                opacity: number;
                domainType: string;
                channels: {
                    selection: {
                        c: number;
                    };
                    color: number[];
                    visible: boolean;
                    slider: number[];
                }[];
            }[];
            export { A_2 as A };
        }
        namespace obsColorEncoding {
            let A_3: string;
            export { A_3 as A };
            export let B: string;
        }
        namespace spatialZoom {
            let A_4: number;
            export { A_4 as A };
        }
        namespace spatialTargetX {
            let A_5: number;
            export { A_5 as A };
        }
        namespace spatialTargetY {
            let A_6: number;
            export { A_6 as A };
        }
        namespace featureSelection {
            let A_7: string[];
            export { A_7 as A };
        }
    }
    let layout: ({
        component: string;
        coordinationScopes: {
            obsType: string;
            spatialImageLayer: string;
            spatialSegmentationLayer: string;
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
            obsColorEncoding: string;
            featureSelection?: undefined;
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
            spatialImageLayer: string;
            spatialSegmentationLayer: string;
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
            obsColorEncoding: string;
            featureSelection: string;
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
            obsColorEncoding: string;
            spatialImageLayer?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            featureSelection?: undefined;
        };
        props: {
            transpose: boolean;
            disableChannelsIfRgbDetected?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            spatialImageLayer: string;
            spatialSegmentationLayer: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            obsColorEncoding?: undefined;
            featureSelection?: undefined;
        };
        props: {
            disableChannelsIfRgbDetected: boolean;
            transpose?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            obsColorEncoding: string;
            spatialImageLayer?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            featureSelection?: undefined;
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
            obsColorEncoding: string;
            featureSelection: string;
            spatialImageLayer?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    })[];
}
//# sourceMappingURL=human_lymph_node_10x_visium.d.ts.map