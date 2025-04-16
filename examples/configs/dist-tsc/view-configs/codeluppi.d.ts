export function getCodeluppiViewConfig(name: any, description: any): any[];
export namespace justScatter {
    export let version: string;
    export let name: string;
    let _public: boolean;
    export { _public as public };
    export let initStrategy: string;
    export let datasets: {
        uid: string;
        name: string;
        files: {
            requestInit: {
                method: string;
                headers: {
                    'x-foo': string;
                };
                mode: string;
                credentials: string;
                cache: string;
                redirect: string;
                referrer: string;
                integrity: string;
            };
            type: any;
            fileType: string;
            url: string;
        }[];
    }[];
    export namespace coordinationSpace {
        namespace embeddingType {
            let A: string;
        }
        namespace embeddingZoom {
            let A_1: number;
            export { A_1 as A };
        }
    }
    export let layout: {
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
export namespace justScatterExpression {
    let version_1: string;
    export { version_1 as version };
    let name_1: string;
    export { name_1 as name };
    let _public_1: boolean;
    export { _public_1 as public };
    let initStrategy_1: string;
    export { initStrategy_1 as initStrategy };
    let datasets_1: {
        uid: string;
        name: string;
        files: {
            type: any;
            fileType: string;
            url: string;
        }[];
    }[];
    export { datasets_1 as datasets };
    export namespace coordinationSpace_1 {
        export namespace embeddingType_1 {
            let A_2: string;
            export { A_2 as A };
        }
        export { embeddingType_1 as embeddingType };
        export namespace embeddingZoom_1 {
            let A_3: number;
            export { A_3 as A };
        }
        export { embeddingZoom_1 as embeddingZoom };
    }
    export { coordinationSpace_1 as coordinationSpace };
    let layout_1: ({
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
    })[];
    export { layout_1 as layout };
}
export namespace justSpatial {
    export namespace coordinationSpace_2 {
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
    }
    export { coordinationSpace_2 as coordinationSpace };
    let layout_2: ({
        component: string;
        coordinationScopes: {
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
    })[];
    export { layout_2 as layout };
    export { linnarssonName as name };
    export { linnarssonDescription as description };
    let version_2: string;
    export { version_2 as version };
    let initStrategy_2: string;
    export { initStrategy_2 as initStrategy };
    let datasets_2: {
        uid: string;
        name: string;
        files: {
            type: any;
            fileType: string;
            url: string;
        }[];
    }[];
    export { datasets_2 as datasets };
}
export namespace codeluppi2018 {
    let name_2: string;
    export { name_2 as name };
    export let description: string;
    let version_3: string;
    export { version_3 as version };
    let initStrategy_3: string;
    export { initStrategy_3 as initStrategy };
    let _public_2: boolean;
    export { _public_2 as public };
    let datasets_3: {
        uid: string;
        name: string;
        files: ({
            type: string;
            fileType: string;
            url: string;
            options: {
                embeddingTypes: string[];
            };
        } | {
            type: string;
            fileType: string;
            url: string;
            options?: undefined;
        } | {
            fileType: string;
            url: string;
            type?: undefined;
            options?: undefined;
        })[];
    }[];
    export { datasets_3 as datasets };
    export namespace coordinationSpace_3 {
        export namespace embeddingZoom_2 {
            let PCA: number;
            let TSNE: number;
        }
        export { embeddingZoom_2 as embeddingZoom };
        export namespace embeddingType_2 {
            let PCA_1: string;
            export { PCA_1 as PCA };
            let TSNE_1: string;
            export { TSNE_1 as TSNE };
        }
        export { embeddingType_2 as embeddingType };
        export namespace spatialZoom_1 {
            let A_7: number;
            export { A_7 as A };
        }
        export { spatialZoom_1 as spatialZoom };
        export namespace spatialTargetX_1 {
            let A_8: number;
            export { A_8 as A };
        }
        export { spatialTargetX_1 as spatialTargetX };
        export namespace spatialTargetY_1 {
            let A_9: number;
            export { A_9 as A };
        }
        export { spatialTargetY_1 as spatialTargetY };
    }
    export { coordinationSpace_3 as coordinationSpace };
    let layout_3: ({
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
        coordinationScopes?: undefined;
    } | {
        component: string;
        props: {
            globalDisable3d: boolean;
            disableChannelsIfRgbDetected: boolean;
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
            spatialZoom: string;
            spatialTargetX: string;
            spatialTargetY: string;
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
        props: {
            transpose: boolean;
            globalDisable3d?: undefined;
            disableChannelsIfRgbDetected?: undefined;
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
    export { layout_3 as layout };
}
export namespace codeluppiGating {
    let _public_3: boolean;
    export { _public_3 as public };
    export namespace coordinationSpace_4 {
        export namespace embeddingZoom_3 {
            let PCA_2: number;
            export { PCA_2 as PCA };
            let TSNE_2: number;
            export { TSNE_2 as TSNE };
        }
        export { embeddingZoom_3 as embeddingZoom };
        export namespace embeddingType_3 {
            let PCA_3: string;
            export { PCA_3 as PCA };
            let TSNE_3: string;
            export { TSNE_3 as TSNE };
        }
        export { embeddingType_3 as embeddingType };
    }
    export { coordinationSpace_4 as coordinationSpace };
    let layout_4: ({
        component: string;
        props: {
            description: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
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
            embeddingType: string;
            embeddingZoom: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    })[];
    export { layout_4 as layout };
}
export namespace linnarssonWithRorb {
    export namespace coordinationSpace_5 {
        export namespace embeddingZoom_4 {
            let PCA_4: number;
            export { PCA_4 as PCA };
            let TSNE_4: number;
            export { TSNE_4 as TSNE };
        }
        export { embeddingZoom_4 as embeddingZoom };
        export namespace embeddingType_4 {
            let PCA_5: string;
            export { PCA_5 as PCA };
            let TSNE_5: string;
            export { TSNE_5 as TSNE };
        }
        export { embeddingType_4 as embeddingType };
        export namespace spatialZoom_2 {
            let A_10: number;
            export { A_10 as A };
        }
        export { spatialZoom_2 as spatialZoom };
        export namespace spatialTargetX_2 {
            let A_11: number;
            export { A_11 as A };
        }
        export { spatialTargetX_2 as spatialTargetX };
        export namespace spatialTargetY_2 {
            let A_12: number;
            export { A_12 as A };
        }
        export { spatialTargetY_2 as spatialTargetY };
        export namespace geneSelection {
            let A_13: string[];
            export { A_13 as A };
        }
        export namespace geneExpressionColormapRange {
            let A_14: number[];
            export { A_14 as A };
        }
    }
    export { coordinationSpace_5 as coordinationSpace };
    let layout_5: ({
        component: string;
        props: {
            description: string;
            transpose?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
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
            geneSelection: string;
            geneExpressionColormapRange?: undefined;
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
        coordinationScopes: {
            geneSelection: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            geneExpressionColormapRange?: undefined;
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
        coordinationScopes: {
            geneSelection: string;
            geneExpressionColormapRange: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
        };
        props: {
            transpose: boolean;
            description?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
            geneSelection: string;
            spatialZoom?: undefined;
            spatialTargetX?: undefined;
            spatialTargetY?: undefined;
            geneExpressionColormapRange?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    })[];
    export { layout_5 as layout };
    export { linnarssonName as name };
    export { linnarssonDescription as description };
    let version_4: string;
    export { version_4 as version };
    let initStrategy_4: string;
    export { initStrategy_4 as initStrategy };
    let datasets_4: {
        uid: string;
        name: string;
        files: {
            type: any;
            fileType: string;
            url: string;
        }[];
    }[];
    export { datasets_4 as datasets };
}
declare const linnarssonName: "Codeluppi et al., Nature Methods 2018";
declare const linnarssonDescription: "Spatial organization of the somatosensory cortex revealed by osmFISH";
export {};
//# sourceMappingURL=codeluppi.d.ts.map