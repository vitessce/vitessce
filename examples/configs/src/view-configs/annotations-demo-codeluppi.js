// Comprehensive annotation demo using the Codeluppi 2018 osmFISH dataset.
// Demonstrates every annotation feature:
//   - Spatial shapes (rectangle, arrow, ellipse, polygon, polyline)
//   - Scatterplot shapes tethered to t-SNE vs PCA (targetCoordinationValues)
//   - Simultaneous shapes across all three views in one frame
//   - obsSetSelection (highlight specific cell type clusters)
//   - featureSelection + obsColorEncoding (switch to gene expression coloring)
//   - Zoom/pan control for both spatial and t-SNE per frame
//
// Layout is identical to codeluppi2018 except:
//   - layerController compressed h:4 → h:2
//   - annotationController added in freed left-column space (x:0, y:3, w:2, h:3)
//   - status shifted y:5 → y:6
//
// NOTE: t-SNE/PCA shape coordinates are approximate — adjust after viewing the actual embedding.
// Cell type names must exactly match those in linnarsson.cell-sets.json.

export const annotationsDemoCodeluppi = {
  name: 'Annotation Demo — Codeluppi 2018 (Full Feature)',
  description: 'Demonstrates all annotation functionality: spatial shapes, t-SNE shapes, PCA shapes, gene expression, cell type selection, and zoom control.',
  version: '1.0.0',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          type: 'cells',
          fileType: 'cells.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cells.json',
          options: { embeddingTypes: ['PCA', 't-SNE'] },
        },
        {
          type: 'cell-sets',
          fileType: 'cell-sets.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.cell-sets.json',
        },
        {
          fileType: 'image.raster.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.raster.json',
        },
        {
          type: 'molecules',
          fileType: 'molecules.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.molecules.json',
        },
        {
          type: 'neighborhoods',
          fileType: 'neighborhoods.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.neighborhoods.json',
        },
        {
          type: 'expression-matrix',
          fileType: 'clusters.json',
          url: 'https://data-1.vitessce.io/0.0.31/master_release/linnarsson/linnarsson.clusters.json',
        },
      ],
    },
  ],
  coordinationSpace: {
    // Existing scopes from codeluppi2018
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    embeddingTargetX: { TSNE: 0 },
    embeddingTargetY: { TSNE: 0 },
    spatialZoom: { A: -5.5 },
    spatialTargetX: { A: 16000 },
    spatialTargetY: { A: 20000 },
    // Annotation scopes
    annotationFrameIndex: { A: null },
    annotationOverlayVisible: { A: true },
    annotationDescription: { A: "This demo walks through the osmFISH somatosensory cortex dataset — spatial ROIs, cell type clusters, gene expression, and multi-view shape tethering." },
    annotationFrames: {
      A: [
        // ── Frame 0 ─────────────────────────────────────────────────────────
        // Pure narrative bookmark — no shapes, all views at full extent.
        {
          uid: 'frame-0',
          title: 'Dataset Overview',
          text: 'osmFISH somatosensory cortex (Codeluppi et al., 2018). The spatial view shows the tissue section; the t-SNE and PCA panels show dimensionality reduction of all cells. Navigate forward to explore each annotation feature.',
        },

        // ── Frame 1 ─────────────────────────────────────────────────────────
        // Feature: spatial rectangle + arrow; t-SNE cluster highlighted.
        // targetView: 'spatial' → renders only in the spatial image.
        // targetView: 'scatterplot' + embeddingType: 't-SNE' → renders only in t-SNE.
        {
          uid: 'frame-1',
          title: 'Zoom Out',
          text: 'Zoom out to see Full Dataset.',
          // viewStates: per-view zoom/pan — each scatterplot gets its own entry.
          // t-SNE zooms to the cluster; PCA stays at overview zoom.
          viewStates: [
            {
              targetView: 'spatial',
              spatialZoom: -6.579,
              spatialTargetX: 14097.34,
              spatialTargetY: 26499.35,
              spatialImageLayer: [{ index: 0, visible: false }],
              spatialPointLayer: { visible: false, radius: 20, opacity: 1 }
            },
            {
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              embeddingZoom: 0.750,
              embeddingTargetX: 0,
              embeddingTargetY: 0,
            },
          ],
          // viewState: cross-view state only (no zoom/pan here anymore)
          viewState: { obsColorEncoding: 'cellSetSelection' },
        },

        // ── Frame 2 ─────────────────────────────────────────────────────────
        // Feature: obsSetSelection — highlight a specific cell type cluster.
        // The t-SNE dims all other clusters; the spatial view colors cells by type.
        {
          uid: 'frame-2',
          title: 'Oligodendrocyte Highlight — obsSetSelection',
          text: 'The Oligodendrocyte cluster is highlighted via obsSetSelection. All other cells are dimmed.',
          shapes: [
            {
              uid: 'spatial-arrow-2',
              type: 'line',
              targetView: 'spatial',
              x1: 11994.05, y1: 40505.84,
              x2: 14948.18, y2: 35689.77,
              markerStart: 'Arrow',
              strokeColor: [255, 227, 0],
              strokeWidth: 4,
              text: 'Oligodendrocytes',
              textPosition: 'end',
            }
          ],
          viewStates: [
            {
              targetView: 'spatial',
              spatialZoom: -6.579,
              spatialTargetX: 14097.34,
              spatialTargetY: 26499.35,
              spatialImageLayer: [{ index: 0, visible: false }],
              spatialPointLayer: { visible: false, radius: 20, opacity: 1 }
            },
            {
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              embeddingZoom: 1.897,
              embeddingTargetX: 24.8486,
              embeddingTargetY: -40.8548,
            },
          ],
          viewState: { 
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [['Cell Type Annotations', 'Oligodendrocytes']],
          },
        },
        {
          uid: 'frame-2b',
          title: 'Oligodendrocyte Subcluster Highlight — obsSetSelection',
          text: 'The Oligodendrocyte subclusters is highlighted via obsSetSelection. All other cells are dimmed.',
          shapes: [
            {
              uid: 'scatterplot-arrow-1',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 69.0170, y1: -15.3467,
              x2: 75.4611, y2: -7.3000,
              markerStart: 'Arrow',
              strokeColor: [0, 255, 251],
              strokeWidth: 4,
              text: 'COP',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-2',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 19.61, y1: -12.66,
              x2: 23.91, y2: -5.42,
              markerStart: 'Arrow',
              strokeColor: [255, 0, 157],
              strokeWidth: 4,
              text: 'Precursor Cells',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-3',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 33.57, y1: -33.58,
              x2: 43.24, y2: -41.36,
              markerStart: 'Arrow',
              strokeColor: [255, 222, 0],
              strokeWidth: 4,
              text: 'NF',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-4',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 33.07, y1: -63.31,
              x2: 50.39, y2: -62.81,
              markerStart: 'Arrow',
              strokeColor: [0, 255,121],
              strokeWidth: 4,
              text: 'MF',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-5',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: -4.01, y1: -54.23,
              x2: -18.51, y2: -55.58,
              markerStart: 'Arrow',
              strokeColor: [255, 218, 0],
              strokeWidth: 4,
              text: 'Mature',
              textPosition: 'end',
            }
          ],
          viewStates: [
            {
              targetView: 'spatial',
              spatialZoom: -6.579,
              spatialTargetX: 14097.34,
              spatialTargetY: 26499.35,
              spatialImageLayer: [{ index: 0, visible: false }],
              spatialPointLayer: { visible: false, radius: 20, opacity: 1 }
            },
            {
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              embeddingZoom: 1.897,
              embeddingTargetX: 24.8486,
              embeddingTargetY: -40.8548,
            },
          ],
          viewState: { 
            obsColorEncoding: 'cellSetSelection',
            obsSetSelection: [['Cell Type Annotations', 'Oligodendrocytes', 'Oligodendrocyte COP'],
                              ['Cell Type Annotations', 'Oligodendrocytes', 'Oligodendrocyte MF'],
                              ['Cell Type Annotations', 'Oligodendrocytes', 'Oligodendrocyte Mature'],
                              ['Cell Type Annotations', 'Oligodendrocytes', 'Oligodendrocyte NF'],
                              ['Cell Type Annotations', 'Oligodendrocytes', 'Oligodendrocyte Precursor cells']]
          },
        },
        {
          uid: 'frame-2c',
          title: 'Oligodendrocyte Subcluster Highlight — feature selection',
          text: 'The Oligodendrocyte subclusters is highlighted via feature selection.',
          shapes: [
            {
              uid: 'scatterplot-arrow-1',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 69.0170, y1: -15.3467,
              x2: 75.4611, y2: -7.3000,
              markerStart: 'Arrow',
              strokeColor: [0, 255, 251],
              strokeWidth: 4,
              text: 'COP',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-2',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 19.61, y1: -12.66,
              x2: 23.91, y2: -5.42,
              markerStart: 'Arrow',
              strokeColor: [255, 0, 157],
              strokeWidth: 4,
              text: 'Precursor Cells',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-3',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 33.57, y1: -33.58,
              x2: 43.24, y2: -41.36,
              markerStart: 'Arrow',
              strokeColor: [255, 222, 0],
              strokeWidth: 4,
              text: 'NF',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-4',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: 33.07, y1: -63.31,
              x2: 50.39, y2: -62.81,
              markerStart: 'Arrow',
              strokeColor: [0, 255,121],
              strokeWidth: 4,
              text: 'MF',
              textPosition: 'end',
            },
            {
              uid: 'scatterplot-arrow-5',
              type: 'line',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x1: -4.01, y1: -54.23,
              x2: -18.51, y2: -55.58,
              markerStart: 'Arrow',
              strokeColor: [255, 218, 0],
              strokeWidth: 4,
              text: 'Mature',
              textPosition: 'end',
            }
          ],
          viewStates: [
            {
              targetView: 'spatial',
              spatialZoom: -6.579,
              spatialTargetX: 14097.34,
              spatialTargetY: 26499.35,
              spatialImageLayer: [{ index: 0, visible: false }],
              spatialPointLayer: { visible: false, radius: 20, opacity: 1 }
            },
            {
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              embeddingZoom: 1.897,
              embeddingTargetX: 24.8486,
              embeddingTargetY: -40.8548,
            },
          ],
          viewState: { 
            obsColorEncoding: 'geneSelection',
            featureSelection: ['Plp1']
          },
        },
        // ── Frame 5 ─────────────────────────────────────────────────────────
        // Feature: all three views with shapes simultaneously in one frame.
        // Demonstrates that one frame can annotate spatial + t-SNE + PCA at once.
        {
          uid: 'frame-5',
          title: 'All Views Simultaneously — One Frame, Three Targets',
          text: 'A single annotation frame drives all three views at once. The yellow shapes appear in the spatial view, blue in t-SNE, and green in PCA. Each view renders only the shapes addressed to it.',
          shapes: [
            {
              uid: 'multi-spatial-rect',
              type: 'rectangle',
              targetView: 'spatial',
              x: 10000, y: 15000, width: 12000, height: 10000,
              strokeColor: [255, 200, 0],
              strokeWidth: 2,
            },
            {
              uid: 'multi-tsne-rect',
              type: 'rectangle',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 't-SNE' },
              x: -15, y: -8, width: 10, height: 8,
              strokeColor: [80, 200, 255],
              strokeWidth: 2,
              text: 't-SNE target',
            },
            {
              uid: 'multi-pca-rect',
              type: 'rectangle',
              targetView: 'scatterplot',
              targetCoordinationValues: { embeddingType: 'PCA' },
              x: -0.4, y: -0.2, width: 0.8, height: 0.5,
              strokeColor: [80, 255, 130],
              strokeWidth: 2,
              text: 'PCA target',
            },
          ],
          viewState: {
            // Medium zoom on tissue centre — clearly different from both the close-up
            // and the overview, so the animated transition is visible in both directions
            spatialZoom: -4.2,
            spatialTargetX: 16000,
            spatialTargetY: 20000,
            embeddingZoom: 1.2,
            embeddingTargetX: -10,
            embeddingTargetY: -4,
            obsColorEncoding: 'cellSetSelection',
            spatialImageLayer: [{ index: 0, visible: false }],
            spatialPointLayer: { visible: false, radius: 20, opacity: 1 }

          },
        },

        // ── Frame 6 ─────────────────────────────────────────────────────────
        // New shape types: ellipse, polygon, polyline
        {
          uid: 'frame-6',
          title: 'New Shape Types — Ellipse, Polygon, Polyline',
          text: 'Three additional OME-ROI shape types: an ellipse outlining a region of interest, a polygon tracing an irregular boundary, and a polyline path with an arrowhead.',
          shapes: [
            {
              uid: 'ellipse-1',
              type: 'ellipse',
              targetView: 'spatial',
              x1: 10323.79, y1: 41354.99,
              radiusX: 2000, radiusY: 1300,
              strokeColor: [255, 255, 255],
              strokeWidth: 4,
              text: 'Ellipse ROI',
            },
            {
              uid: 'polygon-1',
              type: 'polygon',
              targetView: 'spatial',
              points: [
                [14500, 18800],
                [15800, 18400],
                [16200, 19200],
                [15600, 20000],
                [14300, 19600],
              ],
              strokeColor: [100, 220, 255],
              strokeWidth: 4,
              text: 'Polygon region',
            },
            {
              uid: 'polyline-1',
              type: 'polyline',
              targetView: 'spatial',
              points: [
                [17200, 19000],
                [16800, 19800],
                [16400, 20400],
                [16000, 21000],
              ],
              strokeColor: [180, 120, 255],
              strokeWidth: 4,
              strokeDashArray: "10 4",
              markerEnd: 'Arrow',
              text: 'Polyline path',
            },
          ],
          viewState: {
            spatialZoom: -5.088,
            spatialTargetX: 7024.56,
            spatialTargetY: 42388.31,
            spatialImageLayer: [{ index: 0, visible: false }],
            spatialPointLayer: { visible: false, radius: 20, opacity: 1 }

          },
        },

        // ── Frame 7 ─────────────────────────────────────────────────────────
        // Narrative close — resets everything, no shapes.
        {
          uid: 'frame-7',
          title: 'End of Demo — All Features Shown',
          text: 'Features demonstrated: spatial shapes (rectangle, line, ellipse, polygon, polyline), scatterplot shapes (t-SNE and PCA), shape tethering via targetCoordinationValues, obsSetSelection, featureSelection, obsColorEncoding, and per-frame zoom/pan.',
          shapes: [],
          viewState: {
            spatialZoom: -5.5,
            spatialTargetX: 16000,
            spatialTargetY: 20000,
            embeddingZoom: 0.75,
            embeddingTargetX: 0,
            embeddingTargetY: 0,
            obsColorEncoding: 'cellSetSelection',
            spatialImageLayer: [{ index: 0, visible: false }],
            spatialPointLayer: { visible: false, radius: 20, opacity: 1 }
            // omitting obsSetSelection — leaves whatever is currently active unchanged
            // omitting featureSelection — leaves whatever is currently active unchanged
          },
        },
      ],
    },
  },
  layout: [
    {
      component: 'layerController',
      props: { globalDisable3d: true, disableChannelsIfRgbDetected: true },
      x: 0, y: 0, w: 2, h: 2,       // compressed h:4 → h:2
    },
    {
      component: 'annotationController',
      coordinationScopes: {
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
        annotationDescription: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        embeddingZoom: 'TSNE',         // drives t-SNE zoom; PCA zoom is independent
        embeddingTargetX: 'TSNE',
        embeddingTargetY: 'TSNE',
      },
      x: 0, y: 2, w: 2, h: 4,
    },
    {
      component: 'spatial',
      props: { coordinatesVisible: true, logClickCoords: true },
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
      },
      x: 2, y: 0, w: 4, h: 4,
    },
    {
      component: 'genes',
      x: 9, y: 0, w: 3, h: 2,
    },
    {
      component: 'cellSets',
      x: 9, y: 3, w: 3, h: 2,
    },
    {
      component: 'heatmap',
      props: { transpose: true },
      x: 2, y: 4, w: 5, h: 2,
    },
    {
      component: 'cellSetExpression',
      x: 7, y: 4, w: 5, h: 2,
    },
    {
      component: 'scatterplot',
      props: { coordinatesVisible: true, logClickCoords: true },
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
      },
      x: 6, y: 0, w: 3, h: 2,
    },
    {
      component: 'scatterplot',
      props: { coordinatesVisible: true, logClickCoords: true },
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
        embeddingTargetX: 'TSNE',
        embeddingTargetY: 'TSNE',
        annotationFrames: 'A',
        annotationFrameIndex: 'A',
        annotationOverlayVisible: 'A',
      },
      x: 6, y: 2, w: 3, h: 2,
    },
  ],
};
