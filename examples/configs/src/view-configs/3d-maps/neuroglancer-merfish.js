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

  const dataset = config.addDataset('My dataset');

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: segmentationsUrl,
    options: {
      dimensionX: 0.000001,
      dimensionY: 0.000001,
      dimensionZ: 0.000013768,
      dimensionUnit: 'm',
      position: [
        3630.5,
        4469.5,
        0.5
      ],
      projectionScale: 14247.862632462655,
      projectionOrientation: [
        0.011592172086238861,
        -0.011224723421037197,
        0.00132170005235821,
        -0.9998689293861389,
      ],
    },
    coordinationValues: {
      fileUid: 'merfish-meshes',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: pointsUrl,
    coordinationValues: {
      fileUid: 'merfish-points',
      obsType: 'point',
    },
  });

  // TODO: include anndata or spatialdata object for sets, expression matrix, etc.
  
  const neuroglancerView = config.addView(dataset, 'neuroglancer');
  const lcView = config.addView(dataset, 'layerControllerBeta');

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
            obsColorEncoding: 'spatialChannelColor',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([neuroglancerView, lcView], {
    pointLayer: CL([
      {
        fileUid: 'merfish-points',
        obsType: 'point',
        spatialLayerOpacity: 1,
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });


  config.layout(hconcat(neuroglancerView, lcView));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerMerfish = generateNeuroglancerMerfish();
