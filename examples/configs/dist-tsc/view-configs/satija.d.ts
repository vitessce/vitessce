export namespace satija2020 {
    export let version: string;
    export let name: string;
    export let description: string;
    let _public: boolean;
    export { _public as public };
    export let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                embeddingType: string;
            };
            options: {
                obsEmbedding: {
                    path: string;
                };
                obsFeatureMatrix: {
                    path: string;
                };
                obsLabels: {
                    path: string;
                    obsLabelsType: string;
                }[];
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType?: undefined;
                featureValueType?: undefined;
                embeddingType?: undefined;
            };
            options?: undefined;
        })[];
    }[];
    export let initStrategy: string;
    export namespace coordinationSpace {
        namespace embeddingType {
            let UMAP: string;
        }
        namespace obsLabelsType {
            let A: string;
        }
        namespace embeddingZoom {
            let A_1: number;
            export { A_1 as A };
        }
        namespace embeddingTargetX {
            let A_2: number;
            export { A_2 as A };
        }
        namespace embeddingTargetY {
            let A_3: number;
            export { A_3 as A };
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
        namespace featureValueColormapRange {
            let A_7: number[];
            export { A_7 as A };
        }
    }
    export let layout: ({
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            obsLabelsType?: undefined;
            featureValueColormapRange?: undefined;
        };
        props?: undefined;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
            embeddingTargetX: string;
            embeddingTargetY: string;
            obsLabelsType: string[];
            featureValueColormapRange?: undefined;
        };
        props?: undefined;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            featureValueColormapRange: string;
            obsLabelsType: string[];
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
        };
        props: {
            transpose: boolean;
        };
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes?: undefined;
        props?: undefined;
    })[];
}
//# sourceMappingURL=satija.d.ts.map