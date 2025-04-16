export namespace NO_HINTS_CONFIG {
    let views: {};
    let coordinationValues: {};
}
export const HINTS_CONFIG: {
    'No hints are available. Generate config with no hints.': {
        views: {};
        coordinationValues: {};
    };
    Basic: {
        views: {};
        coordinationValues: {};
    };
    'Transcriptomics / scRNA-seq (with heatmap)': {
        views: {
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSetSizes: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            scatterplot: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            heatmap: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    };
    'Transcriptomics / scRNA-seq (without heatmap)': {
        views: {
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSetSizes: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            scatterplot: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    };
    'Spatial transcriptomics (with polygon cell segmentations)': {
        views: {
            scatterplot: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            spatial: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            heatmap: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSetFeatureValueDistribution: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    };
    'Chromatin accessibility / scATAC-seq (with heatmap)': {
        views: {
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSetSizes: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            scatterplot: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            heatmap: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
        coordinationValues: {
            featureType: string;
        };
    };
    'Chromatin accessibility / scATAC-seq (without heatmap)': {
        views: {
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSetSizes: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            scatterplot: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
        coordinationValues: {
            featureType: string;
        };
    };
    'Spatial transcriptomics (with histology image and polygon cell segmentations)': {
        views: {
            spatial: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            heatmap: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            layerController: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            obsSets: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            featureList: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
        coordinationSpaceRequired: boolean;
    };
    Image: {
        views: {
            spatial: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            layerController: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            description: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
        };
    };
};
export const HINT_TYPE_TO_FILE_TYPE_MAP: {
    'AnnData-Zarr': string[];
    'OME-TIFF': string[];
    'AnnData-Zarr,OME-TIFF': string[];
};
//# sourceMappingURL=constants.d.ts.map