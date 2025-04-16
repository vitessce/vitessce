export namespace meta2022azimuth {
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
                };
                obsEmbedding: {
                    path: string;
                };
                featureLabels: {
                    path: string;
                };
                obsSets: ({
                    name: string;
                    path: string;
                } | {
                    name: string;
                    path: string[];
                })[];
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
            obsType?: undefined;
            embeddingType?: undefined;
            featureValueType?: undefined;
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
//# sourceMappingURL=meta_2022_azimuth.d.ts.map