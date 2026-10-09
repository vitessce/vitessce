/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

const ZOOM = 5; // zoomed view shows ZOOM× the primary's magnification

const INITIAL_CAMERA = {
  position: [2768719.75, 1295911.625, 5205.9638671875],
  projectionScale: 864615,
  projectionOrientation: [1, 0, 0, 0],
};

function generateNeuroglancerInterscellarDetailConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'MIS-Interscellar',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_interscellarv2_interscellar_nuclei_excluded_precomputed/',
    coordinationValues: {
      fileUid: 'interscellar-meshes',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/melanoma_with_embedding_red.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Clusters',
          column: 'cluster',
        },
      ],
    },
  });

  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: INITIAL_CAMERA,
  });

  const neuroglancerZoomView = config.addView(dataset, 'neuroglancer').setProps({
    title: `Spatial Zoomed (${ZOOM}×)`,
    cameraZoomFactor: ZOOM,
    initialNgCameraState: {
      ...INITIAL_CAMERA,
      projectionScale: INITIAL_CAMERA.projectionScale / ZOOM,
    },
  });

  config.linkViews(
    [neuroglancerView, neuroglancerZoomView],
    ['spatialCameraSnapshot'],
    [null],
  );

  config.linkViewsByObject([neuroglancerView, neuroglancerZoomView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'interscellar-meshes',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(
    neuroglancerView,
    neuroglancerZoomView,
    vconcat(lcView, obsSets),
  ));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerInterscellarDetail = generateNeuroglancerInterscellarDetailConfiguration();
