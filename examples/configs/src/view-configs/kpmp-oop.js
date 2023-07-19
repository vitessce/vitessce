/* eslint-disable no-unused-vars */
import { VitessceConfig, CoordinationLevel as CL, hconcat } from '@vitessce/config';

// Serve kpmp/OME-TIFF folder
const localBaseUrl = 'http://localhost:8000';
const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023';

function generateKpmpConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ome-tiff',
    url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.ome.tif`,
    options: {
      offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.offsets.json`,
    },
    coordinationValues: {
      image: 'S-1905-017737',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.ome.tif`,
    options: {
      offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.offsets.json`,
    },
    coordinationValues: {
      image: 'S-1905-017737_bf',
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
  }).addFile({
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
  }).addFile({
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
  }).addFile({
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
  }).addFile({
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
  }).addFile({
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

  const scopes = config.addComplexCoordination({
    imageLayer: CL([
      {
        image: 'S-1905-017737_bf',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        photometricInterpretation: 'RGB',
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
        image: 'S-1905-017737',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'Cortical Interstitia',
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelOpacity: 0.1,
            spatialChannelVisible: false,
            obsColorEncoding: 'spatialChannelColor',
          },
          {
            obsType: 'Non-Globally Sclerotic Glomeruli',
            spatialTargetC: 1,
            spatialChannelColor: [91, 181, 231],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
          },
          {
            obsType: 'Globally Sclerotic Glomeruli',
            spatialTargetC: 2,
            spatialChannelColor: [22, 157, 116],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
          },
          {
            obsType: 'Tubules',
            spatialTargetC: 3,
            spatialChannelColor: [239, 226, 82],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
          },
          {
            obsType: 'Arteries/Arterioles',
            spatialTargetC: 4,
            spatialChannelColor: [16, 115, 176],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            featureType: 'feature',
            featureValueType: 'value',
          },
          {
            obsType: 'Interstitial Fibrosis and Tubular Atrophy',
            spatialTargetC: 5,
            spatialChannelColor: [211, 94, 26],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
          },
          {
            obsType: 'Peritubular Capillaries',
            spatialTargetC: 6,
            spatialChannelColor: [202, 122, 166],
            // spatialChannelOpacity: 0.9,
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
          },
        ]),
      },
    ]),
  });
  
  const [featureTypeScope, featureValueScope, opacityScope] = config.addCoordination(
    'featureType',
    'featureValueType',
    'spatialChannelOpacity'
  );
  featureTypeScope.setValue('feature');
  featureValueScope.setValue('value');
  opacityScope.setValue(0.5);

  // Manually inject coordination scopes to be shared across certain channels.
  // TODO: create a more user-friendly/"public"/documented API for this.
  scopes.segmentationLayer[0].children.segmentationChannel.forEach(channelObj => {
    if(channelObj.children.obsType.scope.cValue !== 'Cortical Interstitia') {
      // Coordinate all non-interstitia channels on their
      // featureType, featureValueType, and opacity values.
      channelObj.children.featureType = { scope: featureTypeScope };
      channelObj.children.featureValueType = { scope: featureValueScope };
      channelObj.children.spatialChannelOpacity = { scope: opacityScope };
    }
  });

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useComplexCoordination(scopes);

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  spatialView.useMetaCoordination(metaCoordinationScope);
  lcView.useMetaCoordination(metaCoordinationScope);

  config.layout(hconcat(spatialView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const kpmpOop2023 = generateKpmpConfig();
