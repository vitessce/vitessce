export namespace spraggins2020 {
    export let version: string;
    export let name: string;
    let _public: boolean;
    export { _public as public };
    export let staticLayout: ({
        component: string;
        props: {
            view: {
                zoom: number;
                target: number[];
            };
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
        props?: undefined;
    })[];
    export { vanderbiltDescription as description };
    export let layers: {
        name: string;
        type: string;
        fileType: string;
        url: string;
    }[];
}
export namespace neumann2020 {
    let version_1: string;
    export { version_1 as version };
    let name_1: string;
    export { name_1 as name };
    export let description: string;
    export let datasets: {
        uid: string;
        name: string;
        files: {
            type: string;
            fileType: string;
            options: {
                schemaVersion: string;
                images: {
                    name: string;
                    type: string;
                    url: string;
                }[];
                usePhysicalSizeScaling: boolean;
                renderLayers: string[];
            };
        }[];
    }[];
    export let coordinationSpace: {};
    export let layout: {
        component: string;
        coordinationScopes: {};
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
    export let initStrategy: string;
}
declare const vanderbiltDescription: "High bit depth (uint16) multiplex immunofluorescence images of the kidney by the BIOmolecular Multimodal Imaging Center (BIOMIC) at Vanderbilt University";
export {};
//# sourceMappingURL=spraggins.d.ts.map