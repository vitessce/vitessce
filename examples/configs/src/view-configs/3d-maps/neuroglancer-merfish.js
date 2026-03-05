import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerMerfish() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'MERFISH mouse ileum dataset',
  });

  const segmentationsUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse';
  const pointsUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse/molecule_baysor2';
  const sdataUrl = 'https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr';

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
      dimensionX: 1,
      dimensionY: 1,
      dimensionZ: 1,
      dimensionUnit: 'nm',
      position: [
        3630.5,
        4469.5,
        7.5,
      ],
      projectionScale: 14247.862632462655,
      projectionOrientation: [
        0.011544201523065567,
        0.018694978207349777,
        0.01379409246146679,
        0.9996634721755981,
      ],
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
        path: 'tables/gene_expression_baysor/X',
      },
      obsSets: {
        tablePath: 'tables/gene_expression_baysor',
        obsSets: [
          {
            name: 'Region',
            path: 'tables/gene_expression_baysor/obs/region',
          },
        ],
      },
    },
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const geneList = config.addView(dataset, 'featureList').setProps({ enableMultiSelect: true });
  const obsSets = config.addView(dataset, 'obsSets');

  config.linkViewsByObject([neuroglancerView, lcView], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationZ: 0,
    spatialRotationOrbit: 0,
  }, { meta: false });

  config.linkViewsByObject([neuroglancerView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'merfish-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
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
          featureColor: [
            { name: 'Ada', color: [255, 0, 0] },
          ],
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });
  }

  config.layout(hconcat(neuroglancerView, vconcat(lcView, geneList, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerMerfish = generateNeuroglancerMerfish();
