export namespace pluginCoordinationTypeProps {
    let pluginCoordinationTypes: any[];
    let pluginViewTypes: any[];
}
export namespace pluginCoordinationType {
    let name: string;
    let version: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: never[];
    }[];
    let initStrategy: string;
    namespace coordinationSpace {
        namespace myCustomCoordinationType {
            let A: number;
            let B: number;
            let C: undefined;
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
            myCustomCoordinationType: string;
        };
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        props?: undefined;
        coordinationScopes?: undefined;
    })[];
}
//# sourceMappingURL=plugin-coordination-type.d.ts.map