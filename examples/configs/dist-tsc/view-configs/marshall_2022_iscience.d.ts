export namespace marshall2022iScience {
    let version: string;
    let name: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                embeddingType: string;
            };
            options: {
                obsFeatureMatrix: {
                    path: string;
                    featureFilterPath: string;
                };
                obsEmbedding: {
                    path: string;
                };
                obsLocations: {
                    path: string;
                };
                obsSegmentations: {
                    path: string;
                };
                obsSets: {
                    name: string;
                    path: string;
                }[];
                featureLabels: {
                    path: string;
                };
            };
        }[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace embeddingType {
            let UMAP: string;
        }
        namespace obsType {
            let A: string;
        }
        namespace featureType {
            let A_1: string;
            export { A_1 as A };
        }
        namespace featureValueType {
            let A_2: string;
            export { A_2 as A };
        }
        namespace featureValueColormapRange {
            let A_3: number[];
            export { A_3 as A };
        }
        namespace spatialSegmentationLayer {
            export namespace A_4 {
                let opacity: number;
                let radius: number;
                let visible: boolean;
                let stroked: boolean;
            }
            export { A_4 as A };
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
            embeddingType?: undefined;
            featureType?: undefined;
            featureValueType?: undefined;
            featureValueColormapRange?: undefined;
            spatialSegmentationLayer?: undefined;
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
            featureValueColormapRange: string;
            spatialSegmentationLayer?: undefined;
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
            featureType: string;
            featureValueType: string;
            spatialSegmentationLayer: string;
            featureValueColormapRange: string;
            embeddingType?: undefined;
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
            featureType: string;
            featureValueType: string;
            spatialSegmentationLayer: string;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
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
            featureType: string;
            embeddingType?: undefined;
            featureValueType?: undefined;
            featureValueColormapRange?: undefined;
            spatialSegmentationLayer?: undefined;
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
    })[];
}
//# sourceMappingURL=marshall_2022_iscience.d.ts.map