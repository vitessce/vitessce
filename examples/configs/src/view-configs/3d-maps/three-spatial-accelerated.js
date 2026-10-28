import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';

const idr0077Angles = [0, 1, 2, 3, 4, 5, 6, 7];

// Zebrahub light sheet time series (TCZYX, uint16); the view shows t = 0.
const zebrahubUrls = {
  'zebrahub-zmns001': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/multi-view/ZMNS001.ome.zarr',
  'zebrahub-zmns002': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/multi-view/ZMNS002.ome.zarr',
  'zebrahub-zsns001': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/single-objective/ZSNS001.ome.zarr',
  'zebrahub-zsns002': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/single-objective/ZSNS002.ome.zarr',
  // Uppercase axis names, and level scales that shrink instead of grow.
  'zebrahub-zsns003': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/single-objective/ZSNS003.ome.zarr',
  'zebrahub-zsns004': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/single-objective/ZSNS004.ome.zarr',
  'zebrahub-zsns005': 'https://public.czbiohub.org/royerlab/zebrahub/imaging/single-objective/ZSNS005.ome.zarr',
};

// OME-Zarr 0.5 (Zarr v3) conversions of the Open SciVis volumes: ZYX, one
// channel, uint8 / uint16 / int16 / float32, with OMERO windows.
const scivisNames = [
  'aneurism', 'backpack', 'beechnut', 'blunt_fin', 'bonsai', 'boston_teapot', 'bunny', 'carp',
  'chameleon', 'christmas_tree', 'csafe_heptane', 'duct', 'engine', 'foot', 'frog', 'fuel',
  'hcci_oh', 'hydrogen_atom', 'jicf_q', 'kingsnake', 'lobster', 'magnetic_reconnection',
  'marmoset_neurons', 'marschner_lobb', 'miranda', 'mri_ventricles', 'mri_woman', 'mrt_angio',
  'neghip', 'neocortical_layer_1_axons', 'nucleon', 'pancreas', 'pawpawsaurus', 'pig_heart',
  'present', 'prone', 'richtmyer_meshkov', 'shockwave', 'silicium', 'skull', 'spathorhynchus',
  'stag_beetle', 'statue_leg', 'stent', 'synthetic_truss_with_five_defects', 'tacc_turbulence',
  'tooth', 'vertebra', 'vis_male', 'woodbranch', 'zeiss',
];

const idToUrl = {
  'lsp-1': 'https://data-2.vitessce.io/data/sorger/f8ii/',
  'lsp-2': 'https://data-2.vitessce.io/data/sorger/lightsheet_colon/',
  'lsp-3': 'https://data-2.vitessce.io/data/sorger/melanoma_zarr_32/',
  kingsnake: 'https://data-2.vitessce.io/data/zarr_test/kingsnake_1c_32_z.zarr/',
  gloria: 'https://data-2.vitessce.io/data/zarr_test/gloria/',
  // XY-only pyramids with 2D chunks (logical levels, Z reduction).
  idr0062A: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
  idr0101A: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0101A/13457227.zarr',
  idr0048A: 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846151.zarr/0',
  idr0106: 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.1/12689244.zarr',
  // Over the size limit.
  'idr0048A-9846152': 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846152.zarr/',
  idr0066: 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0066/ExpA_VIP_ASLM_on.zarr',
  idr0044A: 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0044A/4007801.zarr',
  idr0157: 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0157/Asterella%20gracilis%20SWE/IMG_1033-1112%20Asterella%20gracilis%20(Mannia%20gracilis)%20stature.ome.zarr',
  'idr0062A-6001257': 'https://livingobjects.ebi.ac.uk/idr/zarr/v0.1/6001257.zarr',
  // idr0077: one flower imaged from 8 angles, images 9836831 to 9836838.
  ...Object.fromEntries(idr0077Angles.map(angle => [
    `idr0077-a${angle}`,
    `https://livingobjects.ebi.ac.uk/idr/zarr/v0.1/${9836831 + angle}.zarr`,
  ])),
  ...zebrahubUrls,
  ...Object.fromEntries(scivisNames.map(name => [
    `scivis-${name}`,
    `https://ome-zarr-scivis.s3.us-east-1.amazonaws.com/v0.5/96x2/${name}.ome.zarr`,
  ])),
  // Tiled OME-TIFF pyramids (read tile by tile). Physical sizes come from the OME-XML.
  'idr0106-tiff': 'https://viv-demo.storage.googleapis.com/idr0106.pyramid.ome.tif',
  'brain-tiff': 'https://viv-demo.storage.googleapis.com/brain.pyramid.ome.tif',
  // 2D image (Z = 1), 8 channels, float32, 512 x 512 tiles.
  'luca-tiff': 'https://viv-demo.storage.googleapis.com/LuCa-7color_3x3component_data.ome.tif',
  // WashU kidney light sheet (source HuBMAP dataset unknown).
  'washu-kidney-tiff': 'https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
  // HuBMAP light sheet, one channel each. HBM443.QMZS.483, HBM945.XPKJ.998, HBM759.DQHR.327.
  'hubmap-lymph-node-tiff': 'https://assets.hubmapconsortium.org/1f99c0bc4fd3a60bb569410878e4a817/ometiff-pyramids/Level0/Channel1/UFL0006-LY09-1-1.ome.tif',
  'hubmap-thymus-tiff': 'https://assets.hubmapconsortium.org/bc875d49ed4aaa112398aa32160d88c8/ometiff-pyramids/Level0/Channel1/UFL0002-TH-1-4-1.ome.tif',
  'hubmap-spleen-tiff': 'https://assets.hubmapconsortium.org/71b3fdd770de565e5d48a73060b72189/ometiff-pyramids/Level0/Channel1/UFL0007-SP-2-3-1.ome.tif',
  // Kiemen et al. H&E, color-deconvolved: 2 channels (hematoxylin, eosin), uint8, 408 planes.
  'kiemen-he-tiff': 'https://data-2.vitessce.io/data/kiemenetal/5xHE_HE.ome.tiff',
  // HuBMAP lymph node 3D IMC, HBM475.RQSB.723.
  'hubmap-lymph-node-imc-tiff': 'https://assets.hubmapconsortium.org/21221d689913ae19e0cc92f532738c44/ometiff-pyramids/data/3D_image_stack.ome.tif',
};

const idToFileType = {
  'idr0106-tiff': 'image.ome-tiff',
  'brain-tiff': 'image.ome-tiff',
  'luca-tiff': 'image.ome-tiff',
  'washu-kidney-tiff': 'image.ome-tiff',
  'hubmap-lymph-node-tiff': 'image.ome-tiff',
  'hubmap-thymus-tiff': 'image.ome-tiff',
  'hubmap-spleen-tiff': 'image.ome-tiff',
  'hubmap-lymph-node-imc-tiff': 'image.ome-tiff',
  'kiemen-he-tiff': 'image.ome-tiff',
};

const idToOptions = {
  // NGFF 0.1 has no transforms. Physical voxel sizes, as TCZYX scales, from the
  // OME-XML of the same image in idr0106.pyramid.ome.tif (XY 3.22 µm, Z 10 µm).
  idr0106: { coordinateTransformations: [{ type: 'scale', scale: [1, 1, 10, 3.22, 3.22] }] },
  // Also NGFF 0.1. Physical sizes from the IDR OME metadata of the same images.
  'idr0062A-6001257': { coordinateTransformations: [{ type: 'scale', scale: [1, 1, 1, 0.284, 0.284] }] },
  ...Object.fromEntries(idr0077Angles.map(angle => [
    `idr0077-a${angle}`,
    { coordinateTransformations: [{ type: 'scale', scale: [1, 1, 1.633162854885543, 0.26956549963305393, 0.26956549963305393] }] },
  ])),
  // The idr0048A OME/METADATA.ome.xml files give 1 pixel sizes, so they add nothing.
  // IFD offsets avoid walking thousands of IFDs (brain has 1955 planes x 2 channels).
  'idr0106-tiff': { offsetsUrl: 'https://viv-demo.storage.googleapis.com/idr0106.pyramid.offsets.json' },
  'brain-tiff': { offsetsUrl: 'https://viv-demo.storage.googleapis.com/brain.pyramid.offsets.json' },
  'washu-kidney-tiff': { offsetsUrl: 'https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json' },
  'kiemen-he-tiff': { offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE_HE.offsets.json' },
};

// volumeZReduction: 'auto' | 'none' | 'sample' | 'mean' | 'max'
function generateSpatialAcceleratedConfiguration(imageId, volumeZReduction = 'auto') {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: `Spatial Accelerated: ${imageId}`,
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: idToFileType[imageId] ?? 'image.ome-zarr',
    url: idToUrl[imageId],
    ...(idToOptions[imageId] ? { options: idToOptions[imageId] } : {}),
    // url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-melanoma-in-situ/0',
    // url: 'http://127.0.0.1:8080/kingsnake_1024x1024x795_uint8_z_manual.zarr',
    // url: 'http://127.0.0.1:8080/kingsnake/kingsnake_1c_32_z.zarr',

    // url: 'https://data-2.vitessce.io/data/zarr_test/kingsnake_1c_32_z.zarr/',
    // url: 'https://data-2.vitessce.io/data/zarr_test/gloria/',
    // url: 'http://127.0.0.1:8080/gloria/',
    // url: 'http://127.0.0.1:8080/gloria_conversion/v1',

    // Example 1 clarence -- 0-7
    // url: 'https://data-2.vitessce.io/data/sorger/f8ii/',
    // Example 2 clarence -- 0-8
    // url: 'https://data-2.vitessce.io/data/sorger/lightsheet_colon/',
    // Example 350 GB
    // url: 'https://data-2.vitessce.io/data/sorger/melanoma_zarr_32/',

    // url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.3/idr0079A/9836998.zarr',
    // url: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff',
    // options: {
    //   offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json',
    // },
  });

  const spatialAcceleratedView = config
    .addView(dataset, 'spatialBeta', { x: 0, y: 0, w: 9, h: 8 })
    .setProps({ three: true, accelerated: true, volumeZReduction });
  // const spatialThreeView = config
  //   .addView(dataset, 'spatialBeta')
  //   .setProps({ three: true, accelerated: false });
  const lcView = config.addView(dataset, 'layerControllerBeta', { x: 9, y: 0, w: 3, h: 8 });
  config.linkViewsByObject([spatialAcceleratedView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        spatialLayerOpacity: 1,
        // spatialTargetResolution: 5,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            // spatialChannelWindow: [0, 4095],
          },
        ]),
      },
    ]),
  });

  // config.layout(hconcat(spatialAcceleratedView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const saLsp1 = generateSpatialAcceleratedConfiguration('lsp-1');
export const saLsp2 = generateSpatialAcceleratedConfiguration('lsp-2');
export const saLsp3 = generateSpatialAcceleratedConfiguration('lsp-3');
export const saKingsnake = generateSpatialAcceleratedConfiguration('kingsnake');
export const saGloria = generateSpatialAcceleratedConfiguration('gloria');
export const saIdr0062A = generateSpatialAcceleratedConfiguration('idr0062A');
export const saIdr0101A = generateSpatialAcceleratedConfiguration('idr0101A');
export const saIdr0048A = generateSpatialAcceleratedConfiguration('idr0048A');
export const saIdr0048ANone = generateSpatialAcceleratedConfiguration('idr0048A', 'none');
export const saIdr0048AMean = generateSpatialAcceleratedConfiguration('idr0048A', 'mean');
export const saIdr0106 = generateSpatialAcceleratedConfiguration('idr0106');
export const saIdr0106Tiff = generateSpatialAcceleratedConfiguration('idr0106-tiff');
export const saBrainTiff = generateSpatialAcceleratedConfiguration('brain-tiff');
export const saLucaTiff = generateSpatialAcceleratedConfiguration('luca-tiff');
export const saWashuKidneyTiff = generateSpatialAcceleratedConfiguration('washu-kidney-tiff');
export const saIdr0048A9846152 = generateSpatialAcceleratedConfiguration('idr0048A-9846152');
export const saHubmapLymphNodeTiff = generateSpatialAcceleratedConfiguration('hubmap-lymph-node-tiff');
export const saIdr0066 = generateSpatialAcceleratedConfiguration('idr0066');
export const saIdr0044A = generateSpatialAcceleratedConfiguration('idr0044A');
export const saHubmapThymusTiff = generateSpatialAcceleratedConfiguration('hubmap-thymus-tiff');
export const saIdr0157 = generateSpatialAcceleratedConfiguration('idr0157');
export const saHubmapSpleenTiff = generateSpatialAcceleratedConfiguration('hubmap-spleen-tiff');
export const saIdr0062A6001257 = generateSpatialAcceleratedConfiguration('idr0062A-6001257');
export const saHubmapLymphNodeImcTiff = generateSpatialAcceleratedConfiguration('hubmap-lymph-node-imc-tiff');
export const saKiemenHeTiff = generateSpatialAcceleratedConfiguration('kiemen-he-tiff');
// Keyed by demo config name, s-a-idr0077-a0 to s-a-idr0077-a7.
export const saIdr0077Angles = Object.fromEntries(idr0077Angles.map(angle => [
  `s-a-idr0077-a${angle}`,
  generateSpatialAcceleratedConfiguration(`idr0077-a${angle}`),
]));

// Keyed by demo config name, s-a-zebrahub-zmns001 etc.
export const saZebrahub = Object.fromEntries(Object.keys(zebrahubUrls).map(imageId => [
  `s-a-${imageId}`,
  generateSpatialAcceleratedConfiguration(imageId),
]));
// Keyed by demo config name, s-a-scivis-bonsai etc.
export const saScivis = Object.fromEntries(scivisNames.map(name => [
  `s-a-scivis-${name}`,
  generateSpatialAcceleratedConfiguration(`scivis-${name}`),
]));

// Picked once per page load. The config name shows which image it is.
const imageIds = Object.keys(idToUrl);
const randomImageId = imageIds[Math.floor(Math.random() * imageIds.length)];
export const saRandom = generateSpatialAcceleratedConfiguration(randomImageId);
