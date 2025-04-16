export const configsWithPlugins: {
    'plugin-view-type': {
        name: string;
        version: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: string;
                fileType: string;
                url: string;
            }[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            spatialZoom: {
                A: number;
            };
        };
        layout: ({
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
    };
    'plugin-coordination-type': {
        name: string;
        version: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: never[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            myCustomCoordinationType: {
                A: number;
                B: number;
                C: undefined;
            };
        };
        layout: ({
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
    };
    'plugin-file-type': {
        name: string;
        version: string;
        description: string;
        datasets: {
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
        initStrategy: string;
        coordinationSpace: {
            spatialZoom: {
                A: number;
            };
        };
        layout: ({
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
    };
    'plugin-image-view': {
        name: string;
        version: string;
        description: string;
        datasets: never[];
        initStrategy: string;
        coordinationSpace: {};
        layout: {
            component: string;
            props: {
                imgSrc: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
};
export const pluginProps: {
    'plugin-view-type': {
        pluginViewTypes: any[];
    };
    'plugin-coordination-type': {
        pluginCoordinationTypes: any[];
        pluginViewTypes: any[];
    };
    'plugin-file-type': {
        pluginFileTypes: any[];
    };
    'plugin-image-view': {
        pluginViewTypes: any[];
    };
};
//# sourceMappingURL=index.d.ts.map