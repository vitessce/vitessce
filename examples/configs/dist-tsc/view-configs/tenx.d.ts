export namespace scAtacSeq10xPbmc {
    let version: string;
    let name: string;
    let datasets: {
        uid: string;
        name: string;
        files: {
            type: string;
            fileType: string;
            url: string;
        }[];
    }[];
    let layout: ({
        component: string;
        props: {
            profileTrackUidKey: string;
            description?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    } | {
        component: string;
        props: {
            description: string;
            profileTrackUidKey?: undefined;
        };
        x: number;
        y: number;
        w: number;
        h: number;
    })[];
    let initStrategy: string;
}
//# sourceMappingURL=tenx.d.ts.map