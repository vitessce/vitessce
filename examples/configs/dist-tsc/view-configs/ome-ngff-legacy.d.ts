export namespace omeNgffLegacy {
    export let version: string;
    export { blinName as name };
    export { blinDescription as description };
    let _public: boolean;
    export { _public as public };
    export let datasets: {
        uid: string;
        name: string;
        files: {
            type: string;
            fileType: string;
            url: string;
        }[];
    }[];
    export namespace coordinationSpace {
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
    }
    export let initStrategy: string;
    export let layout: ({
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
}
declare const blinName: "179706";
declare const blinDescription: "Example of OME-NGFF v0.1";
export {};
//# sourceMappingURL=ome-ngff-legacy.d.ts.map