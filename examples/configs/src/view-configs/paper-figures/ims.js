export const ims = {
  version: '1.0.15',
  name: 'Spraggins et al.',
  description: 'Comparison of aggregation methods for an imaging mass spectrometry dataset',
  datasets: [
    {
      uid: 'A',
      name: 'SIMPLE',
      files: [
        {
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'SIMPLE',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/A/0/0ee8536b-0bd7-4565-87a8-429a21cccdfa',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/A/0/36fae026-1ae0-45a6-985c-4dd21e0fbf28',
                  isBitmask: false,
                },
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'B',
      name: 'GAUSSIAN',
      files: [
        {
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'GAUSSIAN',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/B/0/ef105c52-6e25-4f68-877d-37fb2cd47587',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/B/0/cdb43e52-a6f5-435c-9a86-366c9ddd2a5b',
                  isBitmask: false,
                },
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'C',
      name: 'AREA',
      files: [
        {
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'AREA',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/C/0/01a5bea6-f3ed-4f93-a1ed-259fe7447abd',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/C/0/ab4c63fb-26ac-4d92-a669-a4c983164123',
                  isBitmask: false,
                },
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'D',
      name: 'LINEAR',
      files: [
        {
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'LINEAR',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/D/0/55082013-b841-4584-b955-e9e442ea4736',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/ims/D/0/f02026d7-9c11-420e-95e7-d9a0343f0231',
                  isBitmask: false,
                },
              },
            ],
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
    },
    spatialZoom: {
      A: null,
    },
    spatialTargetX: {
      A: null,
    },
    spatialTargetY: {
      A: null,
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 0.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'A',
      },
      x: 0.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'B',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 3.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'B',
      },
      x: 3.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'C',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 6.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'C',
      },
      x: 6.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'D',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 9.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'D',
      },
      x: 9.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
  ],
  initStrategy: 'auto',
};
