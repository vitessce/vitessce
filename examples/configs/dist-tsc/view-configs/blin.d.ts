export namespace blin2019 {
    export let version: string;
    export { blinName as name };
    export { blinDescription as description };
    let _public: boolean;
    export { _public as public };
    export let datasets: {
        uid: string;
        name: string;
        files: {
            fileType: string;
            url: string;
        }[];
    }[];
    export let initStrategy: string;
    export let layout: ({
        component: string;
        props: {
            channelNamesVisible: boolean;
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
}
export namespace multipleOmeZarrViaRasterJson {
    let version_1: string;
    export { version_1 as version };
    export { blinName as name };
    export { blinDescription as description };
    let _public_1: boolean;
    export { _public_1 as public };
    let datasets_1: {
        uid: string;
        name: string;
        files: {
            fileType: string;
            options: {
                schemaVersion: string;
                renderLayers: string[];
                images: {
                    name: string;
                    type: string;
                    url: string;
                }[];
            };
        }[];
    }[];
    export { datasets_1 as datasets };
    let initStrategy_1: string;
    export { initStrategy_1 as initStrategy };
    let layout_1: {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
    export { layout_1 as layout };
}
declare const blinName: "Blin et al., PLoS Biol 2019";
declare const blinDescription: "Mouse blastocysts imaged by confocal microscopy";
export {};
//# sourceMappingURL=blin.d.ts.map