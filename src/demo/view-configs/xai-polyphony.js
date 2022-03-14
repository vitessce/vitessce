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
                apiRoot: 'http://localhost:7777/api/anchor',
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
          cellSetColor: {
            ref: null,
            qry: null,
          },
          cellColorEncoding: {
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
          embeddingCellOpacity: {
            comparison: 1,
            supporting: 1,
          },
          embeddingCellOpacityMode: {
            comparison: 'manual',
            supporting: 'manual'
          },
          embeddingCellSetLabelsVisible: {
            comparison: false,
            qrySupporting: false,
            refSupporting: true
          },
          embeddingZoom: {
            comparison: null,
            supporting: null,
          },
          embeddingTargetX: {
            comparison: null,
            qrySupporting: null,
            refSupporting: null,
          },
          embeddingTargetY: {
            comparison: null,
            qrySupporting: null,
            refSupporting: null,
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
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncoding: { REFERENCE: 'ref', QUERY: 'qry' },
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
              cellSetColor: { REFERENCE: 'ref', QUERY: 'qry' },
              cellColorEncoding: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
              embeddingZoom: 'comparison',
              embeddingTargetX: 'comparison',
              embeddingTargetY: 'comparison',
              embeddingCellRadius: 'comparison',
              embeddingCellRadiusMode: 'comparison',
              embeddingCellOpacity: 'comparison',
              embeddingCellOpacityMode: 'comparison',
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
          {
            component: 'qrSupportingScatterplotQuery',
            coordinationScopes: {
              dataset: 'QUERY',
              cellSetSelection: 'qry',
              cellSetColor: 'qry',
              cellColorEncoding: 'qry',
              embeddingType: 'qry',
              embeddingZoom: 'supporting',
              embeddingTargetX: 'qrySupporting',
              embeddingTargetY: 'qrySupporting',
              embeddingCellRadius: 'supporting',
              embeddingCellRadiusMode: 'supporting',
              embeddingCellOpacity: 'supporting',
              embeddingCellOpacityMode: 'supporting',
              embeddingCellSetLabelsVisible: 'qrySupporting',
            },
            x: 5,
            y: 7,
            w: 3,
            h: 5,
          },
          {
            component: 'qrSupportingScatterplotReference',
            coordinationScopes: {
              dataset: 'REFERENCE',
              cellSetSelection: 'ref',
              cellSetColor: 'ref',
              cellColorEncoding: 'ref',
              embeddingType: 'ref',
              embeddingZoom: 'supporting',
              embeddingTargetX: 'refSupporting',
              embeddingTargetY: 'refSupporting',
              embeddingCellRadius: 'supporting',
              embeddingCellRadiusMode: 'supporting',
              embeddingCellOpacity: 'supporting',
              embeddingCellOpacityMode: 'supporting',
              embeddingCellSetLabelsVisible: 'refSupporting',
            },
            x: 8,
            y: 7,
            w: 3,
            h: 5,
          },
    ],
};
