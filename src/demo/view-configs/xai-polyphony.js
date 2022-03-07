/* eslint-disable */
import { vapi } from '../utils';

const zarrPath = 'http://localhost:7777/files/zarr';

export const polyphonyConfig = {
    name: 'Polyphony',
    version: 'xai',
    description: 'Fine-tune the Polyphony model by selecting or rejecting anchor cell sets.',
    public: true,
    datasets: [{
            uid: 'ref',
            name: 'Pancreas reference',
            files: [
                {
                    type: vapi.dt.CELLS,
                    fileType: vapi.ft.ANNDATA_CELLS_ZARR,
                    url: `${zarrPath}/pancreas_easy/reference.zarr`,
                    options: {
                        anchorCluster: "obsm/anchor_cluster",
                        mappings: {
                            UMAP: {
                                key: "obsm/X_umap",
                                dims: [0, 1]
                            },
                        },
                        factors: [
                            "obs/cell_type"
                        ]
                    }
                },
                {
                    type: vapi.dt.CELL_SETS,
                    fileType: vapi.ft.ANNDATA_CELL_SETS_ZARR,
                    url: `${zarrPath}/pancreas_easy/reference.zarr`,
                    options: [
                        {
                            groupName: "Cell Type",
                            setName: "obs/cell_type"
                        }
                    ]
                },
            ],
        },
        {
            uid: 'qry',
            name: 'Pancreas query',
            files: [
                {
                    type: vapi.dt.CELLS,
                    fileType: vapi.ft.ANNDATA_CELLS_ZARR,
                    url: `${zarrPath}/pancreas_easy/query.zarr`,
                    options: {
                        anchorCluster: "obsm/anchor_cluster",
                        mappings: {
                            UMAP: {
                                key: "obsm/X_umap",
                                dims: [0, 1]
                            },
                        },
                        factors: [
                            "obs/cell_type",
                            //"obs/prediction",
                            //"obs/label"
                        ]
                    }
                },
                {
                    type: vapi.dt.CELL_SETS,
                    fileType: vapi.ft.ANNDATA_CELL_SETS_ZARR,
                    url: `${zarrPath}/pancreas_easy/query.zarr`,
                    // TODO(scXAI): support
                    // - obs/prediction
                    // - obs/label
                    options: [
                        {
                            groupName: "Cell Type",
                            setName: "obs/cell_type"
                        },
                        /*{
                            groupName: "Prediction",
                            setName: "obs/prediction"
                        },
                        {
                            groupName: "Label",
                            setName: "obs/label"
                        }*/
                    ]
                },
            ],
        },
    ],
    initStrategy: 'auto',
    coordinationSpace: {
        dataset: {
            REFERENCE: 'ref',
            QUERY: 'qry',
        },
        embeddingType: {
            UMAP: 'UMAP',
        },
        embeddingCellSetPolygonsVisible: {
            A: false,
        },
        embeddingCellSetLabelsVisible: {
            A: true,
        },
        embeddingCellSetLabelSize: {
            A: 16,
        },
        embeddingCellRadius: {
            A: 1,
        },
        embeddingZoom: {
            A: 3,
        },
        embeddingTargetX: {
            A: 3,
        },
        embeddingTargetY: {
            A: 3,
        },
    },
    layout: [{
        component: 'qrComparisonScatterplot',
        coordinationScopes: {
            dataset: ['REFERENCE', 'QUERY'],
            embeddingType: { REFERENCE: 'UMAP', QUERY: 'UMAP' },
            embeddingZoom: 'A',
            embeddingTargetX: 'A',
            embeddingTargetY: 'A',
            embeddingCellSetLabelsVisible: 'A',
            embeddingCellSetLabelSize: 'A',
            embeddingCellSetPolygonsVisible: 'A',
            embeddingCellRadius: 'A',
        },
        x: 0,
        y: 0,
        w: 5,
        h: 12,
    }],
};
