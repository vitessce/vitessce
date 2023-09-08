/* eslint-disable no-unused-vars */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Serve kpmp/OME-TIFF folder
const localBaseUrl = 'http://localhost:8000';
const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023';

function generateKpmpConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Multi-obsType segmentations',
    description: 'Example of coordinated opacity values for multiple segmentation types',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ome-tiff',
    url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.ome.tif`,
    options: {
      offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.offsets.json`,
    },
    coordinationValues: {
      fileUid: 'S-1905-017737',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.ome.tif`,
    options: {
      offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.offsets.json`,
    },
    coordinationValues: {
      fileUid: 'S-1905-017737_bf',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.anndata.zarr',
    url: `${baseUrl}/S-1905-017737/Cortical Interstitium.adata.zarr`,
    options: {
      path: 'X',
    },
    coordinationValues: {
      obsType: 'Cortical Interstitia',
      featureType: 'feature',
      featureValueType: 'value',
    },
  })
    .addFile({
      fileType: 'obsFeatureMatrix.anndata.zarr',
      url: `${baseUrl}/S-1905-017737/Glomeruli.adata.zarr`,
      options: {
        path: 'X',
      },
      coordinationValues: {
        obsType: 'Non-Globally Sclerotic Glomeruli',
        featureType: 'feature',
        featureValueType: 'value',
      },
    })
    .addFile({
      fileType: 'obsFeatureMatrix.anndata.zarr',
      url: `${baseUrl}/S-1905-017737/Globally Sclerotic Glomeruli.adata.zarr`,
      options: {
        path: 'X',
      },
      coordinationValues: {
        obsType: 'Globally Sclerotic Glomeruli',
        featureType: 'feature',
        featureValueType: 'value',
      },
    })
    .addFile({
      fileType: 'obsFeatureMatrix.anndata.zarr',
      url: `${baseUrl}/S-1905-017737/Tubules with Area non infinity.adata.zarr`,
      options: {
        path: 'X',
      },
      coordinationValues: {
        obsType: 'Tubules',
        featureType: 'feature',
        featureValueType: 'value',
      },
    })
    .addFile({
      fileType: 'obsFeatureMatrix.anndata.zarr',
      url: `${baseUrl}/S-1905-017737/IFTA.adata.zarr`,
      options: {
        path: 'X',
      },
      coordinationValues: {
        obsType: 'Interstitial Fibrosis and Tubular Atrophy',
        featureType: 'feature',
        featureValueType: 'value',
      },
    })
    .addFile({
      fileType: 'obsFeatureMatrix.anndata.zarr',
      url: `${baseUrl}/S-1905-017737/Peritubular Capillaries renamed.adata.zarr`,
      options: {
        path: 'X',
      },
      coordinationValues: {
        obsType: 'Peritubular Capillaries',
        featureType: 'feature',
        featureValueType: 'value',
      },
    });

  const [
    featureTypeScope,
    featureValueScope,
    opacityScope,
    filledScope,
    strokeScope,
  ] = config.addCoordination(
    'featureType',
    'featureValueType',
    'spatialChannelOpacity',
    'spatialSegmentationFilled',
    'spatialSegmentationStrokeWidth',
  );
  featureTypeScope.setValue('feature');
  featureValueScope.setValue('value');
  opacityScope.setValue(0.7);
  filledScope.setValue(true);
  strokeScope.setValue(1);

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetX: 19375.01239458,
    spatialTargetY: 18524.67196937,
    spatialZoom: -4.60703913795,
    featureValueColormapRange: [0, 1],
    imageLayer: CL([
      {
        fileUid: 'S-1905-017737_bf',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'S-1905-017737',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'Cortical Interstitia',
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelOpacity: 0.1,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: false,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: true,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Non-Globally Sclerotic Glomeruli',
            spatialTargetC: 1,
            spatialChannelColor: [91, 181, 231],
            spatialChannelOpacity: opacityScope,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: filledScope,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Globally Sclerotic Glomeruli',
            spatialTargetC: 2,
            spatialChannelColor: [22, 157, 116],
            spatialChannelOpacity: opacityScope,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: filledScope,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Tubules',
            spatialTargetC: 3,
            spatialChannelColor: [239, 226, 82],
            spatialChannelOpacity: opacityScope,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: filledScope,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Arteries/Arterioles',
            spatialTargetC: 4,
            spatialChannelColor: [16, 115, 176],
            spatialChannelOpacity: opacityScope,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: filledScope,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Interstitial Fibrosis and Tubular Atrophy',
            spatialTargetC: 5,
            spatialChannelColor: [211, 94, 26],
            spatialChannelOpacity: opacityScope,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
          {
            obsType: 'Peritubular Capillaries',
            spatialTargetC: 6,
            spatialChannelColor: [255, 0, 0],
            spatialChannelOpacity: 1.0,
            featureType: featureTypeScope,
            featureValueType: featureValueScope,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: true,
            spatialSegmentationStrokeWidth: strokeScope,
            obsHighlight: null,
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const kpmpOop2023 = generateKpmpConfig();
