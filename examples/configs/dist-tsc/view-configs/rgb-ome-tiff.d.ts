export namespace rgbOmeTiff {
    export let version: string;
    export let name: string;
    export let description: string;
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
    export namespace coordinationSpace {
        let photometricInterpretation: {
            'init_HBM836.VTFP.364_image_0': string;
        };
    }
    export let initStrategy: string;
    export let layout: ({
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    } | {
        component: string;
        props: {
            disableChannelsIfRgbDetected: boolean;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
}
//# sourceMappingURL=rgb-ome-tiff.d.ts.map