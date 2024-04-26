/* eslint-disable no-unused-vars */

// Serve kpmp/OME-TIFF folder
const localBaseUrl = 'http://localhost:8000';
const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023';

export const kpmpAutoInit2023 = {
  version: '1.0.16',
  name: 'KPMP',
  description: 'multi-obsType segmentations',
  datasets: [
    {
      uid: 'S-1905-017737',
      name: 'S-1905-017737',
      files: [
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.ome.tif`,
          options: {
            offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.offsets.json`,
          },
          coordinationValues: {
            image: 'S-1905-017737',
          },
        },
        {
          fileType: 'image.ome-tiff',
          url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.ome.tif`,
          options: {
            offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.offsets.json`,
          },
          coordinationValues: {
            image: 'S-1905-017737_bf',
          },
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatialBeta',
      coordinationScopes: {

      },
      x: 0,
      y: 0,
      w: 8,
      h: 8,
    },
    {
      component: 'layerControllerBeta',
      props: {
        disableChannelsIfRgbDetected: true,
      },
      coordinationScopes: {

      },
      x: 8,
      y: 0,
      w: 4,
      h: 4,
    },
  ],
};
