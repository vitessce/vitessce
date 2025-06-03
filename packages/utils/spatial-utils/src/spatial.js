import { isEqual } from 'lodash-es';
import { Matrix4 } from 'math.gl';
import { divide, compare, unit } from 'mathjs';
import { VIEWER_PALETTE } from '@vitessce/utils';
import { GLOBAL_LABELS, DEFAULT_RASTER_LAYER_PROPS } from '@vitessce/constants-internal';
import { log } from '@vitessce/globals';
import { getMultiSelectionStats } from './layer-controller.js';
/**
 * Get a representative PixelSource from a loader object returned from
 * the Vitessce imaging loaders
 * @param {object} loader { data: (PixelSource[]|PixelSource), metadata, channels } object
 * @param {number | undefined} level Level of the multiscale loader from which to get a PixelSource
 * @returns {object} PixelSource object
 */
export function getSourceFromLoader(loader, level) {
  const { data } = loader;
  const source = Array.isArray(data) ? data[(level || data.length - 1)] : data;
  return source;
}

export const getStatsForResolution = (loader, resolution) => {
  const { shape, labels } = loader[resolution];
  const height = shape[labels.indexOf('y')];
  const width = shape[labels.indexOf('x')];
  const depth = shape[labels.indexOf('z')];
  // eslint-disable-next-line no-bitwise
  const depthDownsampled = Math.max(1, depth >> resolution);
  // Check memory allocation limits for Float32Array (used in XR3DLayer for rendering)
  const totalBytes = 4 * height * width * depthDownsampled;
  return {
    height, width, depthDownsampled, totalBytes,
  };
};

export const canLoadResolution = (loader, resolution) => {
  const {
    totalBytes, height, width, depthDownsampled,
  } = getStatsForResolution(
    loader,
    resolution,
  );
  const maxHeapSize = window.performance?.memory
    && window.performance?.memory?.jsHeapSizeLimit / 2;
  const maxSize = maxHeapSize || (2 ** 31) - 1;
  // 2048 is a normal texture size limit although some browsers go larger.
  return (
    totalBytes < maxSize
    && height <= 2048
    && depthDownsampled <= 2048
    && width <= 2048
    && depthDownsampled > 1
  );
};

/**
 * Helper method to determine whether pixel data is interleaved and rgb or not.
 * @param {object} loader
 * @param {array|null} channels
 */
export function isRgb(loader, channels) {
  const source = getSourceFromLoader(loader);
  const { shape, dtype, labels } = source;
  const channelSize = shape[(labels.includes('channel') ? labels.indexOf('channel') : labels.indexOf('c'))];
  if (channelSize === 3 && dtype === 'Uint8') {
    return true;
  }
  if (channels && channels.length === 3
    && isEqual(channels[0].color, [255, 0, 0])
    && isEqual(channels[1].color, [0, 255, 0])
    && isEqual(channels[2].color, [0, 0, 255])
  ) {
    return true;
  }
  return false;
}

// From spatial/utils.js

export function physicalSizeToMatrix(xSize, ySize, zSize, xUnit, yUnit, zUnit) {
  const hasZPhyscialSize = Boolean(zSize) && Boolean(zUnit);
  const hasYPhyscialSize = Boolean(ySize) && Boolean(yUnit);
  const hasXPhyscialSize = Boolean(xSize) && Boolean(xUnit);
  if (!hasXPhyscialSize || !hasYPhyscialSize) {
    return (new Matrix4()).identity();
  }
  const sizes = [
    unit(`${xSize} ${xUnit}`.replace('µ', 'u')),
    unit(`${ySize} ${yUnit}`.replace('µ', 'u')),
  ];
  if (hasZPhyscialSize) {
    sizes.push(unit(`${zSize} ${zUnit}`.replace('µ', 'u')));
  }
  // Find the ratio of the sizes to get the scaling factor.
  const scale = sizes.map(i => divide(i, unit('1 um')));

  // TODO: is this still needed
  // sizes are special objects with own equals method - see `unit` in declaration
  // This messess the dimensions when the x & y are little different (e.g., for the geomx data)
  // if (!sizes[0].equals(sizes[1])) {
  //   // Handle scaling in the Y direction for non-square pixels
  //   scale[1] = divide(sizes[1], sizes[0]);
  // }
  // END TODO: is this still needed

  // Add in z dimension needed for Matrix4 scale API.
  if (!scale[2]) {
    scale[2] = 1;
  }
  // no need to store/use identity scaling
  if (isEqual(scale, [1, 1, 1])) {
    return (new Matrix4()).identity();
  }
  return new Matrix4().scale([...scale]);
}

function getMetaWithTransformMatrices(imageMeta, imageLoaders) {
  // Do not fill in transformation matrices if any of the layers specify one.
  const sources = imageLoaders.map(loader => getSourceFromLoader(loader));
  if (
    imageMeta.map(meta => meta?.metadata?.transform?.matrix
      || meta?.metadata?.transform?.scale
      || meta?.metadata?.transform?.translate).some(Boolean)
    || sources.every(
      source => !source.meta?.physicalSizes?.x || !source.meta?.physicalSizes?.y,
    )
  ) {
    return imageMeta;
  }
  // Get the minimum physical among all the current images.
  const minPhysicalSize = sources.reduce((acc, source) => {
    const hasZPhyscialSize = source.meta?.physicalSizes?.z?.size;
    const sizes = [
      unit(`${source.meta?.physicalSizes.x.size} ${source.meta?.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${source.meta?.physicalSizes.y.size} ${source.meta?.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    if (hasZPhyscialSize) {
      sizes.push(unit(`${source.meta?.physicalSizes.z.size} ${source.meta?.physicalSizes.z.unit}`.replace('µ', 'u')));
    }
    acc[0] = (acc[0] === undefined || compare(sizes[0], acc[0]) === -1) ? sizes[0] : acc[0];
    acc[1] = (acc[1] === undefined || compare(sizes[1], acc[1]) === -1) ? sizes[1] : acc[1];
    acc[2] = (acc[2] === undefined || compare(sizes[2], acc[2]) === -1) ? sizes[2] : acc[2];
    return acc;
  }, []);
  const imageMetaWithTransform = imageMeta.map((meta, j) => {
    const source = sources[j];
    const hasZPhyscialSize = source.meta?.physicalSizes?.z?.size;
    const sizes = [
      unit(`${source.meta?.physicalSizes.x.size} ${source.meta?.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${source.meta?.physicalSizes.y.size} ${source.meta?.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    if (hasZPhyscialSize) {
      sizes.push(unit(`${source.meta?.physicalSizes.z.size} ${source.meta?.physicalSizes.z.unit}`.replace('µ', 'u')));
    }
    // Find the ratio of the sizes to get the scaling factor.
    const scale = sizes.map((i, k) => divide(i, minPhysicalSize[k]));
    // sizes are special objects with own equals method - see `unit` in declaration
    if (!sizes[0].equals(sizes[1])) {
      // Handle scaling in the Y direction for non-square pixels
      scale[1] = divide(sizes[1], sizes[0]);
    }
    // Add in z dimension needed for Matrix4 scale API.
    if (!scale[2]) {
      scale[2] = 1;
    }
    // no need to store/use identity scaling
    if (isEqual(scale, [1, 1, 1])) {
      return meta;
    }
    // Make sure to scale the z direction by one.
    const matrix = new Matrix4().scale([...scale]);
    const newMeta = { ...meta };
    newMeta.metadata = {
      ...newMeta.metadata,
      // We don't want to store matrix objects in the view config.
      transform: { matrix: matrix.toArray() },
    };
    return newMeta;
  });
  return imageMetaWithTransform;
}

/**
 * Return the midpoint of the global dimensions.
 * @param {object} source PixelSource object from Viv
 * @returns {object} The selection.
 */
function getDefaultGlobalSelection(source) {
  const globalIndices = source.labels
    .filter(dim => GLOBAL_LABELS.includes(dim));
  const selection = {};
  globalIndices.forEach((dim) => {
    selection[dim] = Math.floor(
      (source.shape[source.labels.indexOf(dim)] || 0) / 2,
    );
  });
  return selection;
}


/**
 * Create a default selection using the midpoint of the available global dimensions,
 * and then the first four available selections from the first selectable channel.
 * @param {object} source PixelSource object from Viv
 * @returns {object} The selection.
 */
function buildDefaultSelection(source) {
  const selection = [];
  const globalSelection = getDefaultGlobalSelection(source);
  // First non-global dimension with some sort of selectable values
  const firstNonGlobalDimension = source.labels.filter(
    dim => !GLOBAL_LABELS.includes(dim)
      && source.shape[source.labels.indexOf(dim)],
  )[0];
  for (let i = 0; i < Math.min(4, source.shape[
    source.labels.indexOf(firstNonGlobalDimension)
  ]); i += 1) {
    selection.push(
      {
        [firstNonGlobalDimension]: i,
        ...globalSelection,
      },
    );
  }
  return selection;
}

/**
 * @param {Array.<number>} shape loader shape
 */
export function isInterleaved(shape) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}

/**
 * Initialize the channel selections for an individual layer.
 * @param {object} loader A viv loader instance with channel names appended by Vitessce loaders
 * of the form { data: (PixelSource[]|PixelSource), metadata: Object, channels }
 * @returns {object[]} An array of selected channels with default
 * domain/slider settings.
 */
export async function initializeLayerChannels(loader, use3d) {
  const result = [];
  const source = getSourceFromLoader(loader);
  // Add channel automatically as the first avaialable value for each dimension.
  let defaultSelection = buildDefaultSelection(source);
  defaultSelection = isInterleaved(source.shape)
    ? [{ ...defaultSelection[0], c: 0 }] : defaultSelection;
  const stats = await getMultiSelectionStats({
    loader: loader.data, selections: defaultSelection, use3d,
  });

  const domains = isRgb(loader, null)
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.domains;
  const colors = isRgb(loader, null)
    ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
    : null;
  const sliders = isRgb(loader, null)
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.sliders;

  defaultSelection.forEach((selection, i) => {
    const domain = domains[i];
    const slider = sliders[i];
    const channel = {
      selection,
      // eslint-disable-next-line no-nested-ternary
      color: colors ? colors[i]
        : defaultSelection.length !== 1
          ? VIEWER_PALETTE[i] : [255, 255, 255],
      visible: true,
      slider: slider || domain,
    };
    result.push(channel);
  });
  return result;
}

/**
 * Given a set of image layer loader creator functions,
 * create loader objects for an initial layer or set of layers,
 * which will be selected based on default values predefined in
 * the image data file or otherwise by a heuristic
 * (the midpoint of the layers array).
 * @param {object[]} rasterLayers A list of layer metadata objects with
 * shape { name, type, url, createLoader }.
 * @param {(string[]|null)} rasterRenderLayers A list of default raster layers. Optional.
 */
export async function initializeRasterLayersAndChannels(
  rasterLayers,
  rasterRenderLayers,
  usePhysicalSizeScaling,
) {
  const nextImageLoaders = [];
  let nextImageMetaAndLayers = [];
  const autoImageLayerDefPromises = [];

  // Start all loader creators immediately.
  // Reference: https://eslint.org/docs/rules/no-await-in-loop
  const loaders = await Promise.all(rasterLayers.map(layer => layer.loaderCreator()));

  for (let i = 0; i < rasterLayers.length; i++) {
    const layer = rasterLayers[i];
    const loader = loaders[i];
    nextImageLoaders[i] = loader;
    nextImageMetaAndLayers[i] = layer;
  }
  if (usePhysicalSizeScaling) {
    nextImageMetaAndLayers = getMetaWithTransformMatrices(nextImageMetaAndLayers, nextImageLoaders);
  }
  // No layers were pre-defined so set up the default image layers.
  if (!rasterRenderLayers) {
    // Midpoint of images list as default image to show.
    const layerIndex = Math.floor(rasterLayers.length / 2);
    const loader = nextImageLoaders[layerIndex];
    const autoImageLayerDefPromise = initializeLayerChannels(loader)
      .then(channels => Promise.resolve({
        type: nextImageMetaAndLayers[layerIndex]?.metadata?.isBitmask ? 'bitmask' : 'raster',
        index: layerIndex,
        ...DEFAULT_RASTER_LAYER_PROPS,
        channels: channels.map((channel, j) => ({
          ...channel,
          ...(nextImageMetaAndLayers[layerIndex].channels
            ? nextImageMetaAndLayers[layerIndex].channels[j] : []),
        })),
        modelMatrix: nextImageMetaAndLayers[layerIndex]?.metadata?.transform?.matrix,
        transparentColor: layerIndex > 0 ? [0, 0, 0] : null,
      }));
    autoImageLayerDefPromises.push(autoImageLayerDefPromise);
  } else {
    // The renderLayers parameter is a list of layer names to show by default.
    const globalIndicesOfRenderLayers = rasterRenderLayers
      .map(imageName => rasterLayers.findIndex(image => image.name === imageName));
    for (let i = 0; i < globalIndicesOfRenderLayers.length; i++) {
      const layerIndex = globalIndicesOfRenderLayers[i];
      const loader = nextImageLoaders[layerIndex];
      const autoImageLayerDefPromise = initializeLayerChannels(loader)
        // eslint-disable-next-line no-loop-func
        .then(channels => Promise.resolve({
          type: nextImageMetaAndLayers[layerIndex]?.metadata?.isBitmask ? 'bitmask' : 'raster',
          index: layerIndex,
          ...DEFAULT_RASTER_LAYER_PROPS,
          channels: channels.map((channel, j) => ({
            ...channel,
            ...(nextImageMetaAndLayers[layerIndex].channels
              ? nextImageMetaAndLayers[layerIndex].channels[j] : []),
          })),
          domainType: 'Min/Max',
          modelMatrix: nextImageMetaAndLayers[layerIndex]?.metadata?.transform?.matrix,
          transparentColor: i > 0 ? [0, 0, 0] : null,
        }));
      autoImageLayerDefPromises.push(autoImageLayerDefPromise);
    }
  }

  const autoImageLayerDefs = await Promise.all(autoImageLayerDefPromises);
  return [autoImageLayerDefs, nextImageLoaders, nextImageMetaAndLayers];
}

function getDefaultAxisType(name) {
  if (name === 't') return 'time';
  if (name === 'c') return 'channel';
  return 'space';
}

// Reference: https://github.com/hms-dbmi/vizarr/blob/ade9d5d71bbedc8c20357c5310557ff9a0c59ac5/src/utils.ts#LL114-L142C2
export function getNgffAxes(firstMultiscalesAxes) {
  // Returns axes in the latest v0.4+ format.
  // defaults for v0.1 & v0.2
  const defaultAxes = [
    { type: 'time', name: 't' },
    { type: 'channel', name: 'c' },
    { type: 'space', name: 'z' },
    { type: 'space', name: 'y' },
    { type: 'space', name: 'x' },
  ];
  let axes = defaultAxes;
  // v0.3 & v0.4+
  if (firstMultiscalesAxes) {
    axes = firstMultiscalesAxes.map((axis) => {
      // axis may be string 'x' (v0.3) or object
      if (typeof axis === 'string') {
        return { name: axis, type: getDefaultAxisType(axis) };
      }
      const { name, type } = axis;
      return { name, type: type ?? getDefaultAxisType(name) };
    });
  }
  return axes;
}

export function getNgffAxesForTiff(dimOrder) {
  return dimOrder
    .toLowerCase()
    .split('')
    .map(name => ({
      name,
      type: getDefaultAxisType(name),
    }));
}

/**
 * Convert an array of coordinateTransformations objects to a 16-element
 * plain JS array using Matrix4 linear algebra transformation functions.
 * @param {object[]|undefined} coordinateTransformations List of objects matching the
 * OME-NGFF v0.4 coordinateTransformations spec.
 * @param {object[]|undefined} axes Axes in OME-NGFF v0.4 format, objects
 * with { type, name }.
 * @returns {Matrix4} Array of 16 numbers representing the Matrix4.
 */
export function coordinateTransformationsToMatrix(coordinateTransformations, axes) {
  let mat = (new Matrix4()).identity();
  if (coordinateTransformations && axes) {
    // Get the indices of the objects corresponding to  X, Y, and Z from `axes`.
    const xyzIndices = ['x', 'y', 'z'].map(name => axes.findIndex(axisObj => axisObj.type === 'space' && axisObj.name === name));
    // Apply each transformation sequentially and in order according to the OME-NGFF v0.4 spec.
    // Reference: https://ngff.openmicroscopy.org/0.4/#trafo-md
    coordinateTransformations.forEach((transform) => {
      if (transform.type === 'translation') {
        const { translation: axisOrderedTranslation } = transform;
        if (axisOrderedTranslation.length !== axes.length) {
          throw new Error('Length of translation array was expected to match length of axes.');
        }
        const defaultValue = 0;
        // Get the translation values for [x, y, z].
        const xyzTranslation = xyzIndices.map(axisIndex => (
          axisIndex >= 0
            ? axisOrderedTranslation[axisIndex]
            : defaultValue
        ));
        const nextMat = (new Matrix4()).translate(xyzTranslation);
        mat = mat.multiplyLeft(nextMat);
      }
      if (transform.type === 'scale') {
        const { scale: axisOrderedScale } = transform;
        // Add in z dimension needed for Matrix4 scale API.
        if (axisOrderedScale.length !== axes.length) {
          throw new Error('Length of scale array was expected to match length of axes.');
        }
        const defaultValue = 1;
        // Get the scale values for [x, y, z].
        const xyzScale = xyzIndices.map(axisIndex => (
          axisIndex >= 0
            ? axisOrderedScale[axisIndex]
            : defaultValue
        ));
        const nextMat = (new Matrix4()).scale(xyzScale);
        mat = mat.multiplyLeft(nextMat);
      }
    });
  }
  return mat;
}

export function hexToRgb(hex) {
  const result = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1].toLowerCase(), 16),
    parseInt(result[2].toLowerCase(), 16),
    parseInt(result[3].toLowerCase(), 16),
  ];
}

/**
 * Normalize coordinate transformations to the OME-NGFF v0.4 format,
 * despite potentially being in the new format proposed in
 * https://github.com/ome/ngff/pull/138 (As of 2023-09-02).
 * @param {object[]|undefined} coordinateTransformations Value of
 * multiscales[0].coordinateTransformations in either OME-NGFF v0.4 format
 * or that proposed in https://github.com/ome/ngff/pull/138.
 * @param {object[]} datasets Value of multiscales[0].datasets in OME-NGFF v0.4 format.
 * @returns {object[]} Array of coordinateTransformations in OME-NGFF v0.4 format.
 */
export function normalizeCoordinateTransformations(coordinateTransformations, datasets) {
  // "The transformations in the list are applied sequentially and in order."
  // Reference: https://ngff.openmicroscopy.org/0.4/index.html#trafo-md
  let result = [];

  if (Array.isArray(coordinateTransformations)) {
    result = coordinateTransformations.flatMap((transform) => {
      if (transform.input && transform.output) {
        // This is a new-style coordinate transformation.
        // (As proposed in https://github.com/ome/ngff/pull/138)
        const { type } = transform;
        if (type === 'translation') {
          return {
            type,
            translation: transform.translation,
          };
        }
        if (type === 'scale') {
          return {
            type,
            scale: transform.scale,
          };
        }
        if (type === 'identity') {
          return { type };
        }
        if (type === 'sequence') {
          return normalizeCoordinateTransformations(transform.transformations, datasets);
        }
        log.warn(`Coordinate transformation type "${type}" is not supported.`);
      }
      // Assume it was already an old-style (NGFF v0.4) coordinate transformation.
      return transform;
    });
  }

  if (Array.isArray(datasets?.[0]?.coordinateTransformations)) {
    // "Datasets SHOULD define a transformation from array space
    // to their "native physical space."
    // This transformation SHOULD describe physical pixel spacing
    // and origin only, and therefore SHOULD consist of
    // `scale` and/or `translation` types only.""
    // Reference: https://github.com/ome/ngff/blob/b92f540dc95440f2d6b7012185b09c2b862aa744/latest/transform-details.bs#L99

    result = [
      ...datasets[0].coordinateTransformations,
      ...result,
    ];
  }
  return result;
}
