export const multimodalIms = {
  version: '1.0.16',
  uid: '3D Human Liver with annotations',
  name: '3D Human Liver with annotations',
  description: '',
  datasets: [
    {
      uid: 'human-liver-annot',
      name: 'Human dataset',
      files: [
        {
          fileType: 'image.ome-tiff',
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_3d.raster.pyramid.ome.tiff',
        },
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.cell_ids.ome.tiff',
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            obsType: 'cell',
          },
          fileType: 'obsLocations.anndata.zarr',
          options: {
            path: 'obsm/X_spatial',
          },
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'Lipid/metabolite-based t-SNE',
          },
          fileType: 'obsEmbedding.anndata.zarr',
          options: {
            path: 'obsm/X_lipmet_tsne',
            dims: [
              0,
              1,
            ],
          },
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'Protein-based t-SNE',
          },
          fileType: 'obsEmbedding.anndata.zarr',
          options: {
            path: 'obsm/X_protein_tsne',
            dims: [
              0,
              1,
            ],
          },
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            obsType: 'cell',
          },
          fileType: 'obsSets.anndata.zarr',
          options: [
            {
              name: 'Protein-based Clustering',
              path: 'obs/Protein Cluster',
            },
            {
              name: 'Lipid/metabolite-based Clustering',
              path: 'obs/Lipmet Cluster',
            },
          ],
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            featureType: 'gene',
          },
          fileType: 'featureLabels.anndata.zarr',
          options: {
            path: 'var/feature_name',
          },
        },
        {
          url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_topslice.h5ad.zarr',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
          fileType: 'obsFeatureMatrix.anndata.zarr',
          options: {
            path: 'layers/X_uint8',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingType: {
      A: 'Protein-based t-SNE',
      B: 'Lipid/metabolite-based t-SNE',
    },
    spatialZoom: {
      A: 0.08141200284207345,
    },
    spatialRotation: {
      A: 0,
    },
    spatialTargetX: {
      A: 381.0184496615211,
    },
    spatialTargetY: {
      A: 276.6896972690149,
    },
    spatialTargetZ: {
      A: 4.547936835999162,
    },
    spatialRotationX: {
      A: -48.676249232587914,
    },
    spatialRotationY: {
      A: null,
    },
    spatialRotationZ: {
      A: null,
    },
    spatialRotationOrbit: {
      A: 9.08653846153846,
    },
    spatialOrbitAxis: {
      A: null,
    },
    spatialAxisFixed: {
      A: false,
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
          use3d: true,
          channels: [
            {
              selection: {
                c: 0,
                t: 0,
                z: 3,
              },
              color: [
                0,
                0,
                255,
              ],
              visible: true,
              slider: [
                0.6880088102817535,
                1.5707963705062866,
              ],
            },
            {
              selection: {
                c: 1,
                t: 0,
                z: 3,
              },
              color: [
                0,
                255,
                0,
              ],
              visible: true,
              slider: [
                0.7414158868789673,
                1.5707963705062866,
              ],
            },
            {
              selection: {
                c: 2,
                t: 0,
                z: 3,
              },
              color: [
                255,
                0,
                255,
              ],
              visible: true,
              slider: [
                0.7131415522098541,
                1.5707963705062866,
              ],
            },
            {
              selection: {
                c: 3,
                t: 0,
                z: 3,
              },
              color: [
                255,
                255,
                0,
              ],
              visible: true,
              slider: [
                0.7885397779941559,
                1.5707963705062866,
              ],
            },
          ],
          modelMatrix: [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
          ],
          resolution: 1,
          xSlice: [
            0,
            768,
          ],
          ySlice: [
            0,
            768,
          ],
          zSlice: [
            0,
            21.875,
          ],
        },
      ],
    },
    spatialSegmentationLayer: {
      A: [
        {
          channels: [
            {
              color: [
                255,
                255,
                255,
              ],
              selection: {
                c: 0,
                t: 0,
                z: 0,
              },
              slider: [
                2,
                1998,
              ],
              visible: true,
            },
          ],
          colormap: null,
          transparentColor: [
            0,
            0,
            0,
          ],
          index: 0,
          opacity: 1,
          domainType: 'Min/Max',
          renderingMode: 'Additive',
          type: 'bitmask',
          use3d: false,
          visible: false,
        },
      ],
    },
    dataset: {
      A: 'human-liver-annot',
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
    obsLabelsType: {
      A: null,
    },
    embeddingZoom: {
      A: 2.1466186584355342,
      B: 2.7383369448841672,
    },
    embeddingRotation: {
      A: 0,
    },
    embeddingTargetX: {
      A: 2.4664840698242188,
      B: -1.2845678329467773,
    },
    embeddingTargetY: {
      A: 13.279134750366211,
      B: -9.776981353759766,
    },
    embeddingTargetZ: {
      A: 0,
      B: 0,
    },
    embeddingObsSetPolygonsVisible: {
      A: false,
      B: false,
    },
    embeddingObsSetLabelsVisible: {
      A: false,
      B: false,
    },
    embeddingObsSetLabelSize: {
      A: 14,
      B: 14,
    },
    embeddingObsRadius: {
      A: 1,
      B: 1,
    },
    embeddingObsOpacity: {
      A: 1,
      B: 1,
    },
    embeddingObsRadiusMode: {
      A: 'auto',
    },
    embeddingObsOpacityMode: {
      A: 'auto',
    },
    spatialNeighborhoodLayer: {
      A: null,
    },
    spatialPointLayer: {
      A: null,
    },
    heatmapZoomX: {
      A: 0,
    },
    heatmapZoomY: {
      A: 0,
    },
    heatmapTargetX: {
      A: 0,
    },
    heatmapTargetY: {
      A: 0,
    },
    obsFilter: {
      A: null,
    },
    obsHighlight: {
      A: '1589',
    },
    obsSetSelection: {
      A: [
        [
          'Protein-based Clustering',
          '0',
        ],
        [
          'Protein-based Clustering',
          '1',
        ],
        [
          'Protein-based Clustering',
          '2',
        ],
        [
          'Protein-based Clustering',
          '3',
        ],
        [
          'Protein-based Clustering',
          '4',
        ],
        [
          'Protein-based Clustering',
          '5',
        ],
        [
          'Protein-based Clustering',
          '6',
        ],
        [
          'Protein-based Clustering',
          '7',
        ],
      ],
    },
    obsSetExpansion: {
      A: [],
    },
    obsSetHighlight: {
      A: null,
    },
    obsSetColor: {
      A: [
        {
          path: [
            'Protein-based Clustering',
          ],
          color: [
            68,
            119,
            170,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '0',
          ],
          color: [
            68,
            119,
            170,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '1',
          ],
          color: [
            136,
            204,
            238,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '2',
          ],
          color: [
            68,
            170,
            153,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '3',
          ],
          color: [
            17,
            119,
            51,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '4',
          ],
          color: [
            153,
            153,
            51,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '5',
          ],
          color: [
            221,
            204,
            119,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '6',
          ],
          color: [
            204,
            102,
            119,
          ],
        },
        {
          path: [
            'Protein-based Clustering',
            '7',
          ],
          color: [
            136,
            34,
            85,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
          ],
          color: [
            68,
            119,
            170,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '0',
          ],
          color: [
            68,
            119,
            170,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '1',
          ],
          color: [
            136,
            204,
            238,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '2',
          ],
          color: [
            68,
            170,
            153,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '3',
          ],
          color: [
            17,
            119,
            51,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '4',
          ],
          color: [
            153,
            153,
            51,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '5',
          ],
          color: [
            221,
            204,
            119,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '6',
          ],
          color: [
            204,
            102,
            119,
          ],
        },
        {
          path: [
            'Lipid/metabolite-based Clustering',
            '7',
          ],
          color: [
            136,
            34,
            85,
          ],
        },
      ],
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
    },
    featureFilter: {
      A: null,
    },
    featureHighlight: {
      A: null,
    },
    featureSelection: {
      A: null,
    },
    tooltipsVisible: {
      A: true,
    },
    featureValueColormap: {
      A: 'plasma',
    },
    featureValueColormapRange: {
      A: [
        0,
        1,
      ],
    },
    additionalObsSets: {
      A: null,
    },
    moleculeHighlight: {
      A: null,
    },
  },
  layout: [
    {
      component: 'spatial',
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      coordinationScopes: {
        spatialAxisFixed: 'A',
        spatialOrbitAxis: 'A',
        spatialRotation: 'A',
        spatialRotationOrbit: 'A',
        spatialRotationX: 'A',
        spatialRotationY: 'A',
        spatialRotationZ: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialTargetZ: 'A',
        spatialZoom: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsLabelsType: 'A',
        spatialNeighborhoodLayer: 'A',
        spatialPointLayer: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetSelection: 'A',
        obsSetHighlight: 'A',
        obsSetColor: 'A',
        obsColorEncoding: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        tooltipsVisible: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        additionalObsSets: 'A',
        moleculeHighlight: 'A',
      },
      uid: 'A',
    },
    {
      component: 'layerController',
      x: 6,
      y: 0,
      w: 2,
      h: 6,
      coordinationScopes: {
        spatialAxisFixed: 'A',
        spatialOrbitAxis: 'A',
        spatialRotation: 'A',
        spatialRotationOrbit: 'A',
        spatialRotationX: 'A',
        spatialRotationY: 'A',
        spatialRotationZ: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialTargetZ: 'A',
        spatialZoom: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        spatialNeighborhoodLayer: 'A',
        spatialPointLayer: 'A',
      },
      uid: 'B',
    },
    {
      component: 'heatmap',
      props: {
        transpose: true,
        variablesLabelOverride: 'feature',
      },
      x: 0,
      y: 6,
      w: 6,
      h: 6,
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsLabelsType: 'A',
        heatmapZoomX: 'A',
        heatmapZoomY: 'A',
        heatmapTargetX: 'A',
        heatmapTargetY: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetSelection: 'A',
        obsSetHighlight: 'A',
        obsSetColor: 'A',
        obsColorEncoding: 'A',
        featureFilter: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        tooltipsVisible: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        additionalObsSets: 'A',
      },
      uid: 'C',
    },
    {
      component: 'obsSets',
      x: 10,
      y: 0,
      w: 2,
      h: 6,
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        obsSetSelection: 'A',
        obsSetExpansion: 'A',
        obsSetHighlight: 'A',
        obsSetColor: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
        additionalObsSets: 'A',
      },
      uid: 'D',
    },
    {
      component: 'featureList',
      props: {
        variablesLabelOverride: 'feature',
      },
      x: 8,
      y: 0,
      w: 2,
      h: 6,
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsSetSelection: 'A',
        obsColorEncoding: 'A',
        featureFilter: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
      },
      uid: 'E',
    },
    {
      component: 'scatterplot',
      x: 6,
      y: 6,
      w: 3,
      h: 6,
      coordinationScopes: {
        embeddingType: 'A',
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsLabelsType: 'A',
        embeddingZoom: 'A',
        embeddingRotation: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingTargetZ: 'A',
        embeddingObsSetPolygonsVisible: 'A',
        embeddingObsSetLabelsVisible: 'A',
        embeddingObsSetLabelSize: 'A',
        embeddingObsRadius: 'A',
        embeddingObsOpacity: 'A',
        embeddingObsRadiusMode: 'A',
        embeddingObsOpacityMode: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetSelection: 'A',
        obsSetHighlight: 'A',
        obsSetColor: 'A',
        obsColorEncoding: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        tooltipsVisible: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        additionalObsSets: 'A',
      },
      uid: 'F',
    },
    {
      component: 'scatterplot',
      x: 9,
      y: 6,
      w: 3,
      h: 6,
      coordinationScopes: {
        embeddingType: 'B',
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsLabelsType: 'A',
        embeddingZoom: 'B',
        embeddingRotation: 'A',
        embeddingTargetX: 'B',
        embeddingTargetY: 'B',
        embeddingTargetZ: 'B',
        embeddingObsSetPolygonsVisible: 'B',
        embeddingObsSetLabelsVisible: 'B',
        embeddingObsSetLabelSize: 'B',
        embeddingObsRadius: 'B',
        embeddingObsOpacity: 'B',
        embeddingObsRadiusMode: 'A',
        embeddingObsOpacityMode: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetSelection: 'A',
        obsSetHighlight: 'A',
        obsSetColor: 'A',
        obsColorEncoding: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        tooltipsVisible: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        additionalObsSets: 'A',
      },
      uid: 'G',
    },
  ],
  initStrategy: 'auto',
};
