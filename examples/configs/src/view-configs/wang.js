export const wang2018 = {
  name: 'Wang et al., Scientific Reports 2018',
  version: '1.0.15',
  description: 'Multiplexed imaging of high-density libraries of RNAs with MERFISH and expansion microscopy',
  public: true,
  datasets: [
    {
      uid: 'wang-2018',
      name: 'Wang 2018',
      files: [
        {
          fileType: 'obsSegmentations.json',
          url: 'https://data-1.vitessce.io/0.0.33/main/wang-2018/wang_2018_scientific_reports.cells.segmentations.json',
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsLocations.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/wang-2018/wang_2018_scientific_reports.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsLocations: ['X', 'Y'],
          },
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsLocations.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/wang-2018/wang_2018_scientific_reports.molecules.csv',
          options: {
            obsIndex: 'molecule_id',
            obsLocations: ['X', 'Y'],
          },
          coordinationValues: {
            obsType: 'molecule',
          },
        },
        {
          fileType: 'obsLabels.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/wang-2018/wang_2018_scientific_reports.molecules.csv',
          options: {
            obsIndex: 'molecule_id',
            obsLabels: 'Gene',
          },
          coordinationValues: {
            obsType: 'molecule',
          },
        },
        {
          fileType: 'obsFeatureMatrix.csv',
          url: 'https://data-1.vitessce.io/0.0.33/main/wang-2018/wang_2018_scientific_reports.cells.matrix.csv',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialZoom: {
      A: -1,
    },
    spatialSegmentationLayer: {
      A: {
        opacity: 1, radius: 0, visible: true, stroked: false,
      },
    },
    spatialPointLayer: {
      A: {
        opacity: 1, radius: 2, visible: true,
      },
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialSegmentationLayer: 'A',
        spatialPointLayer: 'A',
      },
      x: 0,
      y: 0,
      w: 10,
      h: 2,
    },
    {
      component: 'featureList',
      x: 10,
      y: 0,
      w: 2,
      h: 2,
    },
  ],
};
