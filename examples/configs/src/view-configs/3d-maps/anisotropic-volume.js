import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

/**
 * Regression case for physical pixel size handling in 3D volume rendering.
 *
 * This is a public HuBMAP 3D Imaging Mass Cytometry dataset (HBM459.CGSD.533)
 * whose voxels are deliberately anisotropic:
 *
 *   SizeX=452  SizeY=514  SizeZ=50
 *   PhysicalSizeX=1.0um  PhysicalSizeY=1.0um  PhysicalSizeZ=2.0um
 *
 * so the correct physical extent of the volume is 452 x 514 x 100 um. Note that
 * this config deliberately does NOT set `three: true` - it exercises the
 * deck.gl/viv VolumeLayer path, which is the one that applied the physical pixel
 * size twice and rendered the volume 452 x 514 x 200.
 */
function generateAnisotropicVolumeConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Anisotropic volume (1x1x2 um)',
    description: 'HuBMAP 3DIMC HBM459.CGSD.533. Toggle 3D in the layer controller: the volume must be half as deep as it is wide, not as deep as it is wide.',
  });
  const dataset = config.addDataset('HBM459.CGSD.533').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/output_offsets/data/3D_image_stack.offsets.json',
    },
    coordinationValues: {
      fileUid: 'imc',
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'imc',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([0, 1, 2].map((targetC, i) => ({
          spatialTargetC: targetC,
          spatialChannelColor: [
            [0, 0, 255],
            [0, 255, 0],
            [255, 0, 255],
          ][i],
          spatialChannelVisible: true,
          spatialChannelOpacity: 1.0,
        }))),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.layout(hconcat(spatialView, lcView));

  return config.toJSON();
}

export const anisotropicVolume = generateAnisotropicVolumeConfiguration();
