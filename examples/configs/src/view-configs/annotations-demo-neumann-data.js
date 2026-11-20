// Neumann et al. 2020 multi-modal kidney imaging dataset — data mode annotation demo.
// PAS and AF modalities only (IMS layers omitted).
// The annotationStory is loaded from an annotationStory.json file (provided here via a data URL).

import { makeJsonDataUrl } from '../utils.js';

const annotationStory = {
  uid: 'neumann-2020',
  title: 'Neumann et al. 2020 (PAS + AF)',
  frames: [
    {
      uid: 'frame-0',
      title: 'Name 1',
      description: 'Waypoint 1',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -3.3436,
            spatialTargetX: 5722,
            spatialTargetY: 16699,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: false,
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
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 1,
                visible: true,
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
                      c: 0,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      1024,
                      23753,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      373,
                      9848,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      326,
                      14084,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'frame-0-box-0',
                type: 'rectangle',
                x: 5071,
                y: 15830,
                width: 2659,
                height: 1757,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-0-arrow-0',
                type: 'line',
                x1: 5382,
                y1: 16431,
                x2: 6181,
                y2: 16290,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
                text: 'Arrow 1',
                textPosition: 'start',
              },
              {
                uid: 'frame-0-arrow-1',
                type: 'line',
                x1: 7031,
                y1: 16035,
                x2: 6374,
                y2: 16512,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
                text: 'Arrow 2',
                textPosition: 'start',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-1',
      title: 'Name 2',
      description: 'Description 2',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.2914,
            spatialTargetX: 20607,
            spatialTargetY: 9492,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: false,
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
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 1,
                visible: true,
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
                      c: 0,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      1024,
                      23753,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      373,
                      9848,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      326,
                      14084,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'frame-1-box-0',
                type: 'rectangle',
                x: 9403,
                y: 12954,
                width: 433,
                height: 378,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-1',
                type: 'rectangle',
                x: 7554,
                y: 12944,
                width: 515,
                height: 530,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-2',
                type: 'rectangle',
                x: 8258,
                y: 13654,
                width: 652,
                height: 609,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-3',
                type: 'rectangle',
                x: 9502,
                y: 14529,
                width: 494,
                height: 560,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-4',
                type: 'rectangle',
                x: 8874,
                y: 14657,
                width: 505,
                height: 564,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-5',
                type: 'rectangle',
                x: 8338,
                y: 15591,
                width: 558,
                height: 475,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-6',
                type: 'rectangle',
                x: 10815,
                y: 13290,
                width: 464,
                height: 412,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
              },
              {
                uid: 'frame-1-box-7',
                type: 'rectangle',
                x: 11052,
                y: 14583,
                width: 435,
                height: 485,
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
      title: 'Three',
      description: 'stherewasf',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.2914,
            spatialTargetX: 20607,
            spatialTargetY: 9492,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: false,
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
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 1,
                visible: true,
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
                      c: 0,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      1024,
                      23753,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      373,
                      9848,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      326,
                      14084,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'frame-2-arrow-0',
                type: 'line',
                x1: 20663,
                y1: 10032,
                x2: 20468,
                y2: 9693,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
              },
              {
                uid: 'frame-2-arrow-1',
                type: 'line',
                x1: 20654,
                y1: 9628,
                x2: 20459,
                y2: 9289,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
              },
              {
                uid: 'frame-2-arrow-2',
                type: 'line',
                x1: 20756,
                y1: 10436,
                x2: 20560,
                y2: 10097,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                markerEnd: 'Arrow',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-3',
      title: 'Four',
      description: 'Four',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -2.6066,
            spatialTargetX: 16492,
            spatialTargetY: 10434,
            spatialImageLayer: [
              {
                type: 'raster',
                index: 0,
                visible: false,
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
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      0,
                      255,
                    ],
                  },
                ],
              },
              {
                type: 'raster',
                index: 1,
                visible: true,
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
                      c: 0,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      0,
                      255,
                    ],
                    visible: true,
                    slider: [
                      1024,
                      23753,
                    ],
                  },
                  {
                    selection: {
                      c: 1,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      0,
                      255,
                      0,
                    ],
                    visible: false,
                    slider: [
                      373,
                      9848,
                    ],
                  },
                  {
                    selection: {
                      c: 2,
                      z: 0,
                      t: 0,
                    },
                    color: [
                      255,
                      0,
                      255,
                    ],
                    visible: false,
                    slider: [
                      326,
                      14084,
                    ],
                  },
                ],
              },
            ],
            annotationShapes: [
              {
                uid: 'frame-3-box-0',
                type: 'rectangle',
                x: 17557,
                y: 10626,
                width: 447,
                height: 455,
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

export const annotationsDemoNeumannData = {
  version: '1.0.18',
  name: 'Annotation Frames — Neumann et al. 2020 (PAS + AF, data mode)',
  description: 'Four registered imaging modalities from HuBMAP HBM876.XNRH.336 — PAS and AF only. Annotation frames loaded from a separate JSON file.',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'A',
      name: 'Neumann 2020',
      files: [
        {
          fileType: 'raster.json',
          url: 'https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/neumann-pas-af.raster.json',
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
    obsType: {
      A: 'cell',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
    },
    spatialZoom: {
      A: -4.544584921291093,
    },
    spatialTargetX: {
      A: 15426.009817723443,
    },
    spatialTargetY: {
      A: 7675.529803483682,
    },
    spatialImageLayer: {
      A: [
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
                z: 0,
                t: 0,
              },
              color: [
                255,
                0,
                0,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: {
                c: 1,
                z: 0,
                t: 0,
              },
              color: [
                0,
                255,
                0,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: {
                c: 2,
                z: 0,
                t: 0,
              },
              color: [
                0,
                0,
                255,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
          ],
        },
        {
          type: 'raster',
          index: 1,
          visible: true,
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
                c: 0,
                z: 0,
                t: 0,
              },
              color: [
                0,
                0,
                255,
              ],
              visible: true,
              slider: [
                1024,
                23753,
              ],
            },
            {
              selection: {
                c: 1,
                z: 0,
                t: 0,
              },
              color: [
                0,
                255,
                0,
              ],
              visible: true,
              slider: [
                373,
                9848,
              ],
            },
            {
              selection: {
                c: 2,
                z: 0,
                t: 0,
              },
              color: [
                255,
                0,
                255,
              ],
              visible: true,
              slider: [
                326,
                14084,
              ],
            },
          ],
        },
      ],
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
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialImageLayer: 'A',
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
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialImageLayer: 'A',
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
