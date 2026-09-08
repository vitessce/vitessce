/* eslint-disable max-len */
import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat,
    vconcat,
    getInitialCoordinationScopePrefix,
  } from '@vitessce/config';
  import { makeIdsCsvDataUrl, makeColorsCsvDataUrl } from '../../utils.js';
  
  function generateNeuroglancerTestCubeConfiguration() {
    const config = new VitessceConfig({
      schemaVersion: '1.0.16',
      name: 'Test Cube',
    });
  
    const dataset = config.addDataset('Test cube dataset').addFile({
      fileType: 'image.ome-tiff',
      url: 'http://localhost:9001/data/test_cube.ome.tiff',
      // no offsetsUrl: confirmed optional in OmeTiffLoader.loadOffsets(),
      // falls back to null and viv.loadOmeTiff still works without it.
      coordinationValues: {
        fileUid: 'test-cube-image',
      },
    });
  
    dataset.addFile({
      fileType: 'obsSegmentations.ng-precomputed',
      url: 'http://localhost:9001/out/test_cube_precomputed',
      coordinationValues: {
        fileUid: 'test-cube-meshes',
      },
    });
  
    // ids of the segments to show/color: corners 1-8 + axis rods 9-11
    // (see make_test_cube.py)
    dataset.addFile({
      fileType: 'obsFeatureMatrix.csv',
      url: makeIdsCsvDataUrl([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
      coordinationValues: {
        obsType: 'cell',
        featureType: 'feature',
        featureValueType: 'value',
      },
    });
  
    // per-segment colors, matching the RGB-cube-corner scheme from make_test_cube.py
    dataset.addFile({
      fileType: 'obsColors.csv',
      url: makeColorsCsvDataUrl({
        1: '#000000',
        2: '#ff0000',
        3: '#00ff00',
        4: '#0000ff',
        5: '#ffff00',
        6: '#ff00ff',
        7: '#00ffff',
        8: '#ffffff',
        9: '#ff0000',
        10: '#00ff00',
        11: '#0000ff',
      }),
      options: {
        obsIndex: 'id',
        obsColors: 'color',
      },
      coordinationValues: {
        obsType: 'cell',
      },
    });
  
    const spatialThreeView = config.addView(dataset, 'spatialBeta');
    const lcView = config.addView(dataset, 'layerControllerBeta').setProps({
      cameraPresets: [
        // rough starting point: center of the 80x64x48 volume.
        // adjust once you see the actual render.
        {
          spatialZoom: -3,
          spatialTargetX: 40,
          spatialTargetY: 32,
          spatialRotationX: 0,
          spatialRotationOrbit: 0,
        },
      ],
    });
  
    const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
      // placeholder starting values -- pull the real ones from
      // viewer.state.position / .projection_orientation / .projection_scale
      // in your working raw-Neuroglancer session and replace these.
      initialNgCameraState: {
        position: [40000, 32000, 24000],
        projectionScale: 90000, // roughly the largest dimension, with some margin, to frame the whole cube
        projectionOrientation: [0, 0, 0, 1],
      },
    });
  
    // Sync zoom/rotation/pan across all three views
    config.linkViewsByObject([spatialThreeView, lcView, neuroglancerView], {
      spatialRenderingMode: '3D',
      spatialZoom: 0,
      spatialTargetT: 0,
      spatialTargetX: 0,
      spatialTargetY: 0,
      spatialTargetZ: 0,
      spatialRotationX: 0,
      spatialRotationY: 0,
      spatialRotationOrbit: 0,
    }, { meta: false });
  
    // Image layer (spatialBeta + layer controller)
    config.linkViewsByObject([spatialThreeView, lcView], {
      imageLayer: CL([
        {
          fileUid: 'test-cube-image',
          spatialLayerOpacity: 1,
          spatialTargetResolution: null,
          imageChannel: CL([
            {
              spatialTargetC: 0,
              spatialChannelColor: [255, 255, 255],
              spatialChannelVisible: true,
              spatialChannelOpacity: 1.0,
            },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  
    // Segmentation/mesh layer (neuroglancer + layer controller)
    // obsColorEncoding: 'obsColors' is what actually wires up per-segment
    // coloring from the obsFeatureMatrix ids + obsColors color map above.
    config.linkViewsByObject([neuroglancerView, lcView], {
      segmentationLayer: CL([
        {
          fileUid: 'test-cube-meshes',
          spatialLayerOpacity: 1,
          spatialTargetResolution: null,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              obsType: 'cell',
              featureType: 'feature',
              featureValueType: 'value',
              spatialChannelVisible: true,
              obsColorEncoding: 'obsColors',
            },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });
  
    config.layout(hconcat(neuroglancerView, spatialThreeView, lcView));
  
    const configJSON = config.toJSON();
    return configJSON;
  }
  
  export const testCubeNeuroglancer = generateNeuroglancerTestCubeConfiguration();