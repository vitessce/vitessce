import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerCentroidsConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'Centroids demo',
  });

  const dataset = config.addDataset('My dataset');


  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'http://localhost:9004/ALL_cells_3D_precomputed/cells',
    //   options: {
    //     projectionAnnotationSpacing: 1,
    //   },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.anndata.zarr',
    url: 'http://localhost:9004/ALL_cells_3D_obs_sets.zarr',
    coordinationValues: { obsType: 'cell' },
    options: {
      obsSets: [
        { name: 'Section', path: 'obs/section' },
        { name: 'Region', path: 'obs/region' },
      ],
    },
  });


  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [3097.06640625, 3132.041259765625, 70],
      projectionScale: 7850,
    },
  });


  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  config.linkViewsByObject([layerController, neuroglancerView], {
    spatialRenderingMode: '3D',
  }, { meta: false });
  config.linkViewsByObject([neuroglancerView, layerController], {

    segmentationLayer: CL([
      {
        fileUid: 'inv-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelColor: [0, 114, 178],
            obsColorEncoding: 'cellSetSelection',
            spatialPointProjectionSpacing: 1,
            spatialPointStrokeWidth: 0.2,
            spatialPointRadius: 2.5,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const neuroglancerSkin = generateNeuroglancerCentroidsConfig();
