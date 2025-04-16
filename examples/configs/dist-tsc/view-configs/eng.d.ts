export function getEngViewConfig(name: any, description: any): any[];
export namespace eng2019 {
    let name: string;
    let version: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                embeddingType: string;
            };
            options: {
                obsIndex: string;
                obsEmbedding: string[];
                obsLocations?: undefined;
                obsSets?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
            };
            options: {
                obsIndex: string;
                obsLocations: string[];
                obsEmbedding?: undefined;
                obsSets?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
            };
            options: {
                obsIndex: string;
                obsSets: {
                    name: string;
                    column: string;
                }[];
                obsEmbedding?: undefined;
                obsLocations?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
            };
            options?: undefined;
        })[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace embeddingType {
            let TSNE: string;
            let UMAP: string;
        }
        namespace embeddingObsSetPolygonsVisible {
            let A: boolean;
        }
        namespace embeddingObsSetLabelsVisible {
            let A_1: boolean;
            export { A_1 as A };
        }
        namespace embeddingObsSetLabelSize {
            let A_2: number;
            export { A_2 as A };
        }
        namespace embeddingObsRadiusMode {
            let A_3: string;
            export { A_3 as A };
        }
        namespace embeddingObsRadius {
            let A_4: number;
            export { A_4 as A };
        }
        namespace embeddingZoom {
            let TSNE_1: number;
            export { TSNE_1 as TSNE };
            let UMAP_1: number;
            export { UMAP_1 as UMAP };
        }
        namespace spatialZoom {
            let A_5: number;
            export { A_5 as A };
        }
        namespace spatialTargetX {
            let A_6: number;
            export { A_6 as A };
        }
        namespace spatialTargetY {
            let A_7: number;
            export { A_7 as A };
        }
        namespace spatialSegmentationLayer {
            export namespace A_8 {
                let opacity: number;
                let radius: number;
                let visible: boolean;
                let stroked: boolean;
            }
            export { A_8 as A };
        }
    }
    let layout: ({
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
        props?: undefined;
    } | {
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
            embeddingObsSetLabelsVisible: string;
            embeddingObsSetLabelSize: string;
            embeddingObsSetPolygonsVisible: string;
            embeddingObsRadiusMode: string;
            embeddingObsRadius: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            spatialSegmentationLayer?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    } | {
        component: string;
        props: {
            cellRadius: number;
        };
        coordinationScopes: {
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
            spatialSegmentationLayer: string;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
            embeddingObsSetLabelSize?: undefined;
            embeddingObsSetPolygonsVisible?: undefined;
            embeddingObsRadiusMode?: undefined;
            embeddingObsRadius?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
}
//# sourceMappingURL=eng.d.ts.map