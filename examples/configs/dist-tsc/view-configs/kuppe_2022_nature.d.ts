export namespace kuppe2022nature {
    let version: string;
    let name: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType?: undefined;
                featureValueType?: undefined;
            };
            options: {
                name: string;
                path: string;
            }[];
        } | {
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
                };
                featureLabels: {
                    path: string;
                };
                obsEmbedding: {
                    path: string;
                    embeddingType: string;
                }[];
                obsLocations?: undefined;
                obsSegmentations?: undefined;
                obsSets?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
            options: {
                obsLocations: {
                    path: string;
                };
                obsSegmentations: {
                    path: string;
                };
                obsFeatureMatrix: {
                    path: string;
                };
                featureLabels: {
                    path: string;
                };
                obsSets: {
                    name: string;
                    path: string;
                }[];
                obsEmbedding?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues?: undefined;
            options?: undefined;
        })[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace embeddingType {
            let RNA_UMAP: string;
            let RNA_PCA: string;
            let ATAC_UMAP: string;
        }
        namespace obsType {
            let A: string;
            let B: string;
        }
        namespace featureType {
            let A_1: string;
            export { A_1 as A };
        }
        namespace featureValueType {
            let A_2: string;
            export { A_2 as A };
            let B_1: string;
            export { B_1 as B };
            export let C: string;
        }
        namespace featureSelection {
            let A_3: null;
            export { A_3 as A };
        }
        namespace obsColorEncoding {
            let A_4: string;
            export { A_4 as A };
        }
        namespace obsSetSelection {
            let A_5: null;
            export { A_5 as A };
            let B_2: null;
            export { B_2 as B };
        }
        namespace obsSetColor {
            let A_6: null;
            export { A_6 as A };
            let B_3: null;
            export { B_3 as B };
        }
        namespace featureValueColormapRange {
            let A_7: number[];
            export { A_7 as A };
            let B_4: number[];
            export { B_4 as B };
        }
        namespace embeddingObsSetLabelsVisible {
            let A_8: boolean;
            export { A_8 as A };
        }
        namespace spatialImageLayer {
            let A_9: {
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
            export { A_9 as A };
        }
        namespace spatialSegmentationLayer {
            export namespace A_10 {
                let radius: number;
                let stroked: boolean;
                let visible: boolean;
                let opacity: number;
            }
            export { A_10 as A };
        }
    }
    let layout: ({
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            obsType: string;
            obsColorEncoding: string;
            obsSetSelection: string;
            obsSetColor: string;
            featureType?: undefined;
            featureValueType?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialImageLayer?: undefined;
            featureSelection?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
        };
        uid: string;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            obsType: string;
            obsColorEncoding: string;
            obsSetColor: string;
            obsSetSelection: string;
            featureType: string;
            featureValueType: string;
            spatialSegmentationLayer: string;
            spatialImageLayer: string;
            featureSelection: string;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
        };
        uid: string;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            embeddingType: string;
            obsType: string;
            featureType: string;
            featureValueType: string;
            featureSelection: string;
            obsColorEncoding: string;
            obsSetColor: string;
            obsSetSelection: string;
            featureValueColormapRange: string;
            embeddingObsSetLabelsVisible: string;
            spatialSegmentationLayer?: undefined;
            spatialImageLayer?: undefined;
        };
        uid: string;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            featureType: string;
            featureSelection: string;
            obsColorEncoding: string;
            obsType?: undefined;
            obsSetSelection?: undefined;
            obsSetColor?: undefined;
            featureValueType?: undefined;
            spatialSegmentationLayer?: undefined;
            spatialImageLayer?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
        };
        uid: string;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        uid: string;
        coordinationScopes?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            obsType: string;
            spatialSegmentationLayer: string;
            spatialImageLayer: string;
            obsColorEncoding?: undefined;
            obsSetSelection?: undefined;
            obsSetColor?: undefined;
            featureType?: undefined;
            featureValueType?: undefined;
            featureSelection?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
        };
        h: number;
        w: number;
        x: number;
        y: number;
        uid: string;
    })[];
}
//# sourceMappingURL=kuppe_2022_nature.d.ts.map