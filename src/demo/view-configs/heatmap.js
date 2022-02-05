/* eslint-disable */
import {
  makeDatasetNameToJsonFiles,
  getS3Url, vapi,
} from '../utils';
export const heatmapOnly = {
  name: 'heatmap',
  description: '',
  version: '1.0.6',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'test',
      name: 'Test',
      files: [
        {
          url: '',
          type: 'expression-matrix',
          fileType: 'in-memory-matrix'
        },
      ],
    },
  ],
  public: true,
  coordinationSpace: {

  },
  layout: [
    {
      component: 'description',
      x: 0,
      y: 0,
      w: 2,
      h: 6,
    },
    
    {
      component: 'status',
      x: 0,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: 'heatmap',
      props: {
        transpose: false,
      },
      x: 2,
      y: 0,
      w: 10,
      h: 12,
    },
  ],
};
export const heatmapOnly2 = {
  name: 'heatmap',
  description: '',
  version: '1.0.6',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'test',
      name: 'Test',
      files: [
        {
          ...makeDatasetNameToJsonFiles('linnarsson')('clusters'),
          type: 'expression-matrix',
        },
      ],
    },
  ],
  public: true,
  coordinationSpace: {

  },
  layout: [
    {
      component: 'description',
      x: 0,
      y: 0,
      w: 2,
      h: 6,
    },
   
    {
      component: 'status',
      x: 0,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: 'heatmap',
      props: {
        transpose: false,
      },
      x: 2,
      y: 0,
      w: 10,
      h: 12,
    },
  ],
};
