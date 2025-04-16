export namespace wang2018 {
    export let name: string;
    export let version: string;
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
                featureType?: undefined;
                featureValueType?: undefined;
            };
            options?: undefined;
        } | {
            fileType: string;
            url: string;
            options: {
                obsIndex: string;
                obsLocations: string[];
                obsLabels?: undefined;
            };
            coordinationValues: {
                obsType: string;
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
            };
            coordinationValues: {
                obsType: string;
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
            };
            options?: undefined;
        })[];
    }[];
    export let initStrategy: string;
    export namespace coordinationSpace {
        namespace spatialZoom {
            let A: number;
        }
        namespace spatialSegmentationLayer {
            export namespace A_1 {
                let opacity: number;
                let radius: number;
                let visible: boolean;
                let stroked: boolean;
            }
            export { A_1 as A };
        }
        namespace spatialPointLayer {
            export namespace A_2 {
                let opacity_1: number;
                export { opacity_1 as opacity };
                let radius_1: number;
                export { radius_1 as radius };
                let visible_1: boolean;
                export { visible_1 as visible };
            }
            export { A_2 as A };
        }
    }
    export let layout: ({
        component: string;
        coordinationScopes: {
            spatialZoom: string;
            spatialSegmentationLayer: string;
            spatialPointLayer: string;
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
}
//# sourceMappingURL=wang.d.ts.map