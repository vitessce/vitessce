/* eslint-disable */
import {
    makeDatasetNameToJsonFiles,
    getS3Url, vapi,
  } from '../utils';
  
  const driesName = 'Eng et al., Nature 2019';
  const driesDescription = 'Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH';
  
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
          'cells',
          'cell-sets',
        ].map(makeDatasetNameToJsonFiles('dries')),
      },
      {
        uid: 'dries-2',
        name: 'Dries 2019',
        files: [
          'cells',
          'cell-sets',
        ].map(makeDatasetNameToJsonFiles('dries')),
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
        TSNE: 3,
        UMAP: 3,
      },
      spatialZoom: {
        A: -4.4,
      },
      spatialTargetX: {
        A: 3800,
      },
      spatialTargetY: {
        A: -900,
      },
    },
    layout: [
      {
        component: 'description',
        props: {
          description: `${driesName}: ${driesDescription}`,
        },
        x: 9,
        y: 0,
        w: 3,
        h: 2,
      },
      {
        component: 'status',
        x: 9,
        y: 2,
        w: 3,
        h: 2,
      },
      {
        component: 'queryReferenceScatterplot',
        coordinationScopes: {
          dataset: ['REFERENCE', 'QUERY'],
          embeddingType: { REFERENCE: 'TSNE', QUERY:'UMAP' },
          embeddingZoom: 'TSNE',
          embeddingCellSetLabelsVisible: 'A',
          embeddingCellSetLabelSize: 'A',
          embeddingCellSetPolygonsVisible: 'A',
          embeddingCellRadius: 'A',
        },
        x: 0,
        y: 2,
        w: 5,
        h: 4,
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
  