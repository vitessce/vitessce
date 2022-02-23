/* eslint-disable */
import {
  makeDatasetNameToJsonFiles,
  getS3Url, vapi,
} from '../utils';

const driesName = 'Eng et al., Nature 2019';
const driesDescription = 'Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH';

const linnarssonDataTypes = [
  'cells',
  'cell-sets',
  'raster',
  'molecules',
  'neighborhoods',
];

export const xaiConfig = {
    name: driesName,
    version: 'xai',
    description: driesDescription,
    public: true,
    datasets: [
      {
        uid: 'dries-1',
        name: 'Dries 2019',
        files: [
          ...linnarssonDataTypes.map(makeDatasetNameToJsonFiles('linnarsson')),
          {
            ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
            type: 'expression-matrix',
          },
        ],
      },
      {
        uid: 'dries-2',
        name: 'Dries 2019',
        files: [
          ...linnarssonDataTypes.map(makeDatasetNameToJsonFiles('linnarsson')),
          {
            ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
            type: 'expression-matrix',
          },
        ],
      },
    ],
    initStrategy: 'auto',
    coordinationSpace: {
      dataset: {
          REFERENCE: 'dries-1',
          QUERY: 'dries-2',
      },
      embeddingType: {
        TSNE: 't-SNE',
        UMAP: 't-SNE',
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
    layout: [
      {
        component: 'status',
        x: 9,
        y: 10,
        w: 3,
        h: 2,
      },
      {
        component: 'qrGeneExpression',
        x: 9,
        y: 0,
        w: 3,
        h: 10,
      },
      {
        component: 'qrCellSets',
        x: 5,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        component: 'qrComparisonScatterplot',
        coordinationScopes: {
          dataset: ['REFERENCE', 'QUERY'],
          embeddingType: { REFERENCE: 'TSNE', QUERY:'UMAP' },
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
      },
      {
        component: 'qrSupportingScatterplot',
        props: {
          title: 'Supporting View',
        },
        coordinationScopes: {
          dataset: 'QUERY',
          embeddingType: 'UMAP',
          embeddingZoom: 'A',
          embeddingTargetX: 'A',
          embeddingTargetY: 'A',
          embeddingCellSetLabelsVisible: 'A',
          embeddingCellSetLabelSize: 'A',
          embeddingCellSetPolygonsVisible: 'A',
          embeddingCellRadius: 'A',
        },
        x: 5,
        y: 7,
        w: 2,
        h: 5,
      },
      {
        component: 'qrSupportingScatterplot',
        props: {
          title: 'Supporting View',
        },
        coordinationScopes: {
          dataset: 'REFERENCE',
          embeddingType: 'UMAP',
          embeddingZoom: 'A',
          embeddingTargetX: 'A',
          embeddingTargetY: 'A',
          embeddingCellSetLabelsVisible: 'A',
          embeddingCellSetLabelSize: 'A',
          embeddingCellSetPolygonsVisible: 'A',
          embeddingCellRadius: 'A',
        },
        x: 7,
        y: 7,
        w: 2,
        h: 5,
      },
    ],
  };
  
  export function getEngViewConfig(name, description) {
    const vc = new vapi.VitessceConfig(name, description);
    const dataset = vc.addDataset(driesName, driesDescription)
      .addFile(getS3Url('dries', 'cells'), vapi.dt.CELLS, vapi.ft.CELLS_JSON)
      .addFile(getS3Url('dries', 'cell-sets'), vapi.dt.CELL_SETS, vapi.ft.CELL_SETS_JSON);
    return [vc, dataset];
  }
  