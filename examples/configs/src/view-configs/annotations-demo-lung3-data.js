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
// The annotationStory is loaded from an annotationStory.json file (provided here via a data URL).

import { makeJsonDataUrl } from '../utils.js';

const annotationStory = {
  uid: 'lung3-cycif',
  title: 'Lung-3 CyCIF (LUNG-3-PR, 40X)',
  description: 'An interactive tour of a primary squamous cell carcinoma of the lung and adjacent non-neoplastic tissue surgically resected from a 44 year old female patient.\n\nExplore another story on quantitative single-cell data analysis for this sample.\n\nTable of Contents\n\nIntroduction\nTissue Regions\nEpithelial Tumor Cells\nAdjacent Non-Tumor Region\nTumor-Stromal Interface\nPD-L1 Expression\nPD-L1 Expressing Tumor Cells\nPD-L1 Expressing Macrophages\nImmune Populations\nB Cells and T Cells\nRegulatory T-Cells\nCytotoxic T-Cells\nInhibitory T-Cells\nCD8+/FOXP3+ T Cells\nPD1+/LAG3+ T Cells\nMacrophages\nMacrophages (cont.)\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
  descriptionType: 'markdown',
  frames: [
    {
      uid: 'frame-0',
      title: 'Tissue Regions',
      description: 'In this tissue specimen of a human lung cancer, the tumor region can be seen on the right-hand side and an adjacent non-tumor, stromal region can be seen on the left-hand side.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -4.1747,
            spatialTargetX: 5550,
            spatialTargetY: 5550,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      5,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 14,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      3,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 34,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      1,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 22,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      7,
                      13836,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 33,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      6,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-0-arrow-0',
                type: 'line',
                x1: 11860,
                y1: 6449,
                x2: 10415,
                y2: 6449,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: 'TUMOR REGION',
                textPosition: 'start',
                markerEnd: 'Arrow',
                labelBackground: true,
              },
              {
                uid: 'frame-0-arrow-1',
                type: 'line',
                x1: 5308,
                y1: 2307,
                x2: 3864,
                y2: 2307,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: 'STROMAL REGION',
                textPosition: 'start',
                markerEnd: 'Arrow',
                labelBackground: true,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-1',
      title: 'Epithelial Tumor Cells',
      description: 'The epithelial tumor cells of the lung are noted by their larger morphology\nand cytoplasmic expression of `Keratin`.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -1.7351,
            spatialTargetX: 11672,
            spatialTargetY: 7966,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 34,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 22,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      7,
                      13836,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-1-box-0',
                type: 'rectangle',
                x: 9558,
                y: 6479,
                width: 4394,
                height: 2573,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-2',
      title: 'Adjacent Non-Tumor Region',
      description: 'In the adjacent non-tumor region, most of the cells are fibroblasts or perivascular smooth muscle cells expressing `a-SMA` and immune cells expressing `CD45` or `IBA1`.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.5113,
            spatialTargetX: 3505,
            spatialTargetY: 2575,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 34,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 22,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      7,
                      13836,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-2-box-0',
                type: 'rectangle',
                x: 3,
                y: 282,
                width: 7067,
                height: 4904,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-3',
      title: 'Tumor-Stromal Interface',
      description: 'In the tumor-stromal interface where clusters of tumor cells (`Keratin`) can be seen associated with stromal areas containing fibroblasts (`α-SMA`) and immune cells (`CD45` and `IBA1`). The tumor-stromal interface undergoes changes that can provide clues\nto tumor metastasis and progression.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -3.5988,
            spatialTargetX: 6893,
            spatialTargetY: 7362,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 34,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 22,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      7,
                      13836,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-3-box-0',
                type: 'rectangle',
                x: 3341,
                y: 6263,
                width: 6587,
                height: 4837,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-4',
      title: 'PD-L1 Expression',
      description: 'Programmed Death Ligand 1 (`PD-L1`), also known as cluster of differentiation 274 (CD274), is a target of immunotherapeutics. It is expressed in tumor cells (`Keratin`)\nas well as in some macrophages (`IBA1`). `PD-L1` inactivates T cells and prevents immune surveillance of the tumors by binding to the PD-1 receptor on T cells. Thus, one approach to immunotherapy is to block the interaction of `PD-L1` with `PD-1`.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.8595,
            spatialTargetX: 9444,
            spatialTargetY: 4808,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 19,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      422,
                      2776,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-4-box-0',
                type: 'rectangle',
                x: 8046,
                y: 3678,
                width: 4162,
                height: 2691,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-5',
      title: 'PD-L1 Expressing Tumor Cells',
      description: 'Here, tumor cells (`Keratin`) can be seen expressing `PD-L1` on the cell membrane.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -1.0183,
            spatialTargetX: 7013,
            spatialTargetY: 5483,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 19,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      422,
                      2776,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-5-box-0',
                type: 'rectangle',
                x: 6583,
                y: 5142,
                width: 1073,
                height: 746,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-6',
      title: 'PD-L1 Expressing Macrophages',
      description: 'Macrophages (`IBA1`) expressing `PD-L1` are also observed in this lung cancer specimen.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: 0.3868,
            spatialTargetX: 11150,
            spatialTargetY: 3745,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 14,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      c: 33,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 19,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      422,
                      2776,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-6-box-0',
                type: 'rectangle',
                x: 11081,
                y: 3653,
                width: 139,
                height: 132,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-6-arrow-0',
                type: 'line',
                x1: 11250,
                y1: 3733,
                x2: 11189,
                y2: 3733,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
                text: 'Macrophage',
                textPosition: 'start',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-7',
      title: 'Immune Populations',
      description: 'Many immune populations are present in this lung cancer and are often\nenriched in the tumor region.\n\nWhen the subset of CD45 positive cells was clustered based on expression of CD45, CD3d, CD8A, CD4, CD20, PD1, and FOXP3 using k-means, seven distinct immune cell populations emerged.\n\nThe populations are shown in the heat map below, where each row represents a cluster and each column represents an immune marker. The color represents the expression level of each marker.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -0.7045,
            spatialTargetX: 11656,
            spatialTargetY: 3570,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 18,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      57,
                      4595,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 35,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      50,
                      23799,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-7-box-0',
                type: 'rectangle',
                x: 11248,
                y: 3226,
                width: 1051,
                height: 745,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-8',
      title: 'B Cells and T Cells',
      description: 'T cells (`CD3d`) are often found infiltrating the tumor region. B cells (`CD20`) are also present but can be somewhat less common as shown in this sample.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.3856,
            spatialTargetX: 9157,
            spatialTargetY: 7984,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 18,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      57,
                      4595,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 35,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      50,
                      23799,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-8-box-0',
                type: 'rectangle',
                x: 7773,
                y: 6863,
                width: 3234,
                height: 2505,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-9',
      title: 'Regulatory T-Cells',
      description: 'A subpopulation of T cells (`CD3d`) is regulatory T cells, also known as Tregs. Tregs are marked by membraneous expression of `CD4` and nuclear expression of `FOXP3`. These cells act to supress immune response as a homeostatis mechanism.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: 0.5599,
            spatialTargetX: 12130,
            spatialTargetY: 5096,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      5,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 18,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      57,
                      4595,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 21,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      332,
                      32852,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 30,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      51,
                      12752,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-9-box-0',
                type: 'rectangle',
                x: 11981,
                y: 4968,
                width: 335,
                height: 253,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-10',
      title: 'Cytotoxic T-Cells',
      description: 'Another subpopulation of T cells (`CD3d`) is cytotoxic T cells, also known as T-killer cells or cytotoxic T lymphocytes (CTLs). CTLs are marked by the expression of `CD8` on the cell membrane and are key players in tumor surveillance by the immune system.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -1.0183,
            spatialTargetX: 11183,
            spatialTargetY: 3722,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 18,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      57,
                      4595,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 23,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      534,
                      52836,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-10-box-0',
                type: 'rectangle',
                x: 10707,
                y: 3350,
                width: 1138,
                height: 795,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-11',
      title: 'Inhibitory T-Cells',
      description: 'Some subpopulations of T cells (`CD3d`) express inhibitory molecules such as `PD1` or `FOXP3`. In this sample, these inhibitory T cells are enriched in the tumor region.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -0.3902,
            spatialTargetX: 11526,
            spatialTargetY: 2317,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 18,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      57,
                      4595,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 30,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      51,
                      12752,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 15,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      353,
                      9841,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-11-box-0',
                type: 'rectangle',
                x: 11222,
                y: 2073,
                width: 746,
                height: 542,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-12',
      title: 'CD8+/FOXP3+ T Cells',
      description: 'In this lung cancer, we found a rare, or low frequency, immune population`:` CD8A+/FOXP3+ T cells.\n\nTraditionally, expression of `FOXP3` has been observed in `CD4` expressing cells,\nindicating a regulatory T-cell phenotype. However, single-cell analysis of multiple markers\nrevealed a population of `CD8A` expressing T cells that also expresses `FOXP3`.\n\nThe frequency of this population is very low (0.66% of immune cells) in this tumor.\n\nThis rare population of `CD8A` and `FOXP3` expressing cells in addition to the more characterized population of `CD4` and `FOXP3` expressing cells are both enriched in the tumor region.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -0.9982,
            spatialTargetX: 8801,
            spatialTargetY: 7579,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 21,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      332,
                      32852,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 30,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      51,
                      12752,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 23,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      534,
                      52836,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-12-arrow-0',
                type: 'line',
                x1: 9021,
                y1: 7530,
                x2: 8861,
                y2: 7530,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
                text: 'CD8+/FOXP3+ T cell',
                textPosition: 'start',
                labelBackground: true,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-13',
      title: 'PD1+/LAG3+ T Cells',
      description: 'Another rare, or low frequency, population present in the tumor is `PD-1`+/`LAG3`+ double positive T cells. Both of these markers are immune checkpoint receptors expressed on T cells and are therefore targets of immunotherapies.\n\nSome of these `PD-1`+/`LAG3`+ double positive cells express `CD4` whereas others express `CD8`.\n\nThe frequency of these populations is very low. `CD8`+/`PD-1`+/`LAG3`+ cells are only 1% of immune cells whereas `CD4`+/`PD-1`+/`LAG3`+ cells are an even smaller proportion, ~0.1% of immune cells.\n\nBoth populations are enriched in the tumor region, with `CD8`+/`PD-1`+/`LAG3`+ cells having a 14-fold greater abundance in the tumor region versus the stromal region and `CD4`+/`PD-1`+/`LAG3`+ cells being present exclusively in the tumor region.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: 0.3244,
            spatialTargetX: 10140,
            spatialTargetY: 5622,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 21,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      332,
                      32852,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 23,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      534,
                      52836,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 15,
                    },
                    color: [
                      0,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      353,
                      9841,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 10,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      46,
                      27995,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-13-arrow-0',
                type: 'line',
                x1: 10224,
                y1: 5621,
                x2: 10160,
                y2: 5621,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
                text: 'PD-1+/LAG3+ T cell',
                textPosition: 'start',
                labelBackground: true,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-14',
      title: 'Macrophages',
      description: 'Many macrophages are present in both the tumor and stromal regions of this lung tissue.\n\nA subtype of macrophages or dendritic cells are detected using `IBA1`. Dendritic cells typically process antigens and present them on their cell surface to T cells, acting as an intermediary between the innate and adaptive immune systems.\n\nAnother macrophage marker, `CD163`, can be seen expressed on the surface of macrophages or monocytes.\n\nMultiplexed imaging reveals the diversity and dynamic states of macrophages,\nwith some cells showing co-expression of `IBA1` and `CD163`.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -1.4946,
            spatialTargetX: 8507,
            spatialTargetY: 4348,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 33,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      6,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 25,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      173,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-14-box-0',
                type: 'rectangle',
                x: 7736,
                y: 3747,
                width: 1777,
                height: 1294,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-15',
      title: 'Macrophages (cont.)',
      description: 'Other subtypes of macrophages include CD68 expressing macrophages which are involved in macrophage homing, CD11B expressing macrophages which are involved in adhesive interactions, and CD14 expressing macrophages which mediate innate immune responses.\n\nInterestingly, CD68 and CD11B expressing macrophages are concentrated in the tumor region, whereas CD14 expressing macrophages are spread throughout the tissue.\n\nMultiplexed images of immune markers were generated using tissue-based cyclic immunofluorescence (t-CyCIF) with a 40X/0.6NA objective.\n\nNote that the immunofluorescence signal for some markers (Keratin, IBA1, etc.) in this dataset are overexposed.',
      descriptionType: 'markdown',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -1.4946,
            spatialTargetX: 8507,
            spatialTargetY: 4348,
            spatialTargetZ: null,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: true,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: null,
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      c: 0,
                      t: 0,
                      z: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      65535,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 26,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      7,
                      29968,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 29,
                    },
                    color: [
                      255,
                      255,
                      255,
                    ],
                    visible: true,
                    slider: [
                      174,
                      53268,
                    ],
                  },
                  {
                    selection: {
                      z: 0,
                      t: 0,
                      c: 27,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      64,
                      65535,
                    ],
                  },
                ],
              },
            ],
            spatialSegmentationLayer: [],
            spatialPointLayer: null,
            spatialNeighborhoodLayer: null,
            annotationShapes: [
              {
                uid: 'frame-15-box-0',
                type: 'rectangle',
                x: 7736,
                y: 3747,
                width: 1777,
                height: 1294,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
            ],
          },
        },
      ],
    },
  ],
};

export const annotationsDemoLung3Data = {
  version: '1.0.18',
  name: 'Annotation Frames — Lung-3 CyCIF 40X (Minerva compatibility)',
  description: 'Demonstrates Minerva-story compatibility: a 44-channel CyCIF lung cancer specimen (LUNG-3-PR, 40X) presented as a guided annotation tour in the Minerva narrative style. Annotation frames loaded from a separate JSON file.',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'A',
      name: 'Lung-3',
      files: [
        {
          fileType: 'raster.json',
          url: 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/lung3.raster.json',
        },
        {
          fileType: 'annotationStory.json',
          url: makeJsonDataUrl(annotationStory),
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    spatialSegmentationLayer: {
      A: [],
    },
    spatialNeighborhoodLayer: {
      A: null,
    },
    spatialPointLayer: {
      A: null,
    },
    annotationFrameIndex: {
      A: null,
    },
    annotationOverlayVisible: {
      A: true,
    },
    annotationStory: {
      A: null,
    },
  },
  layout: [
    {
      uid: 'spatial',
      component: 'spatial',
      props: {
        coordinatesVisible: true,
      },
      coordinationScopes: {
        dataset: 'A',
        spatialSegmentationLayer: 'A',
        spatialNeighborhoodLayer: 'A',
        spatialPointLayer: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationStory: 'A',
      },
      x: 0,
      y: 0,
      w: 6,
      h: 12,
    },
    {
      component: 'layerController',
      props: {
        globalDisable3d: true,
        disableChannelsIfRgbDetected: true,
      },
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
      uid: 'annotation-controller',
      component: 'annotationController',
      coordinationScopes: {
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationStory: 'A',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    },
  ],
};
