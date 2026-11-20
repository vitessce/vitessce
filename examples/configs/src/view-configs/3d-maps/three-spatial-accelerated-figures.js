import { generateSpatialAcceleratedConfiguration } from './three-spatial-accelerated.js';

// Accelerated 3D views set up for figures: channel colors and camera.
// Demo config names are s-a-figure-<key>. Open them with &theme=light for a
// white background.
//
// To add the current camera: expand the info panel of the 3D view, click the
// copy button next to "Camera", and paste it as the camera of the figure
// (a spatialCameraSnapshot, in the physical units of the image).
//
// viewProps.volumeProjection 'orthographic' turns off the perspective (in the
// vertex shader), and viewProps.volumeColorByResolution colors the volume
// by the level each sample was read from: 0 red, 1 blue, 2 green, 3 magenta,
// 4 cyan, 5 yellow, 6 light red.

const DEG2RAD = Math.PI / 180;
// Vertical field of view of the 3D view.
const FOV_DEGREES = 50;

/**
 * A spatialCameraSnapshot that orbits the center of a volume.
 * @param {object} volume
 * @param {number[]} volume.size Physical size (XYZ) of the volume.
 * @param {number} [volume.metersPerUnit] Physical size of one unit, if known.
 * @param {object} orbit
 * @param {number} [orbit.zoom] log2 scale: 0 fits the width of the volume
 * (as the view starts), each step doubles the magnification.
 * @param {number} [orbit.rotationX] Elevation in degrees, from the XY plane
 * towards +Y.
 * @param {number} [orbit.rotationOrbit] Degrees around the Y axis
 * (clockwise when seen from +Y).
 * @returns {object} The spatialCameraSnapshot.
 */
function orbitCamera({ size, metersPerUnit }, { zoom = 0, rotationX = 0, rotationOrbit = 0 } = {}) {
  // Camera distance at zoom 0, in widths of the volume: as the view starts.
  const distance = 4 * size[0] * (2 ** -zoom);
  // Yaw about Y, then pitch about X: [sin(a/2) * axis, cos(a/2)].
  const yaw = (-rotationOrbit * DEG2RAD) / 2;
  const pitch = (-rotationX * DEG2RAD) / 2;
  return {
    position: size.map(value => value / 2),
    quaternion: [
      Math.cos(yaw) * Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch),
      -Math.sin(yaw) * Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    ],
    projectionScale: distance * 2 * Math.tan((FOV_DEGREES * DEG2RAD) / 2),
    fovDegrees: FOV_DEGREES,
    ...(metersPerUnit ? { metersPerUnit } : {}),
  };
}

// Physical sizes (XYZ) of the volumes, from the image metadata.
const volumes = {
  // 2048 x 2048 x 1937 voxels of 6.55 x 6.55 x 5 µm.
  idr0066: {
    size: [2048 * 6.550032422660492, 2048 * 6.550032422660492, 1937 * 5],
    metersPerUnit: 1e-6,
  },
  // 11008 x 5632 x 200 voxels of 0.14 x 0.14 x 0.28, without a unit.
  'lsp-3': { size: [11008 * 0.14, 5632 * 0.14, 200 * 0.28] },
  // 15921 x 12177 x 408 voxels of 2 x 2 x 12 µm.
  'kiemen-he-tiff': { size: [15921 * 2, 12177 * 2, 408 * 12], metersPerUnit: 1e-6 },
  // 3714 x 3708 x 2298 voxels of 0.229 x 0.229 x 0.466 µm.
  'washu-kidney-tiff': {
    size: [3714 * 0.22853955542347043, 3708 * 0.22853955542347043, 2298 * 0.46611274060167124],
    metersPerUnit: 1e-6,
  },
};

// Front view of the XY plane, as the view starts.
const overviewCamera = null;
// TODO: paste the zoomed-in cameras from the info panel.
const zoomOrbit = { zoom: 3 };
// Isometric: looking down 35.26° (atan(1/√2)) from 45° around the volume.
const isoOrbit = { rotationX: -35.264, rotationOrbit: 45 };
const altOrbit = { rotationX: -20, rotationOrbit: -60 };
const orthographic = { volumeProjection: 'orthographic' };

// idr0066: 2048 x 2048 x 1937, one channel (tdTomato), 6.55 µm in XY, 5 µm in Z.
// Its 7 render levels are 0 (2048 x 2048 x 1937) to 6 (32 x 32 x 24).
// All idr0066 figures share the contrast window (the OMERO window of the image).
const idr0066Channels = [{
  spatialTargetC: 0, spatialChannelColor: [255, 0, 0], spatialChannelWindow: [0, 1507],
}];
// All idr0066 figures share the clipping planes (in µm, the units of the
// clipping sliders, which run from 0 to the physical size of the volume).
// X and Y are clipped evenly from both sides down to the physical depth of Z
// (1937 x 5 µm), leaving the largest centered cube; Z is not clipped.
const idr0066SizeXY = 2048 * 6.55;
const idr0066CubeSize = 1937 * 5;
const idr0066CubeMargin = (idr0066SizeXY - idr0066CubeSize) / 2;
const idr0066Cube = {
  spatialSliceX: [idr0066CubeMargin, idr0066SizeXY - idr0066CubeMargin],
  spatialSliceY: [idr0066CubeMargin, idr0066SizeXY - idr0066CubeMargin],
};
// A LOD factor well below 1 asks for level 0 even in the overview.
const idr0066FullResolution = { ...idr0066Cube, spatialLodFactor: 0.1 };
// Never finer than level 4 (128 x 128 x 93), two levels above the coarsest.
const idr0066LowResolutionChannels = idr0066Channels.map(channel => ({
  ...channel, spatialMaxResolution: 4,
}));

// lsp-3: 70 channels; four of them, in colors that show on white.
const lsp3Channels = [
  { spatialTargetC: 0, spatialChannelColor: [0, 0, 255] }, // Hoechst
  { spatialTargetC: 3, spatialChannelColor: [0, 158, 0] }, // MART1
  { spatialTargetC: 9, spatialChannelColor: [255, 0, 255] }, // S100B
  { spatialTargetC: 19, spatialChannelColor: [255, 157, 0] }, // CD31
];
const kiemenHeChannels = [
  // #393383
  { spatialTargetC: 0, spatialChannelColor: [57, 51, 131] }, // Hematoxylin
  // #D91AC6
  { spatialTargetC: 1, spatialChannelColor: [217, 26, 198] }, // Eosin
];
// The channel colors of the OME-XML.
const washuKidneyChannels = [
  { spatialTargetC: 0, spatialChannelColor: [255, 0, 255] }, // AQP2/NPHS1
  { spatialTargetC: 1, spatialChannelColor: [255, 0, 0] }, // TUJ1
  { spatialTargetC: 2, spatialChannelColor: [0, 255, 0] }, // CD31
  { spatialTargetC: 3, spatialChannelColor: [0, 0, 255] }, // DAPI
];

// Overview, zoom, and isometric figures of one multichannel image.
function multichannelFigures(figure, imageId, name, channels) {
  return {
    [`${figure}-overview`]: {
      imageId, name: `Figure ${figure}: ${name} overview`, channels, camera: overviewCamera,
    },
    [`${figure}-zoom`]: {
      imageId,
      name: `Figure ${figure}: ${name} zoom`,
      channels,
      camera: orbitCamera(volumes[imageId], zoomOrbit),
    },
    [`${figure}-iso`]: {
      imageId,
      name: `Figure ${figure}: ${name} isometric`,
      channels,
      camera: orbitCamera(volumes[imageId], isoOrbit),
      viewProps: orthographic,
    },
  };
}

const figures = {
  'kiemen-he': {
    imageId: 'kiemen-he-tiff',
    name: 'Figure: Kiemen et al. H&E',
    channels: kiemenHeChannels,
    camera: overviewCamera,
  },
  0: {
    imageId: 'idr0066',
    name: 'Figure 0: idr0066 isometric',
    channels: idr0066Channels,
    camera: orbitCamera(volumes.idr0066, isoOrbit),
    layer: idr0066Cube,
    viewProps: orthographic,
  },
  '0-levels': {
    imageId: 'idr0066',
    name: 'Figure 0: idr0066 isometric, colored by level',
    channels: idr0066Channels,
    camera: orbitCamera(volumes.idr0066, isoOrbit),
    layer: idr0066Cube,
    viewProps: { ...orthographic, volumeColorByResolution: true },
  },
  '2a-overview': {
    imageId: 'idr0066',
    name: 'Figure 2a: idr0066 overview, full resolution',
    channels: idr0066Channels,
    camera: overviewCamera,
    layer: idr0066FullResolution,
  },
  '2a-zoom': {
    imageId: 'idr0066',
    name: 'Figure 2a: idr0066 zoom, full resolution',
    channels: idr0066Channels,
    camera: orbitCamera(volumes.idr0066, zoomOrbit),
    layer: idr0066FullResolution,
  },
  '2b-overview': {
    imageId: 'idr0066',
    name: 'Figure 2b: idr0066 overview, level 4',
    channels: idr0066LowResolutionChannels,
    camera: overviewCamera,
    layer: idr0066Cube,
  },
  '2b-zoom': {
    imageId: 'idr0066',
    name: 'Figure 2b: idr0066 zoom, level 4',
    channels: idr0066LowResolutionChannels,
    camera: orbitCamera(volumes.idr0066, zoomOrbit),
    layer: idr0066Cube,
  },
  '3-overview': {
    imageId: 'idr0066',
    name: 'Figure 3: idr0066 overview',
    channels: idr0066Channels,
    camera: overviewCamera,
    layer: idr0066Cube,
  },
  '3-zoom': {
    imageId: 'idr0066',
    name: 'Figure 3: idr0066 zoom',
    channels: idr0066Channels,
    camera: orbitCamera(volumes.idr0066, zoomOrbit),
    layer: idr0066Cube,
  },
  '3-alt': {
    imageId: 'idr0066',
    name: 'Figure 3: idr0066 other angle',
    channels: idr0066Channels,
    camera: orbitCamera(volumes.idr0066, altOrbit),
    layer: idr0066Cube,
  },
  ...multichannelFigures('4a', 'lsp-3', 'lsp-3', lsp3Channels),
  ...multichannelFigures('4b', 'kiemen-he-tiff', 'Kiemen et al. H&E', kiemenHeChannels),
  ...multichannelFigures('4c', 'washu-kidney-tiff', 'WashU kidney', washuKidneyChannels),
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
