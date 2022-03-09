/* eslint-disable */
import { vapi } from '../utils';

const linnarssonDataTypes = [
  'cells',
  'cell-sets',
  'raster',
  'molecules',
  'neighborhoods',
];

export const xaiConfig = {
  name: 'scXAI demo',
  version: 'xai',
  description: 'Demo of custom components implemented for the scXAI project.',
  public: true,
  datasets: [
    {
      uid: 'ref',
      name: 'Reference dataset',
      files: [
        {
          "type": "cells",
          "fileType": "cells.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cells.json"
        },
        {
          "type": "cell-sets",
          "fileType": "cell-sets.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json"
        },
        {
          "type": "expression-matrix",
          "fileType": "clusters.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.clusters.json"
        }
      ],
    },
    {
      uid: 'qry',
      name: 'Query dataset',
      files: [
        {
          "type": "cells",
          "fileType": "cells.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cells.json"
        },
        {
          "type": "cell-sets",
          "fileType": "cell-sets.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json"
        },
        {
          "type": "expression-matrix",
          "fileType": "clusters.json",
          "url": "https://s3.amazonaws.com/vitessce-data/0.0.31/master_release/linnarsson/linnarsson.clusters.json"
        }
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
      ref: 't-SNE',
      qry: 'PCA',
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
      supporting: -9.759924983868524,
    },
    embeddingTargetX: {
      comparison: -73966,
      qrySupporting: 486922.5927960748,
      refSupporting: 486922.5927960748,
    },
    embeddingTargetY: {
      comparison: -9676,
      qrySupporting: -495212.7271243755,
      refSupporting: -495212.7271243755,
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
    {
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
      },
      x: 8,
      y: 7,
      w: 3,
      h: 5,
    },
  ],
};
