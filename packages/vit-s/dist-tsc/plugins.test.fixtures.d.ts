export function pluginExpandAnnDataConvenience(fileDef: any): {
    fileType: string;
    url: any;
    options: any;
}[];
export namespace convenienceFileDefsCollapsed {
    let version: string;
    let name: string;
    let description: string;
    let initStrategy: string;
    let datasets: {
        files: {
            fileType: string;
            url: string;
            options: {
                cells: {
                    xy: string;
                };
                cellSets: {
                    groupName: string;
                    setName: string;
                }[];
            };
        }[];
        name: string;
        uid: string;
    }[];
    let layout: never[];
}
export namespace convenienceFileDefsExpanded {
    let version_1: string;
    export { version_1 as version };
    let name_1: string;
    export { name_1 as name };
    let description_1: string;
    export { description_1 as description };
    let initStrategy_1: string;
    export { initStrategy_1 as initStrategy };
    let datasets_1: {
        files: ({
            fileType: string;
            url: string;
            options: {
                xy: string;
            };
        } | {
            fileType: string;
            url: string;
            options: {
                groupName: string;
                setName: string;
            }[];
        })[];
        name: string;
        uid: string;
    }[];
    export { datasets_1 as datasets };
    let layout_1: never[];
    export { layout_1 as layout };
}
//# sourceMappingURL=plugins.test.fixtures.d.ts.map