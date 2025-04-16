export namespace combat2022cell {
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
                embeddingType: string;
                featureType?: undefined;
                featureValueType?: undefined;
            };
            options: {
                path: string;
                featureFilterPath?: undefined;
            };
        } | {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                embeddingType?: undefined;
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
                embeddingType?: undefined;
            };
            options: {
                path: string;
                featureFilterPath: string;
            };
        })[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace embeddingType {
            let UMAP: string;
        }
        namespace embeddingZoom {
            let A: null;
        }
        namespace embeddingTargetX {
            let A_1: null;
            export { A_1 as A };
        }
        namespace embeddingTargetY {
            let A_2: null;
            export { A_2 as A };
        }
        namespace embeddingObsSetLabelsVisible {
            let A_3: boolean;
            export { A_3 as A };
        }
        namespace obsType {
            let A_4: string;
            export { A_4 as A };
        }
        namespace featureType {
            let A_5: string;
            export { A_5 as A };
            export let B: string;
        }
        namespace featureValueType {
            let A_6: string;
            export { A_6 as A };
            let B_1: string;
            export { B_1 as B };
        }
        namespace obsColorEncoding {
            let A_7: string;
            export { A_7 as A };
            let B_2: string;
            export { B_2 as B };
        }
        namespace featureSelection {
            let A_8: null;
            export { A_8 as A };
            let B_3: null;
            export { B_3 as B };
        }
        namespace featureValueColormapRange {
            let A_9: number[];
            export { A_9 as A };
            let B_4: number[];
            export { B_4 as B };
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
            obsColorEncoding?: undefined;
            featureSelection?: undefined;
            embeddingZoom?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
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
            embeddingType: string;
            obsType: string;
            featureType: string;
            featureValueType: string;
            obsColorEncoding: string;
            featureSelection: string;
            embeddingZoom: string;
            embeddingTargetX: string;
            embeddingTargetY: string;
            embeddingObsSetLabelsVisible: string;
            featureValueColormapRange: string;
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
        h: number;
        w: number;
        x: number;
        y: number;
        coordinationScopes: {
            obsType: string;
            featureType: string;
            obsColorEncoding: string;
            featureSelection: string;
            embeddingType?: undefined;
            featureValueType?: undefined;
            embeddingZoom?: undefined;
            embeddingTargetX?: undefined;
            embeddingTargetY?: undefined;
            embeddingObsSetLabelsVisible?: undefined;
            featureValueColormapRange?: undefined;
        };
        uid: string;
    })[];
}
//# sourceMappingURL=combat_2022_cell.d.ts.map