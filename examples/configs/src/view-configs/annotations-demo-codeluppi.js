// Comprehensive annotation demo using the Codeluppi 2018 osmFISH dataset.
// Demonstrates every annotation feature:
//   - Spatial shapes (rectangle, arrow, ellipse, polygon, polyline)
//   - Scatterplot shapes in the t-SNE vs PCA views (per-view annotationShapes)
//   - Simultaneous shapes across all three views in one frame
//   - obsSetSelection (highlight specific cell type clusters)
//   - featureSelection + obsColorEncoding (switch to gene expression coloring)
//   - Zoom/pan control for both spatial and t-SNE per frame
//
// Each frame specifies per-view coordinationValues via frame.layout[].uid,
// which refers to the uid of a view in the layout below.
//
// NOTE: t-SNE/PCA shape coordinates are approximate — adjust after viewing the actual embedding.
// Cell type names must exactly match those in linnarsson.cell-sets.json.

const annotationStory = {
  uid: 'codeluppi-2018',
  title: 'Codeluppi 2018 osmFISH',
  description: 'This demo walks through the osmFISH somatosensory cortex dataset — spatial ROIs, cell type clusters, gene expression, and multi-view shape tethering.',
  descriptionType: 'text',
  frames: [
    {
      uid: 'frame-0',
      title: 'Dataset Overview',
      description: 'osmFISH somatosensory cortex (Codeluppi et al., 2018). The spatial view shows the tissue section; the t-SNE and PCA panels show dimensionality reduction of all cells. Navigate forward to explore each annotation feature.',
      descriptionType: 'text',
    },
    {
      uid: 'frame-1',
      title: 'Zoom Out',
      description: 'Zoom out to see Full Dataset.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            spatialZoom: -6.579,
            spatialTargetX: 14097.34,
            spatialTargetY: 26499.35,
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            embeddingZoom: 0.75,
            embeddingTargetX: 0,
            embeddingTargetY: 0,
          },
        },
      ],
    },
    {
      uid: 'frame-2',
      title: 'Oligodendrocyte Highlight — obsSetSelection',
      description: 'The Oligodendrocyte cluster is highlighted via obsSetSelection. All other cells are dimmed.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
              ],
            ],
            spatialZoom: -6.579,
            spatialTargetX: 14097.34,
            spatialTargetY: 26499.35,
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
            annotationShapes: [
              {
                uid: 'spatial-arrow-2',
                type: 'line',
                x1: 11994.05,
                y1: 40505.84,
                x2: 14948.18,
                y2: 35689.77,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  227,
                  0,
                ],
                strokeWidth: 4,
                text: 'Oligodendrocytes',
                textPosition: 'end',
              },
            ],
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
              ],
            ],
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
              ],
            ],
            embeddingZoom: 1.897,
            embeddingTargetX: 24.8486,
            embeddingTargetY: -40.8548,
          },
        },
      ],
    },
    {
      uid: 'frame-2b',
      title: 'Oligodendrocyte Subcluster Highlight — obsSetSelection',
      description: 'The Oligodendrocyte subclusters are highlighted via obsSetSelection. All other cells are dimmed.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte COP',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte MF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Mature',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte NF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Precursor cells',
              ],
            ],
            spatialZoom: -6.579,
            spatialTargetX: 14097.34,
            spatialTargetY: 26499.35,
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte COP',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte MF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Mature',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte NF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Precursor cells',
              ],
            ],
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte COP',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte MF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Mature',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte NF',
              ],
              [
                'Cell Type Annotations',
                'Oligodendrocytes',
                'Oligodendrocyte Precursor cells',
              ],
            ],
            embeddingZoom: 1.897,
            embeddingTargetX: 24.8486,
            embeddingTargetY: -40.8548,
            annotationShapes: [
              {
                uid: 'scatterplot-arrow-1',
                type: 'line',
                x1: 69.017,
                y1: -15.3467,
                x2: 75.4611,
                y2: -7.3,
                markerStart: 'Arrow',
                strokeColor: [
                  0,
                  255,
                  251,
                ],
                strokeWidth: 4,
                text: 'COP',
                textPosition: 'end',
              },
              {
                uid: 'scatterplot-arrow-2',
                type: 'line',
                x1: 19.61,
                y1: -12.66,
                x2: 23.91,
                y2: -5.42,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  0,
                  157,
                ],
                strokeWidth: 4,
                text: 'Precursor Cells',
                textPosition: 'end',
              },
              {
                uid: 'scatterplot-arrow-3',
                type: 'line',
                x1: 33.57,
                y1: -33.58,
                x2: 43.24,
                y2: -41.36,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  222,
                  0,
                ],
                strokeWidth: 4,
                text: 'NF',
                textPosition: 'end',
              },
              {
                uid: 'scatterplot-arrow-4',
                type: 'line',
                x1: 33.07,
                y1: -63.31,
                x2: 50.39,
                y2: -62.81,
                markerStart: 'Arrow',
                strokeColor: [
                  0,
                  255,
                  121,
                ],
                strokeWidth: 4,
                text: 'MF',
                textPosition: 'end',
              },
              {
                uid: 'scatterplot-arrow-5',
                type: 'line',
                x1: -4.01,
                y1: -54.23,
                x2: -18.51,
                y2: -55.58,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  218,
                  0,
                ],
                strokeWidth: 4,
                text: 'Mature',
                textPosition: 'end',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-2c',
      title: 'Oligodendrocyte Subcluster Highlight — feature selection',
      description: 'The Oligodendrocyte subclusters highlighted via feature selection (Plp1 gene expression).',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            obsColorEncoding: 'geneSelection',
            featureSelection: [
              'Plp1',
            ],
            spatialZoom: -6.579,
            spatialTargetX: 14097.34,
            spatialTargetY: 26499.35,
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'geneSelection',
            featureSelection: [
              'Plp1',
            ],
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            obsColorEncoding: 'geneSelection',
            featureSelection: [
              'Plp1',
            ],
            embeddingZoom: 1.897,
            embeddingTargetX: 24.8486,
            embeddingTargetY: -40.8548,
            annotationShapes: [
              {
                uid: 'frame-2c-arrow-1',
                type: 'line',
                x1: 69.017,
                y1: -15.3467,
                x2: 75.4611,
                y2: -7.3,
                markerStart: 'Arrow',
                strokeColor: [
                  0,
                  255,
                  251,
                ],
                strokeWidth: 4,
                text: 'COP',
                textPosition: 'end',
              },
              {
                uid: 'frame-2c-arrow-2',
                type: 'line',
                x1: 19.61,
                y1: -12.66,
                x2: 23.91,
                y2: -5.42,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  0,
                  157,
                ],
                strokeWidth: 4,
                text: 'Precursor Cells',
                textPosition: 'end',
              },
              {
                uid: 'frame-2c-arrow-3',
                type: 'line',
                x1: 33.57,
                y1: -33.58,
                x2: 43.24,
                y2: -41.36,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  222,
                  0,
                ],
                strokeWidth: 4,
                text: 'NF',
                textPosition: 'end',
              },
              {
                uid: 'frame-2c-arrow-4',
                type: 'line',
                x1: 33.07,
                y1: -63.31,
                x2: 50.39,
                y2: -62.81,
                markerStart: 'Arrow',
                strokeColor: [
                  0,
                  255,
                  121,
                ],
                strokeWidth: 4,
                text: 'MF',
                textPosition: 'end',
              },
              {
                uid: 'frame-2c-arrow-5',
                type: 'line',
                x1: -4.01,
                y1: -54.23,
                x2: -18.51,
                y2: -55.58,
                markerStart: 'Arrow',
                strokeColor: [
                  255,
                  218,
                  0,
                ],
                strokeWidth: 4,
                text: 'Mature',
                textPosition: 'end',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-5',
      title: 'All Views Simultaneously — One Frame, Three Targets',
      description: 'A single annotation frame drives all three views at once. Yellow shapes appear in the spatial view, blue in t-SNE, and green in PCA. Each view renders only the shapes addressed to it.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -4.2,
            spatialTargetX: 16000,
            spatialTargetY: 20000,
            obsColorEncoding: 'cellSetSelection',
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
            annotationShapes: [
              {
                uid: 'multi-spatial-rect',
                type: 'rectangle',
                x: 10000,
                y: 15000,
                width: 12000,
                height: 10000,
                strokeColor: [
                  255,
                  200,
                  0,
                ],
                strokeWidth: 2,
              },
            ],
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            embeddingZoom: 1.2,
            embeddingTargetX: -10,
            embeddingTargetY: -4,
            obsColorEncoding: 'cellSetSelection',
            annotationShapes: [
              {
                uid: 'multi-tsne-rect',
                type: 'rectangle',
                x: -15,
                y: -8,
                width: 10,
                height: 8,
                strokeColor: [
                  80,
                  200,
                  255,
                ],
                strokeWidth: 2,
                text: 't-SNE target',
              },
            ],
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
            annotationShapes: [
              {
                uid: 'multi-pca-rect',
                type: 'rectangle',
                x: -0.4,
                y: -0.2,
                width: 0.8,
                height: 0.5,
                strokeColor: [
                  80,
                  255,
                  130,
                ],
                strokeWidth: 2,
                text: 'PCA target',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-6',
      title: 'New Shape Types — Ellipse, Polygon, Polyline',
      description: 'Three additional OME-ROI shape types: an ellipse outlining a region of interest, a polygon tracing an irregular boundary, and a polyline path with an arrowhead.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -5.088,
            spatialTargetX: 7024.56,
            spatialTargetY: 42388.31,
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
            annotationShapes: [
              {
                uid: 'ellipse-1',
                type: 'ellipse',
                x1: 10323.79,
                y1: 41354.99,
                radiusX: 2000,
                radiusY: 1300,
                strokeColor: [
                  255,
                  255,
                  255,
                ],
                strokeWidth: 4,
                text: 'Ellipse ROI',
              },
              {
                uid: 'polygon-1',
                type: 'polygon',
                points: [
                  [
                    14500,
                    18800,
                  ],
                  [
                    15800,
                    18400,
                  ],
                  [
                    16200,
                    19200,
                  ],
                  [
                    15600,
                    20000,
                  ],
                  [
                    14300,
                    19600,
                  ],
                ],
                strokeColor: [
                  100,
                  220,
                  255,
                ],
                strokeWidth: 4,
                text: 'Polygon region',
              },
              {
                uid: 'polyline-1',
                type: 'polyline',
                points: [
                  [
                    17200,
                    19000,
                  ],
                  [
                    16800,
                    19800,
                  ],
                  [
                    16400,
                    20400,
                  ],
                  [
                    16000,
                    21000,
                  ],
                ],
                strokeColor: [
                  180,
                  120,
                  255,
                ],
                strokeWidth: 4,
                strokeDashArray: '10 4',
                markerEnd: 'Arrow',
                text: 'Polyline path',
              },
            ],
          },
        },
      ],
    },
    {
      uid: 'frame-7',
      title: 'End of Demo — All Features Shown',
      description: 'Features demonstrated: spatial shapes (rectangle, line, ellipse, polygon, polyline), scatterplot shapes (t-SNE and PCA), shape tethering via targetCoordinationValues, obsSetSelection, featureSelection, obsColorEncoding, and per-frame zoom/pan.',
      descriptionType: 'text',
      layout: [
        {
          uid: 'spatial',
          coordinationValues: {
            spatialZoom: -5.5,
            spatialTargetX: 16000,
            spatialTargetY: 20000,
            obsColorEncoding: 'cellSetSelection',
            spatialImageLayer: [],
            spatialPointLayer: {
              visible: false,
              radius: 20,
              opacity: 1,
            },
          },
        },
        {
          uid: 'scatterplot-tsne',
          coordinationValues: {
            embeddingZoom: 0.75,
            embeddingTargetX: 0,
            embeddingTargetY: 0,
            obsColorEncoding: 'cellSetSelection',
          },
        },
        {
          uid: 'scatterplot-pca',
          coordinationValues: {
            obsColorEncoding: 'cellSetSelection',
          },
        },
      ],
    },
  ],
};

export const annotationsDemoCodeluppi = {
  name: 'Annotation Demo — Codeluppi 2018 (Full Feature)',
  description: 'Demonstrates multiple different views (spatial, t-SNE, PCA) being controlled simultaneously by a single annotation frame — alongside shapes, gene expression coloring, cell type selection, and zoom control per view.',
  version: '1.0.18',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          fileType: 'cells.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cells.json',
          options: {
            embeddingTypes: [
              'PCA',
              't-SNE',
            ],
          },
        },
        {
          fileType: 'cell-sets.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json',
        },
        {
          fileType: 'image.raster.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.raster.json',
        },
        {
          fileType: 'molecules.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.molecules.json',
        },
        {
          fileType: 'neighborhoods.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.neighborhoods.json',
        },
        {
          fileType: 'clusters.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.clusters.json',
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    embeddingTargetX: {
      TSNE: 0,
    },
    embeddingTargetY: {
      TSNE: 0,
    },
    spatialZoom: {
      A: -5.5,
    },
    spatialTargetX: {
      A: 16000,
    },
    spatialTargetY: {
      A: 20000,
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
      component: 'layerController',
      props: {
        globalDisable3d: true,
        disableChannelsIfRgbDetected: true,
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      uid: 'annotation-controller',
      component: 'annotationController',
      coordinationScopes: {
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationStory: 'A',
      },
      x: 0,
      y: 2,
      w: 2,
      h: 4,
    },
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
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'featureList',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'obsSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'heatmap',
      props: {
        transpose: true,
      },
      x: 2,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'obsSetFeatureValueDistribution',
      x: 7,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      uid: 'scatterplot-pca',
      component: 'scatterplot',
      props: {
        coordinatesVisible: true,
      },
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationStory: 'A',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      uid: 'scatterplot-tsne',
      component: 'scatterplot',
      props: {
        coordinatesVisible: true,
      },
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
        embeddingTargetX: 'TSNE',
        embeddingTargetY: 'TSNE',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationStory: 'A',
      },
      x: 6,
      y: 2,
      w: 3,
      h: 2,
    },
  ],
};
