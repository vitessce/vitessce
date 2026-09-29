// Neumann et al. 2020 multi-modal kidney imaging dataset — annotation demo using spatialBeta.
// PAS and AF modalities only (IMS layers omitted), loaded directly from the OME-TIFF files
// listed in https://data-2.vitessce.io/data/rseaman/annotationDemoFiles/neumann-pas-af.raster.json.
// Same story as annotations-demo-neumann-data.js, with the per-frame image layers expressed
// as multi-level ({ "$CL": [...] }) imageLayer/imageChannel coordination values.
// The annotationStory is loaded from an annotationStory.json file (provided here via a data URL).
import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';
import { makeJsonDataUrl } from '../utils.js';

const annotationStory = {
  uid: 'neumann-2020-spatial-beta',
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
            imageLayer: {
              $CL: [
                {
                  fileUid: 'PAS',
                  spatialLayerVisible: false,
                  spatialLayerOpacity: 1,
                  photometricInterpretation: 'RGB',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          255,
                          0,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                    ],
                  },
                },
                {
                  fileUid: 'AF',
                  spatialLayerVisible: true,
                  spatialLayerOpacity: 1,
                  spatialLayerTransparentColor: [
                    0,
                    0,
                    0,
                  ],
                  photometricInterpretation: 'BlackIsZero',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          1024,
                          23753,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          373,
                          9848,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          255,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          326,
                          14084,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
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
            imageLayer: {
              $CL: [
                {
                  fileUid: 'PAS',
                  spatialLayerVisible: false,
                  spatialLayerOpacity: 1,
                  photometricInterpretation: 'RGB',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          255,
                          0,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                    ],
                  },
                },
                {
                  fileUid: 'AF',
                  spatialLayerVisible: true,
                  spatialLayerOpacity: 1,
                  spatialLayerTransparentColor: [
                    0,
                    0,
                    0,
                  ],
                  photometricInterpretation: 'BlackIsZero',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          1024,
                          23753,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          373,
                          9848,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          255,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          326,
                          14084,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
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
            imageLayer: {
              $CL: [
                {
                  fileUid: 'PAS',
                  spatialLayerVisible: false,
                  spatialLayerOpacity: 1,
                  photometricInterpretation: 'RGB',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          255,
                          0,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                    ],
                  },
                },
                {
                  fileUid: 'AF',
                  spatialLayerVisible: true,
                  spatialLayerOpacity: 1,
                  spatialLayerTransparentColor: [
                    0,
                    0,
                    0,
                  ],
                  photometricInterpretation: 'BlackIsZero',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: false,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          1024,
                          23753,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: false,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          373,
                          9848,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          255,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          326,
                          14084,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
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
            imageLayer: {
              $CL: [
                {
                  fileUid: 'PAS',
                  spatialLayerVisible: false,
                  spatialLayerOpacity: 1,
                  photometricInterpretation: 'RGB',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          255,
                          0,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          0,
                          255,
                        ],
                      },
                    ],
                  },
                },
                {
                  fileUid: 'AF',
                  spatialLayerVisible: true,
                  spatialLayerOpacity: 1,
                  spatialLayerTransparentColor: [
                    0,
                    0,
                    0,
                  ],
                  photometricInterpretation: 'BlackIsZero',
                  imageChannel: {
                    $CL: [
                      {
                        spatialTargetC: 0,
                        spatialChannelColor: [
                          0,
                          0,
                          255,
                        ],
                        spatialChannelVisible: true,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          1024,
                          23753,
                        ],
                      },
                      {
                        spatialTargetC: 1,
                        spatialChannelColor: [
                          0,
                          255,
                          0,
                        ],
                        spatialChannelVisible: false,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          373,
                          9848,
                        ],
                      },
                      {
                        spatialTargetC: 2,
                        spatialChannelColor: [
                          255,
                          0,
                          255,
                        ],
                        spatialChannelVisible: false,
                        spatialChannelOpacity: 1,
                        spatialChannelWindow: [
                          326,
                          14084,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
    },
  ],
};

function generateConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'Annotation Frames — Neumann et al. 2020 (PAS + AF, spatialBeta)',
    description: 'Four registered imaging modalities from HuBMAP HBM876.XNRH.336 — PAS and AF only, rendered with spatialBeta and layerControllerBeta. Annotation frames loaded from a separate JSON file.',
  });
  const dataset = config.addDataset('Neumann 2020')
    .addFile({
      fileType: 'image.ome-tiff',
      url: 'https://assets.hubmapconsortium.org/f4188a148e4c759092d19369d310883b/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-PAS_images/VAN0006-LK-2-85-PAS_registered.ome.tif?token=',
      coordinationValues: {
        fileUid: 'PAS',
      },
    })
    .addFile({
      fileType: 'image.ome-tiff',
      url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
      coordinationValues: {
        fileUid: 'AF',
      },
    })
    .addFile({
      fileType: 'annotationStory.json',
      url: makeJsonDataUrl(annotationStory),
    });

  const spatialView = config.addView(dataset, 'spatialBeta', {
    uid: 'spatial', x: 0, y: 0, w: 6, h: 12,
  });
  const lcView = config.addView(dataset, 'layerControllerBeta', {
    uid: 'layer-controller', x: 6, y: 0, w: 3, h: 12,
  });
  const annotationView = config.addView(dataset, 'annotationController', {
    uid: 'annotation-controller', x: 9, y: 0, w: 3, h: 12,
  });

  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL([
      {
        fileUid: 'PAS',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        photometricInterpretation: 'RGB',
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
        ]),
      },
      {
        fileUid: 'AF',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        spatialLayerTransparentColor: [0, 0, 0],
        photometricInterpretation: 'BlackIsZero',
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [1024, 23753],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [373, 9848],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [326, 14084],
          },
        ]),
      },
    ]),
  });

  config.linkViews(
    [spatialView],
    ['spatialZoom', 'spatialTargetX', 'spatialTargetY'],
    [-4.544584921291093, 15426.009817723443, 7675.529803483682],
  );
  config.linkViews(
    [spatialView, annotationView],
    ['annotationStory', 'annotationFrameIndex', 'annotationOverlayVisible'],
    [null, null, true],
  );

  return config.toJSON();
}

export const annotationsDemoNeumann2 = generateConfig();
