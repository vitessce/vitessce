// Lung-3 CyCIF dataset (LUNG-3-PR, 40X) — data mode annotation demo.
// 44 channels across 11 cycles. Five channels pre-configured as the initial view;
// all 44 are accessible via the layer controller.
//
// Channel index mapping (0-based) from markers.csv:
//   c=0  DNA1     c=10 LAG3      c=20 PD-L1     c=30 FOXP3    c=40 LAMIN_A/C
//   c=4  DNA2     c=14 KERATIN   c=22 CD45       c=32 CD21     c=41 BANF1
//   c=8  DNA3     c=17 CD45RB    c=26 CD68       c=34 IBA1     c=42 LAMIN_B
//   c=12 DNA4     c=18 CD3D      c=27 CD14       c=35 ASMA
//   c=13 KI67     c=19 PD-1      c=28 CD11B      c=36 CD20
//
// annotationFrames are NOT embedded; fetched at runtime from annotationDataUrl, hosted at:
//   https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/lung3-annotation-frames.json

export const annotationsDemoLung3Data = {
  version: '1.0.1',
  name: 'Annotation Frames — Lung-3 CyCIF 40X (Minerva compatibility)',
  description: 'Demonstrates Minerva-story compatibility: a 44-channel CyCIF lung cancer specimen (LUNG-3-PR, 40X) presented as a guided annotation tour in the Minerva narrative style. Annotation frames loaded from a separate JSON file.',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'A',
      name: 'Lung-3',
      files: [
        {
          type: 'raster',
          fileType: 'raster.json',
          url: 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/lung3.raster.json',
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: { A: 'A' },
    spatialSegmentationLayer: { A: [] },
    spatialNeighborhoodLayer: { A: null },
    spatialPointLayer: { A: null },
    annotationFrameIndex: { A: null },
    annotationOverlayVisible: { A: true },
    annotationDescription: {
      A: 'An interactive tour of a primary squamous cell carcinoma of the lung and adjacent non-neoplastic tissue surgically resected from a 44 year old female patient.\n\nExplore another story on quantitative single-cell data analysis for this sample.\n\nTable of Contents\n\nIntroduction\nTissue Regions\nEpithelial Tumor Cells\nAdjacent Non-Tumor Region\nTumor-Stromal Interface\nPD-L1 Expression\nPD-L1 Expressing Tumor Cells\nPD-L1 Expressing Macrophages\nImmune Populations\nB Cells and T Cells\nRegulatory T-Cells\nCytotoxic T-Cells\nInhibitory T-Cells\nCD8+/FOXP3+ T Cells\nPD1+/LAG3+ T Cells\nMacrophages\nMacrophages (cont.)\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
    },
    annotationDataType: { A: 'data' },
    annotationDataUrl: { A: 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/lung3-annotation-frames.json' },
  },
  layout: [
    {
      component: 'spatial',
      props: { coordinatesVisible: true },
      coordinationScopes: {
        dataset: 'A',
        spatialSegmentationLayer: 'A',
        spatialNeighborhoodLayer: 'A',
        spatialPointLayer: 'A',
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
      props: { globalDisable3d: true, disableChannelsIfRgbDetected: true },
      coordinationScopes: {
        dataset: 'A',
        spatialSegmentationLayer: 'A',
        spatialNeighborhoodLayer: 'A',
        spatialPointLayer: 'A',
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
      },
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    },
  ],
};
