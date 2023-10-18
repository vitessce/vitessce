/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

function generatePointCloudConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Point cloud',
  });
  const dataset = config.addDataset('Point cloud').addFile({
    fileType: 'points.zarr',
    url: 'http://localhost:8000/data/out.zarr',
    coordinationValues: {
      obsType: 'molecule',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });

  const [
    obsSetColorScope,
    obsSetSelectionScope,
    additionalObsSetsScope,
  ] = config.addCoordination('obsSetColor', 'obsSetSelection', 'additionalObsSets');

  const scopes = config.addCoordinationByObject({
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'cell',
    pointLayer: CL({
      obsType: 'molecule',
      spatialLayerVisible: false,
      spatialLayerOpacity: 0.5,
      spatialLayerColor: [0, 255, 0],
      obsColorEncoding: 'obsLabels',
      obsHighlight: null,
      obsLabelsType: 'gene',
    }),
  });

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useCoordinationByObject(scopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const spatialView2 = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  spatialView2.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.linkViews([obsSets, featureList], ['obsType'], ['cell']);

  obsSets.useCoordination(obsSetColorScope, obsSetSelectionScope, additionalObsSetsScope);

  config.layout(hconcat(spatialViewSimple, spatialView2, vconcat(lcViewSimple, obsSets, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const pointCloudOop = generatePointCloudConfig();
