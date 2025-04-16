export namespace salcher2022 {
    let version: string;
    let name: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: {
            url: string;
            fileType: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
            options: {
                obsEmbedding: {
                    path: string;
                    embeddingType: string;
                }[];
                obsFeatureMatrix: {
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
    namespace coordinationSpace {
        namespace dataset {
            let A: string;
        }
        namespace embeddingType {
            let A_1: string;
            export { A_1 as A };
        }
        namespace featureSelection {
            let A_2: string[];
            export { A_2 as A };
        }
        namespace obsColorEncoding {
            let A_3: string;
            export { A_3 as A };
        }
        namespace embeddingObsSetLabelsVisible {
            let A_4: boolean;
            export { A_4 as A };
        }
        namespace featureValueColormapRange {
            let A_5: number[];
            export { A_5 as A };
        }
        namespace featureValueColormap {
            let A_6: string;
            export { A_6 as A };
        }
    }
    let layout: ({
        component: string;
        coordinationScopes: {
            dataset: string;
            obsColorEncoding: string;
            featureSelection: string;
            embeddingType?: undefined;
            obsSetLabelsVisible?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
            featureValueColormapRange?: undefined;
            featureValueColormap?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            dataset: string;
            embeddingType: string;
            obsSetLabelsVisible: string;
            obsColorEncoding: string;
            featureSelection: string;
            embeddingObsSetLabelsVisible: string;
            featureValueColormapRange: string;
            featureValueColormap: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
    let initStrategy: string;
}
//# sourceMappingURL=salcher_2022.d.ts.map