import { generateSpatialAcceleratedConfiguration } from './three-spatial-accelerated.js';

// Accelerated 3D views set up for figures: channel colors and camera.
// Demo config names are s-a-figure-<key>. Open them with &theme=light for a
// white background.
//
// To add the current camera: expand the info panel of the 3D view, click the
// copy button next to "Camera", and paste it as the camera of the figure.
const figures = {
  'kiemen-he': {
    imageId: 'kiemen-he-tiff',
    name: 'Figure: Kiemen et al. H&E',
    channels: [
      // #393383
      { spatialTargetC: 0, spatialChannelColor: [57, 51, 131] }, // Hematoxylin
      // #D91AC6
      { spatialTargetC: 1, spatialChannelColor: [217, 26, 198] }, // Eosin
    ],
    camera: {
      zoom: 0,
      target: [0, 0, 0],
      rotationX: 0,
      rotationOrbit: 0,
    },
  },
};

// Keyed by demo config name, s-a-figure-kiemen-he etc.
export const saFigures = Object.fromEntries(Object.entries(figures).map(
  ([key, {
    imageId, volumeZReduction = 'auto', ...preset
  }]) => [
    `s-a-figure-${key}`,
    generateSpatialAcceleratedConfiguration(imageId, volumeZReduction, preset),
  ],
));
