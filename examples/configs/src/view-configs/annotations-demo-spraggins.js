// Spraggins 2020 multiplex immunofluorescence kidney dataset with an annotation story.
// Keeps the original spatial + layerController views; spatial is narrowed to make room
// for the annotationController panel on the right.
// The annotationStory is embedded directly as a coordination value in this config.

import { urlPrefix } from '../utils.js';

const annotationStory = {
  uid: 'spraggins-2020-embedded',
  title: 'Spraggins 2020 Kidney',
  description: 'This demo walks through the Spraggins 2020 multiplex immunofluorescence kidney dataset. The annotations and story are strictly for demonstration purposes only and will not reflect true biological findings.',
  descriptionType: 'text',
  frames: [
    {
      uid: 'frame-0',
      title: 'Kidney Overview — All Channels',
      description: 'High bit-depth multiplex IF image of human kidney (Spraggins et al., 2020). All four channels: DAPI (nuclei), Laminin (basement membrane), Synaptopodin (glomerular), THP (thick limb).',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -6,
            spatialTargetX: 26800,
            spatialTargetY: 17300,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-1',
      title: 'Glomeruli — Synaptopodin + DAPI',
      description: 'Synaptopodin marks podocytes of the glomerular filtration barrier. Laminin and THP are hidden to isolate glomerular signal.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -6,
            spatialTargetX: 26800,
            spatialTargetY: 17300,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'glom-arrow',
                type: 'line',
                x1: 26088,
                y1: 10566,
                x2: 21395,
                y2: 13200,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: 'Glom Barrier',
                textPosition: 'start',
              },
              {
                uid: 'glom-line-1',
                type: 'line',
                x1: 26700,
                y1: 5630,
                x2: 21000,
                y2: 8200,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'glom-line-2',
                type: 'line',
                x1: 21400,
                y1: 17000,
                x2: 21000,
                y2: 8200,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'glom-line-3',
                type: 'line',
                x1: 21400,
                y1: 17000,
                x2: 42789,
                y2: 20383,
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
      title: 'Glomerulus Detail — Synaptopodin + DAPI',
      description: 'This is a detailed view of a glomerulus, showing the synaptopodin and DAPI staining.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2,
            spatialTargetX: 18646,
            spatialTargetY: 13200,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'detail-arrow',
                type: 'line',
                x1: 20000,
                y1: 12326,
                x2: 18983,
                y2: 12326,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: '1',
                textPosition: 'start',
              },
              {
                uid: 'detail-arrow-b',
                type: 'line',
                x1: 20000,
                y1: 12893,
                x2: 19136,
                y2: 12893,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: '2',
                textPosition: 'start',
              },
              {
                uid: 'detail-arrow-c',
                type: 'line',
                x1: 20000,
                y1: 13224,
                x2: 18442,
                y2: 13224,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: '3',
                textPosition: 'start',
              },
              {
                uid: 'detail-arrow-d',
                type: 'line',
                x1: 20000,
                y1: 13940,
                x2: 19107,
                y2: 13940,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: '4',
                textPosition: 'start',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-3',
      title: 'Tubule Detail — THP + DAPI',
      description: 'This is a detailed view of a tubule, showing the THP and DAPI staining.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -3.5,
            spatialTargetX: 14646,
            spatialTargetY: 13200,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'tubule-detail-box',
                type: 'rectangle',
                x: 11428,
                y: 12516,
                width: 6500,
                height: 2000,
                strokeColor: [
                  255,
                  177,
                  107,
                ],
                strokeWidth: 4,
                text: 'THP+ Tubule',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-3b',
      title: 'Tubule Detail — THP + DAPI',
      description: 'Same location as previous frame, but with DAPI channel hidden to show the risk of interpreting THP signal without nuclear context. The boxed tubule looks fine, but the arrows point to three other areas of THP signal that are not associated with nuclei and are likely artifacts.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2,
            spatialTargetX: 14646,
            spatialTargetY: 13200,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'tubule-detail-box-b',
                type: 'rectangle',
                x: 11428,
                y: 12516,
                width: 6500,
                height: 2000,
                strokeColor: [
                  255,
                  0,
                  0,
                ],
                strokeWidth: 4,
                text: 'THP+ Tubule',
              },
              {
                uid: 'tubule-detail-arrow-1',
                type: 'line',
                x1: 13452,
                y1: 13745,
                x2: 13000,
                y2: 14000,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  0,
                  0,
                ],
                strokeWidth: 4,
                text: '1',
                textPosition: 'end',
              },
              {
                uid: 'tubule-detail-arrow-2',
                type: 'line',
                x1: 12100,
                y1: 12873,
                x2: 12000,
                y2: 14000,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  0,
                  0,
                ],
                strokeWidth: 4,
                text: '3',
                textPosition: 'end',
              },
              {
                uid: 'tubule-detail-arrow-3',
                type: 'line',
                x1: 15800,
                y1: 13000,
                x2: 15200,
                y2: 13300,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  0,
                  0,
                ],
                strokeWidth: 4,
                text: '2',
                textPosition: 'end',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-3c',
      title: 'Tubule Detail — THP + DAPI',
      description: 'Same location as previous frame, but with DAPI channel restored to show the nuclei of cells within and surrounding the tubule.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -4,
            spatialTargetX: 15500,
            spatialTargetY: 13200,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'tubule-detail-box-1',
                type: 'rectangle',
                x: 11428,
                y: 12516,
                width: 6500,
                height: 2000,
                strokeColor: [
                  255,
                  0,
                  0,
                ],
                strokeWidth: 4,
                text: 'PROBLEMATIC',
              },
              {
                uid: 'tubule-detail-box-2',
                type: 'rectangle',
                x: 13800,
                y: 10300,
                width: 4500,
                height: 2000,
                strokeColor: [
                  0,
                  255,
                  30,
                ],
                strokeWidth: 4,
                text: 'GOOD',
              },
              {
                uid: 'tubule-detail-box-3',
                type: 'rectangle',
                x: 10300,
                y: 10100,
                width: 2350,
                height: 1500,
                strokeColor: [
                  0,
                  255,
                  30,
                ],
                strokeWidth: 4,
                text: 'GOOD',
              },
              {
                uid: 'tubule-detail-box-4',
                type: 'rectangle',
                x: 12500,
                y: 7600,
                width: 2600,
                height: 1200,
                strokeColor: [
                  0,
                  255,
                  30,
                ],
                strokeWidth: 4,
                text: 'GOOD',
              },
              {
                uid: 'tubule-detail-box-5',
                type: 'rectangle',
                x: 11300,
                y: 8600,
                width: 2900,
                height: 1200,
                strokeColor: [
                  0,
                  255,
                  30,
                ],
                strokeWidth: 4,
                text: 'GOOD',
              },
              {
                uid: 'tubule-detail-box-6',
                type: 'rectangle',
                x: 15700,
                y: 7700,
                width: 3100,
                height: 1500,
                strokeColor: [
                  0,
                  255,
                  30,
                ],
                strokeWidth: 4,
                text: 'GOOD',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-4',
      title: 'Tubules — THP + DAPI',
      description: 'THP marks the thick ascending limb of the loop of Henle. Laminin and Synaptopodin are hidden.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -5.8,
            spatialTargetX: 20000,
            spatialTargetY: 20000,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'tubule-arrow-a',
                type: 'line',
                x1: 10000,
                y1: 18000,
                x2: 12000,
                y2: 20000,
                markerEnd: 'Arrow',
                strokeColor: [
                  255,
                  165,
                  0,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'tubule-arrow-b',
                type: 'line',
                x1: 30000,
                y1: 18000,
                x2: 28000,
                y2: 20000,
                markerEnd: 'Arrow',
                strokeColor: [
                  80,
                  200,
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
      title: 'Basement Membrane — Laminin + DAPI',
      description: 'Laminin marks basement membranes surrounding tubules and glomeruli — the structural scaffold of the kidney.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -4.5,
            spatialTargetX: 26000,
            spatialTargetY: 25000,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'interstitium-rect',
                type: 'rectangle',
                x: 22000,
                y: 22000,
                width: 8000,
                height: 6000,
                strokeColor: [
                  180,
                  130,
                  255,
                ],
                strokeWidth: 2,
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-6',
      title: 'Full Tissue — All Channels',
      description: 'Full tissue overview with all four channels restored. Use the layer controller to fine-tune individual channel sliders.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -6.5,
            spatialTargetX: 20000,
            spatialTargetY: 20000,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 1,
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
                      channel: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      20,
                      24553,
                    ],
                  },
                  {
                    selection: {
                      channel: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      75,
                      15541,
                    ],
                  },
                  {
                    selection: {
                      channel: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      17,
                      8705,
                    ],
                  },
                  {
                    selection: {
                      channel: 3,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      21,
                      1752,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 0,
                visible: false,
                colormap: null,
                opacity: 1,
                domainType: 'Min/Max',
                transparentColor: [
                  0,
                  0,
                  0,
                ],
                renderingMode: 'Additive',
                use3d: false,
                channels: [
                  {
                    selection: {
                      mz: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      85,
                      657,
                    ],
                  },
                  {
                    selection: {
                      mz: 1,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      320,
                      18875,
                    ],
                  },
                  {
                    selection: {
                      mz: 2,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      99,
                      4120,
                    ],
                  },
                  {
                    selection: {
                      mz: 3,
                    },
                    color: [
                      255,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      133,
                      9265,
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export const annotationsDemoSpraggins = {
  name: 'Annotation Frames — Spraggins 2020 Kidney (embedded)',
  description: 'Reference example of embedded annotation frames: frames are defined directly inline in this config rather than fetched from a separate file. Compare with the data-mode version of this demo.',
  version: '1.0.18',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'spraggins',
      name: 'Spraggins 2020',
      files: [
        {
          fileType: 'raster.json',
          url: `${urlPrefix}/spraggins/spraggins.raster.json`,
        },
      ],
    },
  ],
  coordinationSpace: {
    spatialZoom: {
      A: -6,
    },
    spatialTargetX: {
      A: 26800,
    },
    spatialTargetY: {
      A: 17300,
    },
    annotationFrameIndex: {
      A: null,
    },
    annotationOverlayVisible: {
      A: true,
    },
    annotationStory: {
      A: annotationStory,
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
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
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
