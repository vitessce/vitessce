export namespace codeluppiViaCsv {
    let name: string;
    let description: string;
    let version: string;
    let initStrategy: string;
    let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            options?: undefined;
            coordinationValues?: undefined;
        } | {
            fileType: string;
            url: string;
            options: {
                obsIndex: string;
                obsLocations: string[];
                obsEmbedding?: undefined;
                obsSets?: undefined;
                obsLabels?: undefined;
                schemaVersion?: undefined;
                images?: undefined;
            };
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            options: {
                obsIndex: string;
                obsEmbedding: string[];
                obsLocations?: undefined;
                obsSets?: undefined;
                obsLabels?: undefined;
                schemaVersion?: undefined;
                images?: undefined;
            };
            coordinationValues: {
                obsType: string;
                embeddingType: string;
                featureType?: undefined;
                featureValueType?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            options: {
                obsIndex: string;
                obsSets: {
                    name: string;
                    column: string[];
                }[];
                obsLocations?: undefined;
                obsEmbedding?: undefined;
                obsLabels?: undefined;
                schemaVersion?: undefined;
                images?: undefined;
            };
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            options: {
                obsIndex: string;
                obsLabels: string;
                obsLocations?: undefined;
                obsEmbedding?: undefined;
                obsSets?: undefined;
                schemaVersion?: undefined;
                images?: undefined;
            };
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                embeddingType?: undefined;
            };
            options?: undefined;
        } | {
            fileType: string;
            options: {
                schemaVersion: string;
                images: {
                    name: string;
                    url: string;
                    type: string;
                    metadata: {
                        dimensions: ({
                            field: string;
                            type: string;
                            values: string[];
                        } | {
                            field: string;
                            type: string;
                            values: null;
                        })[];
                        isPyramid: boolean;
                        transform: {
                            translate: {
                                y: number;
                                x: number;
                            };
                            scale: number;
                        };
                    };
                }[];
                obsIndex?: undefined;
                obsLocations?: undefined;
                obsEmbedding?: undefined;
                obsSets?: undefined;
                obsLabels?: undefined;
            };
            url?: undefined;
            coordinationValues?: undefined;
        })[];
    }[];
    namespace coordinationSpace {
        namespace embeddingZoom {
            let PCA: number;
            let TSNE: number;
        }
        namespace embeddingType {
            let PCA_1: string;
            export { PCA_1 as PCA };
            let TSNE_1: string;
            export { TSNE_1 as TSNE };
        }
        namespace spatialZoom {
            let A: number;
        }
        namespace spatialTargetX {
            let A_1: number;
            export { A_1 as A };
        }
        namespace spatialTargetY {
            let A_2: number;
            export { A_2 as A };
        }
        namespace spatialSegmentationLayer {
            export namespace A_3 {
                let opacity: number;
                let radius: number;
                let visible: boolean;
                let stroked: boolean;
            }
            export { A_3 as A };
        }
        namespace spatialPointLayer {
            export namespace A_4 {
                let opacity_1: number;
                export { opacity_1 as opacity };
                let radius_1: number;
                export { radius_1 as radius };
                let visible_1: boolean;
                export { visible_1 as visible };
            }
            export { A_4 as A };
        }
    }
    let layout: ({
        component: string;
        props: {
            description: string;
            channelNamesVisible?: undefined;
            transpose?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            spatialSegmentationLayer: string;
            spatialPointLayer: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
        coordinationScopes?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
            spatialSegmentationLayer: string;
            spatialPointLayer: string;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
        };
        props: {
            channelNamesVisible: boolean;
            description?: undefined;
            transpose?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        props: {
            transpose: boolean;
            description?: undefined;
            channelNamesVisible?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
            spatialSegmentationLayer?: undefined;
            spatialPointLayer?: undefined;
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
//# sourceMappingURL=codeluppi-via-csv.d.ts.map