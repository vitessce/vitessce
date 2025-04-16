export namespace segmentationsOmeTiff {
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
            options: {
                offsetsUrl: string;
            };
        }[];
    }[];
    export let initStrategy: string;
    export let layout: {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
//# sourceMappingURL=segmentations-ome-tiff.d.ts.map