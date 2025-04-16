export namespace levelTwoNodeLeaf {
    let name: string;
    let set: (string | null)[][];
}
export namespace levelOneNode {
    let name_1: string;
    export { name_1 as name };
    export let children: {
        name: string;
        set: (string | null)[][];
    }[];
}
export namespace levelZeroNode {
    let name_2: string;
    export { name_2 as name };
    let children_1: {
        name: string;
        children: {
            name: string;
            set: (string | null)[][];
        }[];
    }[];
    export { children_1 as children };
}
export namespace tree {
    let version: string;
    let datatype: string;
    let tree: {
        name: string;
        children: {
            name: string;
            children: ({
                name: string;
                set: (string | null)[][];
                children?: undefined;
            } | {
                name: string;
                children: {
                    name: string;
                    set: (string | null)[][];
                }[];
                set?: undefined;
            })[];
        }[];
    }[];
}
//# sourceMappingURL=cell-set-utils.test.fixtures.d.ts.map