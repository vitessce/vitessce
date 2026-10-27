/* eslint-disable max-len */
import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat,
    vconcat,
    getInitialCoordinationScopePrefix,
  } from '@vitessce/config';
  
  function generateNeuroglancerWashUKidneyConfig() {
    const config = new VitessceConfig({
      schemaVersion: '1.0.16',
      name: 'Melanoma',
    });
  
    const dataset = config.addDataset('My dataset');
      dataset.addFile({
        fileType: 'image.ome-tiff',
        url: 'https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
        options: {
          offsetsUrl: "https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json",
        },
        coordinationValues: {
          fileUid: 'preview-kidney',
        },
      });
      s3://vitessce-data-v2/data/washu-kidney/tissue_maps/sep-2026-conversions/20_5_gloms_precomputed/
    
    dataset.addFile({
      fileType: 'obsSegmentations.ng-precomputed',
      // sharded version -- use when support is added
      // url: 'https://data-2.vitessce.io/data/sanjay/20x/gloms/',
      url: 'https://data-2.vitessce.io/data/washu-kidney/tissue_maps/sep-2026-conversions/20_5_gloms_precomputed',
      coordinationValues: {
        fileUid: 'gloms',
        obsType: 'glom',
      },
    });
  
    dataset.addFile({
      fileType: 'obsSegmentations.ng-precomputed',
      // sharded version -- use when support is added
      // url: 'https://data-2.vitessce.io/data/sanjay/20x/nerves/',
      url: 'https://data-2.vitessce.io/data/washu-kidney/tissue_maps/sep-2026-conversions/20_5_nerves_precomputed',
      coordinationValues: {
        fileUid: 'nerves',
        obsType: 'nerve',
      },
    });
  
    dataset.addFile({
      fileType: 'obsSets.csv',
      url: 'https://data-2.vitessce.io/data/washu-kidney/tissue_maps/sep-2026-conversions/20x5_ids/gloms_ids.csv',
      coordinationValues: {
        obsType: 'glom',
      },
      options: {
        obsIndex: 'id',
        obsSets: [
          {
            name: 'Glom',
            column: 'id',
          },
  
        ],
      },
    });
  
    dataset.addFile({
      fileType: 'obsSets.csv',
      url: 'https://data-2.vitessce.io/data/washu-kidney/tissue_maps/sep-2026-conversions/20x5_ids/nerves_ids.csv',
      coordinationValues: {
        obsType: 'nerve',
      },
      options: {
        obsIndex: 'id',
        obsSets: [
          {
            name: 'Nerve',
            column: 'id',
          },
  
        ],
      },
    });
  
  
    const nerveSets = config.addView(dataset, 'obsSets');
    const glomSets = config.addView(dataset, 'obsSets');
    const layerController = config.addView(dataset, 'layerControllerBeta').setProps({ forceEnable3d: true });
    const spatialView = config.addView(dataset, 'spatialBeta');
    const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
      initialNgCameraState: {
        position: [424553, 423639, 496523],
        projectionScale: 2526713,
      },
    });
  
    const [
      nerveSetSelectionScope,
      glomSetSelectionScope,
      nerveSetColor,
      glomSetColor,
    ] = config.addCoordination(
      'obsSetSelection',
      'obsSetSelection',
      'obsSetColor',
      'obsSetColor',
    );
  
    config.linkViewsByObject([neuroglancerView, spatialView, layerController], {
      spatialRenderingMode: '3D',
    }, { meta: false });
  
    config.linkViewsByObject([neuroglancerView, layerController], {
      segmentationLayer: CL([
        {
          fileUid: 'gloms',
          spatialLayerOpacity: 1,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              obsType: 'glom',
              spatialChannelVisible: true,
              obsHighlight: null,
              spatialChannelColor: [136, 204, 238],
              obsColorEncoding: 'spatialChannelColor',
              obsSetSelection: glomSetSelectionScope,
              obsSetColor: glomSetColor,
            },
          ]),
        },
        {
          fileUid: 'nerves',
          spatialLayerOpacity: 1,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              obsType: 'nerve',
              spatialChannelVisible: true,
              obsHighlight: null,
              spatialChannelColor: [255, 255, 238],
              obsColorEncoding: 'spatialChannelColor',
              obsSetSelection: nerveSetSelectionScope,
              obsSetColor: nerveSetColor,
            },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });
  
    config.linkViewsByObject([glomSets], {
      obsType: 'glom',
      obsSetSelection: glomSetSelectionScope,
      obsSetColor: glomSetColor,
    }, { meta: false });
  
    config.linkViewsByObject([nerveSets], {
      obsType: 'nerve',
      obsSetSelection: nerveSetSelectionScope,
      obsSetColor: nerveSetColor,
    }, { meta: false });
  
    config.linkViewsByObject([spatialView, layerController], {
      imageLayer: CL([
        {
          fileUid: 'preview-kidney',
          spatialLayerOpacity: 1,
          spatialTargetResolution: null,
          imageChannel: CL([
            {
              spatialTargetC: 0,
              spatialChannelColor: [221, 52, 151],
              spatialChannelVisible: true,
              spatialChannelOpacity: 1.0,
              spatialChannelWindow: [773, 7733],
            },
              {
                spatialTargetC: 1,
                spatialChannelColor: [30, 143, 189],
                spatialChannelVisible: true,
                spatialChannelOpacity: 1.0,
                spatialChannelWindow: [2290, 6724],
              },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
    config.layout(hconcat(neuroglancerView, spatialView, vconcat(layerController, glomSets, nerveSets)));
  
    const configJSON = config.toJSON();
    return configJSON;
  }
  
  export const neuroglancerWashuKidney = generateNeuroglancerWashUKidneyConfig();
  