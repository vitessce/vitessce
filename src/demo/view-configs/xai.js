/* eslint-disable */
import {
  makeDatasetNameToJsonFiles,
  getS3Url, vapi,
} from '../utils';

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
        ...linnarssonDataTypes.map(makeDatasetNameToJsonFiles('linnarsson')),
        {
          ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
          type: 'expression-matrix',
        },
      ],
    },
    {
      uid: 'qry',
      name: 'Query dataset',
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
      supporting: 486922.5927960748,
    },
    embeddingTargetY: {
      comparison: -9676,
      supporting: -495212.7271243755,
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
        embeddingType: { REFERENCE: 'ref', QUERY: 'qry' },
        embeddingZoom: 'comparison',
        embeddingTargetX: 'comparison',
        embeddingTargetY: 'comparison',
        embeddingCellRadius: 'comparison',
        embeddingCellRadiusMode: 'comparison',
        embeddingCellSetLabelsVisible: 'comparison',
      },
      props: {
        supportingUuid: 5,
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
        embeddingType: 'qry',
        embeddingZoom: 'supporting',
        embeddingTargetX: 'supporting',
        embeddingTargetY: 'supporting',
        embeddingCellRadius: 'supporting',
        embeddingCellRadiusMode: 'supporting',
        embeddingCellSetLabelsVisible: 'qrySupporting',
      },
      x: 5,
      y: 7,
      w: 2,
      h: 5,
    },
    {
      component: 'qrSupportingScatterplot',
      props: {
        title: ' ',
      },
      coordinationScopes: {
        dataset: 'REFERENCE',
        embeddingType: 'ref',
        embeddingZoom: 'supporting',
        embeddingTargetX: 'supporting',
        embeddingTargetY: 'supporting',
        embeddingCellRadius: 'supporting',
        embeddingCellRadiusMode: 'supporting',
        embeddingCellSetLabelsVisible: 'refSupporting',
      },
      x: 7,
      y: 7,
      w: 2,
      h: 5,
    },
  ],
};
