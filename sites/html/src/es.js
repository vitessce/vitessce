/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom'
import { Vitessce } from 'vitessce';

const e = React.createElement;

const eng2019 = {
  name: 'Eng et al., Nature 2019',
  version: '1.0.15',
  description: 'Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH',
  datasets: [
    {
      uid: 'eng-2019',
      name: 'Eng 2019',
      files: [
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv',
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 't-SNE',
          },
          options: {
            obsIndex: 'cell_id',
            obsEmbedding: ['TSNE_1', 'TSNE_2'],
          },
        },
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv',
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'UMAP',
          },
          options: {
            obsIndex: 'cell_id',
            obsEmbedding: ['UMAP_1', 'UMAP_2'],
          },
        },
        {
          fileType: 'obsLocations.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv',
          coordinationValues: {
            obsType: 'cell',
          },
          options: {
            obsIndex: 'cell_id',
            obsLocations: ['X', 'Y'],
          },
        },
        {
          fileType: 'obsSets.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.csv',
          coordinationValues: {
            obsType: 'cell',
          },
          options: {
            obsIndex: 'cell_id',
            obsSets: [
              {
                name: 'Leiden Clustering',
                column: 'Leiden',
              },
              {
                name: 'k-means Clustering',
                column: 'Kmeans',
              },
            ],
          },
        },
        {
          fileType: 'obsSegmentations.json',
          url: 'https://data-1.vitessce.io/0.0.33/main/eng-2019/eng_2019_nature.cells.segmentations.json',
          coordinationValues: {
            obsType: 'cell',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      TSNE: 't-SNE',
      UMAP: 'UMAP',
    },
    embeddingObsSetPolygonsVisible: {
      A: false,
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    embeddingObsSetLabelSize: {
      A: 16,
    },
    embeddingObsRadiusMode: {
      A: 'manual',
    },
    embeddingObsRadius: {
      A: 3,
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
    spatialSegmentationLayer: {
      A: {
        opacity: 1, radius: 0, visible: true, stroked: false,
      },
    },
  },
  layout: [
    {
      component: 'description',
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
      component: 'obsSets',
      x: 9,
      y: 4,
      w: 3,
      h: 4,
    },
    {
      component: 'obsSetSizes',
      x: 5,
      y: 4,
      w: 4,
      h: 4,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
        embeddingObsSetLabelsVisible: 'A',
        embeddingObsSetLabelSize: 'A',
        embeddingObsSetPolygonsVisible: 'A',
        embeddingObsRadiusMode: 'A',
        embeddingObsRadius: 'A',
      },
      x: 0,
      y: 2,
      w: 5,
      h: 4,
    },
    {
      component: 'spatial',
      props: {
        cellRadius: 50,
      },
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialSegmentationLayer: 'A',
      },
      x: 5,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'UMAP',
        embeddingZoom: 'UMAP',
        embeddingObsSetLabelsVisible: 'A',
        embeddingObsSetLabelSize: 'A',
        embeddingObsSetPolygonsVisible: 'A',
        embeddingObsRadiusMode: 'A',
        embeddingObsRadius: 'A',
      },
      x: 0,
      y: 0,
      w: 5,
      h: 4,
    },
  ],
};

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      Vitessce,
      { config: eng2019, height: 500, theme: 'light' },
      null
    );
  }
}

// es-react is using React v16.
const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);