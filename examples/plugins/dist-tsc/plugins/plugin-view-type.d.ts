export namespace pluginViewTypeProps {
    let pluginViewTypes: any[];
}
export namespace pluginViewType {
    let name: string;
    let version: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: {
            type: string;
            fileType: string;
            url: string;
        }[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace spatialZoom {
            let A: number;
        }
    }
    let layout: ({
        component: string;
        props: {
            title: string;
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
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    })[];
}
//# sourceMappingURL=plugin-view-type.d.ts.map