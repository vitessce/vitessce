/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerMerfish() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'MERFISH mouse ileum dataset',
  });

  const sdataUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr';
  const pointsUrl = 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/merfish_mouse_ileum_precomputed_all_prop/molecule_baysor';
  // const pointsUrl =  'https://data-2.vitessce.io/data/moffitt/merfish_mouse/molecule_baysor2';

  const segmentationsUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse';

  const withPoints = true;

  // Note: tissue-map-tools creates an AnnotationProperty for every column in the sdata Points element dask dataframe.
  // This means that we will need to read the parquet metadata of the corresponding Points element to determine which annotation properties are available.
  // For the featureKey specifically, we can just use the spatialdata_attrs (we do not need to look in the parquet file for this).
  // This is relevant to the shader generation code in shader-utils.js,
  // e.g., we cannot just assume that
  // Reference: https://github.com/hms-dbmi/tissue-map-tools/blob/6a904241436e946ffbadef24b780a33321754991/src/tissue_map_tools/converters.py#L295

  // https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr/points/molecule_baysor/points.parquet/part.0.parquet

  const dataset = config.addDataset('My dataset');

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: segmentationsUrl,
    options: {
      subsources: {
        default: true,
        bounds: false,
        mesh: true,
      },
      enableDefaultSubsources: false,
    },
    coordinationValues: {
      fileUid: 'merfish-meshes',
      obsType: 'cell',
    },
  });

  if (withPoints) {
    dataset.addFile({
      fileType: 'obsPoints.ng-annotations',
      url: pointsUrl,
      options: {
        projectionAnnotationSpacing: 2.4544585683772735,

        // Note: tissue-map-tools creates an AnnotationProperty
        // for every column in the sdata Points element dask dataframe.
        // Reference: https://github.com/hms-dbmi/tissue-map-tools/blob/6a904241436e946ffbadef24b780a33321754991/src/tissue_map_tools/converters.py#L295
        featureIndexProp: 'gene', // This corresponds to the prop_gene() in the Neuroglancer shader code.
        // TODO: update pointIndexProp to not be 'gene'. Need to find what other "prop"s are available in this file.
        pointIndexProp: 'gene', // This corresponds to the prop_point_id() in the Neuroglancer shader code.
      },
      coordinationValues: {
        fileUid: 'merfish-points',
        obsType: 'point',
        featureType: 'gene', // Important for correspondence with obsFeatureMatrix for the gene list.
      },
    });
  }

  // Include the corresponding spatialdata object for sets, expression matrix, etc.
  // The geneList relies on obsFeatureMatrix.featureIndex to show the list of genes.
  // The neuroglancer segmentation colors rely on obsSets to determine set membership and therefore coloring.
  dataset.addFile({
    fileType: 'spatialdata.zarr',
    url: sdataUrl,
    options: {
      obsFeatureMatrix: {
        path: 'tables/gene_expression_cellpose/layers/log_norm',
      },
      obsEmbedding: [
        { path: 'tables/gene_expression_cellpose/obsm/X_umap', embeddingType: 'UMAP' },
      ],
      obsSets: {
        tablePath: 'tables/gene_expression_cellpose',
        obsSets: [
          {
            name: 'Cell Types',
            path: 'tables/gene_expression_cellpose/obs/cluster',
          },
        ],
      },
    },
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer', { x: 0, y: 0, w: 5, h: 7 }).setProps({
    showAxisLines: true,
  });
  const umap = config.addView(dataset, 'scatterplot', { mapping: 'UMAP', x: 5, y: 0, w: 4, h: 7 });
  const lcView = config.addView(dataset, 'layerControllerBeta', { x: 9, y: 0, w: 3, h: 4 }).setProps({ layerPerFeatureForPoints: true });
  const geneList = config.addView(dataset, 'featureList', { x: 9, y: 4, w: 3, h: 3 }).setProps({ enableMultiSelect: true });
  const heatmap = config.addView(dataset, 'heatmap', { x: 0, y: 7, w: 6, h: 5 });
  const obsSets = config.addView(dataset, 'obsSets', { x: 6, y: 7, w: 3, h: 5 });
  const violin = config.addView(dataset, 'obsSetFeatureValueDistribution', { x: 9, y: 7, w: 3, h: 5 });

  config.linkViewsByObject([violin], { featureValueTransform: 'log1p' }, { meta: false });

  config.linkViewsByObject([neuroglancerView, lcView], {
    spatialRenderingMode: '3D',
    segmentationLayer: CL([
      {
        fileUid: 'merfish-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Meshes',
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            obsColorEncoding: 'cellSetSelection',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  if (withPoints) {
    config.linkViewsByObject([neuroglancerView, lcView], {
      pointLayer: CL([
        {
          fileUid: 'merfish-points',
          obsType: 'point',
          featureType: 'gene',
          spatialLayerOpacity: 1,
          spatialLayerVisible: true,
          obsColorEncoding: 'geneSelection',
          spatialLayerLabel: 'Transcripts',
          featureColor: [
            { name: 'Ada', color: [255, 0, 0] },
          ],
          spatialPointStrokeWidth: 0.0,
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });
  }

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerMerfish = generateNeuroglancerMerfish();
