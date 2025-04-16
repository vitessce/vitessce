export namespace habib2017withQualityMetrics {
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
                featureType: string;
                featureValueType: string;
                embeddingType: string;
            };
            options: {
                obsFeatureMatrix: {
                    path: string;
                    initialFeatureFilterPath: string;
                };
                obsEmbedding: {
                    path: string;
                };
                obsSets: {
                    name: string;
                    path: string;
                }[];
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
            options: {
                path: string;
            }[];
        })[];
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
            export let B: string;
        }
        namespace featureValueType {
            let A_2: string;
            export { A_2 as A };
            let B_1: string;
            export { B_1 as B };
        }
        namespace featureValueColormapRange {
            let A_3: number[];
            export { A_3 as A };
        }
        namespace featureSelection {
            let B_2: null;
            export { B_2 as B };
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
            featureType?: undefined;
            featureValueType?: undefined;
            featureSelection?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
        };
        uid: string;
        props?: undefined;
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
            featureSelection: string;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
        };
        uid: string;
        props?: undefined;
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
            featureSelection?: undefined;
        };
        uid: string;
        props?: undefined;
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
            featureValueColormapRange: string;
            featureSelection?: undefined;
            embeddingType?: undefined;
        };
        props: {
            transpose: boolean;
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
            featureValueType?: undefined;
            featureSelection?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
        };
        uid: string;
        props?: undefined;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        uid: string;
        coordinationScopes: {
            featureType: string;
            featureSelection: string;
            obsType?: undefined;
            featureValueType?: undefined;
            embeddingType?: undefined;
            featureValueColormapRange?: undefined;
        };
        props?: undefined;
    })[];
}
export namespace habib2017natureMethods {
    let version_1: string;
    export { version_1 as version };
    let name_1: string;
    export { name_1 as name };
    let description_1: string;
    export { description_1 as description };
    let datasets_1: {
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
                    initialFeatureFilterPath: string;
                };
                obsEmbedding: {
                    path: string;
                };
                obsSets: {
                    name: string;
                    path: string;
                }[];
            };
        }[];
    }[];
    export { datasets_1 as datasets };
    let initStrategy_1: string;
    export { initStrategy_1 as initStrategy };
    export namespace coordinationSpace_1 {
        export namespace embeddingType_1 {
            let UMAP_1: string;
            export { UMAP_1 as UMAP };
        }
        export { embeddingType_1 as embeddingType };
        export namespace obsType_1 {
            let A_4: string;
            export { A_4 as A };
        }
        export { obsType_1 as obsType };
        export namespace featureType_1 {
            let A_5: string;
            export { A_5 as A };
        }
        export { featureType_1 as featureType };
        export namespace featureValueType_1 {
            let A_6: string;
            export { A_6 as A };
        }
        export { featureValueType_1 as featureValueType };
        export namespace featureValueColormapRange_1 {
            let A_7: number[];
            export { A_7 as A };
        }
        export { featureValueColormapRange_1 as featureValueColormapRange };
    }
    export { coordinationSpace_1 as coordinationSpace };
    let layout_1: ({
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
        };
        uid: string;
        props?: undefined;
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
        };
        uid: string;
        props?: undefined;
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
            featureValueColormapRange: string;
            embeddingType?: undefined;
        };
        props: {
            transpose: boolean;
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
            featureValueColormapRange?: undefined;
        };
        uid: string;
        props?: undefined;
    } | {
        component: string;
        h: number;
        w: number;
        x: number;
        y: number;
        uid: string;
        coordinationScopes?: undefined;
        props?: undefined;
    })[];
    export { layout_1 as layout };
}
export namespace habib2017natureMethodsZip { }
//# sourceMappingURL=habib_2017_nature_methods.d.ts.map