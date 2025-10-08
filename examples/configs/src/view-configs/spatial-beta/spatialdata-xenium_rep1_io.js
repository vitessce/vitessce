import {
  VitessceConfig,
  hconcat,
  CoordinationLevel as CL,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

const sdataUrl = 'https://data-2.vitessce.io/sdata-xenium/xenium_rep1_io.spatialdata.zarr';

function generateXeniumConfig() {
  const vc = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'SpatialData with Xenium data',
  });

  const withPoints = true;
  const withImages = true;
  const withPolygons = true;

  let dataset = vc.addDataset('My dataset')
  
  if(withImages) {
    dataset = dataset.addFile({
        fileType: 'spatialdata.zarr',
        url: sdataUrl,
        options: {
          image: {
            path: 'images/morphology_focus',
          },
          coordinateSystem: 'global',
        },
        coordinationValues: {
          fileUid: 'morphology_focus',
        },
      }).addFile({
        fileType: 'spatialdata.zarr',
        url: sdataUrl,
        options: {
          image: {
            path: 'images/morphology_mip',
          },
          coordinateSystem: 'global',
        },
        coordinationValues: {
          fileUid: 'morphology_mip',
        },
      });
    }
    
    if(withPolygons) {
      dataset = dataset.addFile({
        fileType: 'spatialdata.zarr',
        url: sdataUrl,
        options: {
          obsFeatureMatrix: {
              path: 'tables/dense_table/X',
          },
          obsSegmentations: {
            path: 'shapes/cell_boundaries',
          },
          coordinateSystem: 'global',
        },
        coordinationValues: {
          obsType: 'cell',
        },
      });
    }
    if(withPoints) {
      dataset = dataset.addFile({
        fileType: 'spatialdata.zarr',
        url: sdataUrl,
        options: {
          obsPoints: {
            path: 'points/transcripts_with_morton_codes',
          },
          coordinateSystem: 'global',
        },
        coordinationValues: {
          obsType: 'point',
        },
      });
    }


  const spatialView = vc.addView(dataset, 'spatialBeta', { x: 0, y: 0, w: 8, h: 12 });
  const lcView = vc.addView(dataset, 'layerControllerBeta', { x: 8, y: 0, w: 4, h: 6 });
  const geneList = vc.addView(dataset, 'featureList', { x: 8, y: 6, w: 4, h: 6 });

  if(withImages) {
    vc.linkViewsByObject([spatialView, lcView], {
      imageLayer: CL([
        {
          fileUid: 'morphology_focus',
          photometricInterpretation: 'BlackIsZero',
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          imageChannel: CL([
            {
              spatialChannelVisible: true,
              spatialTargetC: 0,
              spatialChannelColor: [255, 255, 255],
              spatialChannelOpacity: 1.0,
            },
          ]),
        },
        /*
        {
          fileUid: 'morphology_mip',
          photometricInterpretation: 'BlackIsZero',
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          imageChannel: CL([
            {
              spatialChannelVisible: true,
              spatialTargetC: 0,
              spatialChannelColor: [0, 255, 0],
              spatialChannelOpacity: 1.0,
            },
          ]),
        },
        */
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  }

  if(withPolygons) {
    vc.linkViewsByObject([spatialView, lcView], {
      segmentationLayer: CL([
        {
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              spatialChannelVisible: true,
              spatialChannelOpacity: 0.5,
              obsType: 'cell',
              obsHighlight: null,
              spatialChannelColor: [200, 200, 200],
              obsColorEncoding: 'spatialChannelColor',
              spatialSegmentationFilled: false,
              spatialSegmentationStrokeWidth: 10,
            },
          ]),
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });
  }

  if(withPoints) {
    vc.linkViewsByObject([spatialView, lcView], {
      spatialTargetZ: null,
      pointLayer: CL([
        {
          obsType: 'point',
          obsHighlight: null,
        },
      ]),
    }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });
  }

  //vc.layout(hconcat(spatialView, lcView));
  const configJSON = vc.toJSON();
  return configJSON;
}

export const sdataXeniumConfig = generateXeniumConfig();
