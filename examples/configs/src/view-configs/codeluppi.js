import {
  makeDatasetNameToJsonFiles,
  getS3Url, vapi,
} from '../utils.js';


const linnarssonDataTypes = [
  'cells',
  'cell-sets',
  'raster',
  'molecules',
  'neighborhoods',
];
const linnarssonName = 'Codeluppi et al., Nature Methods 2018';
const linnarssonDescription = 'Spatial organization of the somatosensory cortex revealed by osmFISH';
const linnarssonBase = {
  name: linnarssonName,
  description: linnarssonDescription,
  version: '1.0.0',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        ...linnarssonDataTypes.map(makeDatasetNameToJsonFiles('linnarsson')),
        {
          ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
          type: 'expression-matrix',
        },
      ],
    },
  ],
};

const linnarssonBaseNoMolecules = {
  name: linnarssonName,
  description: linnarssonDescription,
  version: '1.0.0',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        ...linnarssonDataTypes.filter(dtype => dtype !== 'molecules').map(makeDatasetNameToJsonFiles('linnarsson')),
        {
          ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
          type: 'expression-matrix',
        },
      ],
    },
  ],
};

export const justScatter = {
  version: '1.0.0',
  name: 'Codeluppi, just scatterplot',
  public: false,
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          ...makeDatasetNameToJsonFiles('linnarsson')('cells'),
          requestInit: {
            // Where the client checks that the value is from an enumeration,
            // I've chosen one of the allowed values,
            // but nothing on our S3 actually needs any of these.
            method: 'GET',
            headers: { 'x-foo': 'FAKE' },
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'error',
            referrer: 'FAKE',
            integrity: 'FAKE',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingType: {
      A: 't-SNE',
    },
    embeddingZoom: {
      A: 0.75,
    },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'A',
        embeddingZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 12,
      h: 2,
    },
  ],
};

export const justScatterExpression = {
  version: '1.0.0',
  name: 'Codeluppi, just scatterplot and expression',
  public: false,
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        makeDatasetNameToJsonFiles('linnarsson')('cells'),
        makeDatasetNameToJsonFiles('linnarsson')('genes'),
      ],
    },
  ],
  coordinationSpace: {
    embeddingType: {
      A: 't-SNE',
    },
    embeddingZoom: {
      A: 0.75,
    },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'A',
        embeddingZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 12,
      h: 2,
    },
    {
      component: 'genes',
      x: 8,
      y: 2,
      w: 4,
      h: 2,
    },
  ],
};

export const justSpatial = {
  ...linnarssonBase,
  coordinationSpace: {
    spatialZoom: {
      A: -6.5,
    },
    spatialTargetX: {
      A: 18000,
    },
    spatialTargetY: {
      A: 18000,
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 0,
      y: 0,
      w: 10,
      h: 2,
    },
    {
      component: 'genes',
      x: 10,
      y: 1,
      w: 2,
      h: 1,
    },
  ],
};

export const codeluppi2018 = {
  name: 'Codeluppi et al., Nature Methods 2018',
  description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
  version: '1.0.13',
  initStrategy: 'auto',
  public: true,
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          type: 'cells',
          fileType: 'cells.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cells.json',
          options: {
            embeddingTypes: [
              'PCA',
              't-SNE',
            ],
          },
        },
        {
          type: 'cell-sets',
          fileType: 'cell-sets.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json',
        },
        {
          fileType: 'image.raster.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.raster.json',
        },
        {
          type: 'molecules',
          fileType: 'molecules.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.molecules.json',
        },
        {
          type: 'neighborhoods',
          fileType: 'neighborhoods.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.neighborhoods.json',
        },
        {
          type: 'expression-matrix',
          fileType: 'clusters.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.clusters.json',
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    spatialZoom: {
      A: -5.5,
    },
    spatialTargetX: {
      A: 16000,
    },
    spatialTargetY: {
      A: 20000,
    },
  },
  layout: [
    {
      component: 'description',
      x: 0,
      y: 0,
      w: 2,
      h: 1,
    },
    {
      component: 'layerController',
      props: {
        globalDisable3d: true,
        disableChannelsIfRgbDetected: true,
      },
      x: 0,
      y: 1,
      w: 2,
      h: 4,
    },
    {
      component: 'status',
      x: 0,
      y: 5,
      w: 2,
      h: 1,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'genes',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'cellSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'heatmap',
      props: {
        transpose: true,
      },
      x: 2,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'cellSetExpression',
      x: 7,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
      },
      x: 6,
      y: 2,
      w: 3,
      h: 2,
    },
  ],
};

export const codeluppiGating = {
  ...linnarssonBase,
  public: true,
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        description: `${linnarssonName}: ${linnarssonDescription}`,
      },
      x: 0,
      y: 0,
      w: 2,
      h: 1,
    },
    {
      component: 'status',
      x: 0,
      y: 5,
      w: 2,
      h: 1,
    },
    {
      component: 'gating',
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'genes',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'cellSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'cellSetExpression',
      x: 7,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
      },
      x: 6,
      y: 2,
      w: 3,
      h: 2,
    },
  ],
};

export const linnarssonWithRorb = {
  ...linnarssonBaseNoMolecules,
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    spatialZoom: {
      A: -5.5,
    },
    spatialTargetX: {
      A: 16000,
    },
    spatialTargetY: {
      A: 20000,
    },
    geneSelection: {
      A: ['Rorb'],
    },
    geneExpressionColormapRange: {
      A: [0, 0.75],
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        description: `${linnarssonName}: ${linnarssonDescription}`,
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'layerController',
      x: 0,
      y: 2,
      w: 2,
      h: 4,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        geneSelection: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'genes',
      coordinationScopes: {
        geneSelection: 'A',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'cellSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        geneSelection: 'A',
        geneExpressionColormapRange: 'A',
      },
      props: {
        transpose: true,
      },
      x: 2,
      y: 4,
      w: 10,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
        geneSelection: 'A',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 4,
    },
  ],
};

export function getCodeluppiViewConfig(name, description) {
  const vc = new vapi.VitessceConfig({ schemaVersion: '1.0.0', name, description });
  const dataset = vc.addDataset(linnarssonName, linnarssonDescription)
    .addFile({ url: getS3Url('linnarsson', 'cells'), fileType: vapi.ft.CELLS_JSON })
    .addFile({ url: getS3Url('linnarsson', 'cell-sets'), fileType: vapi.ft.CELL_SETS_JSON })
    .addFile({ url: getS3Url('linnarsson', 'raster'), fileType: vapi.ft.RASTER_JSON })
    .addFile({ url: getS3Url('linnarsson', 'molecules'), fileType: vapi.ft.MOLECULES_JSON });
  return [vc, dataset];
}
