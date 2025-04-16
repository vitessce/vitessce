export namespace kpmpAutoInit2023 {
    let version: string;
    let name: string;
    let description: string;
    let datasets: {
        uid: string;
        name: string;
        files: ({
            fileType: string;
            url: string;
            options: {
                offsetsUrl: string;
                obsTypesFromChannelNames: boolean;
                path?: undefined;
            };
            coordinationValues?: undefined;
        } | {
            fileType: string;
            url: string;
            options: {
                offsetsUrl: string;
                obsTypesFromChannelNames?: undefined;
                path?: undefined;
            };
            coordinationValues?: undefined;
        } | {
            fileType: string;
            url: string;
            options: {
                path: string;
                offsetsUrl?: undefined;
                obsTypesFromChannelNames?: undefined;
            };
            coordinationValues: {
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
        })[];
    }[];
    namespace coordinationSpace {
        let photometricInterpretation: {
            'init_S-1905-017737_image_0': string;
        };
        let obsType: {
            'init_S-1905-017737_obsSegmentations_0': string;
            'init_S-1905-017737_obsSegmentations_1': string;
            'init_S-1905-017737_obsSegmentations_2': string;
            'init_S-1905-017737_obsSegmentations_3': string;
            'init_S-1905-017737_obsSegmentations_4': string;
            'init_S-1905-017737_obsSegmentations_5': string;
        };
    }
    let initStrategy: string;
    let layout: {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
//# sourceMappingURL=kpmp-auto-init.d.ts.map