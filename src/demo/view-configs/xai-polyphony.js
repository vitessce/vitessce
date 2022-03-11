/* eslint-disable */
import { vapi } from '../utils';

const zarrPath = 'http://localhost:7777/files/zarr';

export const polyphonyConfig = {
    name: 'Polyphony',
    version: 'xai',
    description: 'Fine-tune the Polyphony model by selecting or rejecting anchor cell sets.',
    public: true,
    datasets: [
      {
        uid: 'ref',
        name: 'Pancreas reference',
        files: [
          {
            type: vapi.dt.CELLS,
            fileType: vapi.ft.ANNDATA_CELLS_ZARR,
            url: `${zarrPath}/pancreas_easy/reference.zarr`,
            options: {
              expressionMatrix: {
                path: 'X'
              },
              anchorMatrix: {
                path: 'obsm/anchor_mat'
              },
              differentialGenes: {
                names: {
                  path: 'uns/rank_genes_groups/_names_indices'
                },
                scores: {
                  path: 'uns/rank_genes_groups/_scores'
                }
              },
              features: {
                cellType: {
                  path: 'obs/cell_type'
                },
                anchorCluster: {
                  path: 'obs/anchor_cluster'
                }
              },
              embeddings: {
                UMAP: {
                  path: 'obsm/X_umap',
                  dims: [0, 1]
                }
              },
            }
          },
          {
            type: vapi.dt.EXPRESSION_MATRIX,
            fileType: vapi.ft.ANNDATA_EXPRESSION_MATRIX_ZARR,
            url: `${zarrPath}/pancreas_easy/reference.zarr`,
            options: {
              matrix: "X"
            }
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
                expressionMatrix: {
                  path: 'X'
                },
                anchorMatrix: {
                  path: 'obsm/anchor_mat'
                },
                differentialGenes: {
                  names: {
                    path: 'uns/rank_genes_groups/_names_indices'
                  },
                  scores: {
                    path: 'uns/rank_genes_groups/_scores'
                  }
                },
                features: {
                  prediction: {
                    path: 'obs/prediction'
                  },
                  label: {
                    path: 'obs/label'
                  },
                  anchorDist: {
                    path: 'obs/anchor_dist'
                  },
                  anchorCluster: {
                    path: 'obs/anchor_cluster'
                  }
                },
                embeddings: {
                  UMAP: {
                    path: 'obsm/X_umap',
                    dims: [0, 1]
                  }
                },
              }
          },
          {
            type: vapi.dt.EXPRESSION_MATRIX,
            fileType: vapi.ft.ANNDATA_EXPRESSION_MATRIX_ZARR,
            url: `${zarrPath}/pancreas_easy/query.zarr`,
            options: {
              matrix: "X"
            }
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
          cellSetSelection: {
            ref: null,
            qry: null,
          },
          embeddingType: {
            ref: 'UMAP',
            qry: 'UMAP',
          },
          embeddingCellRadius: {
            comparison: 2,
            supporting: 2,
          },
          embeddingCellRadiusMode: {
            comparison: 'manual',
            supporting: 'manual'
          },
          embeddingCellSetLabelsVisible: {
            comparison: false,
            qrySupporting: false,
            refSupporting: true
          },
          embeddingZoom: {
            comparison: -11.004,
            supporting: -6.5096321603007645,
          },
          embeddingTargetX: {
            comparison: -73966,
            qrySupporting: -79507.95986692146,
            refSupporting: -79507.95986692146,
          },
          embeddingTargetY: {
            comparison: -9676,
            qrySupporting: -29525.795911851183,
            refSupporting: -29525.795911851183,
          },
    },
    layout: [
        {
            component: 'status',
            x: 11,
            y: 7,
            w: 1,
            h: 5,
          },
          {
            component: 'qrCellSets',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
            },
            x: 5,
            y: 0,
            w: 7,
            h: 7,
          },
          {
            component: 'qrComparisonScatterplot',
            coordinationScopes: {
              dataset: ['REFERENCE', 'QUERY'],
              cellSetSelection: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingZoom: 'comparison',
              embeddingTargetX: 'comparison',
              embeddingTargetY: 'comparison',
              embeddingCellRadius: 'comparison',
              embeddingCellRadiusMode: 'comparison',
              embeddingCellSetLabelsVisible: 'comparison',
            },
            props: {
              qrySupportingUuid: 3,
              refSupportingUuid: 4,
            },
            x: 0,
            y: 0,
            w: 5,
            h: 12,
          },
          /*{
            component: 'qrSupportingScatterplot',
            coordinationScopes: {
              dataset: 'QUERY',
              embeddingType: 'qry',
              embeddingZoom: 'supporting',
              embeddingTargetX: 'qrySupporting',
              embeddingTargetY: 'qrySupporting',
              embeddingCellRadius: 'supporting',
              embeddingCellRadiusMode: 'supporting',
              embeddingCellSetLabelsVisible: 'qrySupporting',
              cellSetSelection: 'qry',
            },
            x: 5,
            y: 7,
            w: 3,
            h: 5,
          },
          {
            component: 'qrSupportingScatterplot',
            coordinationScopes: {
              dataset: 'REFERENCE',
              embeddingType: 'ref',
              embeddingZoom: 'supporting',
              embeddingTargetX: 'refSupporting',
              embeddingTargetY: 'refSupporting',
              embeddingCellRadius: 'supporting',
              embeddingCellRadiusMode: 'supporting',
              embeddingCellSetLabelsVisible: 'refSupporting',
              cellSetSelection: 'ref',
            },
            x: 8,
            y: 7,
            w: 3,
            h: 5,
          },*/
    ],
};
