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
        7.5
      ],
      projectionScale: 14247.862632462655,
      projectionOrientation: [
        0.011544201523065567,
​        0.018694978207349777,
        0.01379409246146679,
        0.9996634721755981
      ],
    },
    coordinationValues: {
      fileUid: 'merfish-meshes',
      obsType: 'cell',
    },
  });
  
  if(withPoints) {
    dataset.addFile({
      fileType: 'obsPoints.ng-annotations',
      url: pointsUrl,
      coordinationValues: {
        fileUid: 'merfish-points',
        obsType: 'point',
      },
    });
  }

  dataset.addFile({
    fileType: 'spatialdata.zarr',
    url: sdataUrl,
      options: {
        obsFeatureMatrix: {
          path: 'tables/gene_expression_baysor/X'
        },
        obsSets: {
          tablePath: 'tables/gene_expression_baysor',
          obsSets: [
            {
              name: 'Region',
              path: 'tables/gene_expression_baysor/obs/region',
            },
          ],
        }
      },
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene'
      },
  });

  // TODO: include anndata or spatialdata object for sets, expression matrix, etc.
  // The geneList relies on obsFeatureMatrix.featureIndex to show the list of genes.
  
  const neuroglancerView = config.addView(dataset, 'neuroglancer');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const geneList = config.addView(dataset, 'featureList');
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

    // TODO: add coordination stuff for segmentationLayer and pointLayer,
    // so that their neuroglancer visualizations can be controlled from the layer controller.


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

  if(withPoints) {
    config.linkViewsByObject([neuroglancerView, lcView], {
      pointLayer: CL([
        {
          fileUid: 'merfish-points',
          obsType: 'point',
          spatialLayerOpacity: 1,
          spatialLayerVisible: true,
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });
  }


  config.layout(hconcat(neuroglancerView, vconcat(lcView, geneList, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerMerfish = generateNeuroglancerMerfish();
