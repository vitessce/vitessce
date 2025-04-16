export namespace pluginFileTypeProps {
    let pluginFileTypes: any[];
}
export namespace pluginFileType {
    let name: string;
    let version: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: {
            fileType: string;
            url: string;
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
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
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    })[];
}
//# sourceMappingURL=plugin-file-type.d.ts.map