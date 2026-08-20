// Spraggins 2020 multiplex immunofluorescence kidney dataset — data mode variant.
// annotationFrames are NOT embedded in this config. Instead they are fetched at
// runtime from annotationDataUrl, hosted at:
//   https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/spraggins-annotation-frames.json

import { urlPrefix } from '../utils.js';

export const annotationsDemoSpragginsData = {
  name: 'Annotation Frames — Spraggins 2020 Kidney (data mode)',
  description: 'Multiplex IF kidney image with annotation frames overlaid on the spatial view; frames are loaded from a separate JSON file rather than embedded in the config. See the embedded version of this demo for a reference example of that pattern.',
  version: '1.0.0',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'spraggins',
      name: 'Spraggins 2020',
      files: [
        {
          type: 'raster',
          fileType: 'raster.json',
          url: `${urlPrefix}/spraggins/spraggins.raster.json`,
        },
      ],
    },
  ],
  coordinationSpace: {
    spatialZoom: { A: -6 },
    spatialTargetX: { A: 26800 },
    spatialTargetY: { A: 17300 },
    annotationFrameIndex: { A: null },
    annotationOverlayVisible: { A: true },
    annotationDescription: { A: 'This demo walks through the Spraggins 2020 multiplex immunofluorescence kidney dataset. The annotations and story are strictly for demonstration purposes only and will not reflect true biological findings.' },
    annotationDataType: { A: 'data' },
    annotationDataUrl: { A: 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/spraggins-annotation-frames.json' },
  },
  layout: [
    {
      component: 'spatial',
      props: { coordinatesVisible: true },
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
      },
      x: 0,
      y: 0,
      w: 6,
      h: 12,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 12,
    },
    {
      component: 'annotationController',
      coordinationScopes: {
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationDescription: 'A',
        annotationDataType: 'A',
        annotationDataUrl: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    },
  ],
};
