/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
import { CoordinationType } from '@vitessce/constants-internal';
import { viv } from '@vitessce/gl';
import {
  UniformsUtils,
  Data3DTexture,
  RedFormat,
  FloatType,
  LinearFilter,
} from 'three';
import { Volume } from './Volume.js';
import { VolumeRenderShaderPerspective } from './VolumeShaderPerspective.js';
import type {
  SpatialThreeProps, VolumeSettings, TypedArray, MeasureLineData,
  CoordinationRecord, ImageWrapper, VolumeSource, VolumeConfig, UniformMap,
} from './types.js';

const renderingModeMap: Record<string, number> = {
  maximumIntensityProjection: 0,
  minimumIntensityProjection: 1,
  additive: 2,
};

function extractInformationFromProps(
  layerScope: string,
  layerCoordination: CoordinationRecord,
  channelScopes: string[],
  channelCoordination: Record<string, CoordinationRecord>,
  image: ImageWrapper | undefined,
  props: SpatialThreeProps,
) {
  const {
    spatialRenderingMode,
  } = props;
  const data = image?.image?.instance?.getData();
  if (!data) {
    return {
      channelsVisible: null,
      resolution: null,
      data: null,
      colors: null,
      contrastLimits: null,
      allChannels: null,
      channelTargetC: null,
      is3dMode: false,
      renderingMode: null,
      layerTransparency: 1.0,
      xSlice: null,
      ySlice: null,
      zSlice: null,
    };
  }
  const imageWrapperInstance = image!.image.instance;
  const is3dMode = spatialRenderingMode === '3D';
  const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
  const renderingModeStr = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM] as string;
  const renderingMode = renderingModeMap[renderingModeStr];
  const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE] as boolean;
  const layerTransparency = layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY] as number;
  const rgbInterleavedProps: Record<string, boolean> = {};
  if (imageWrapperInstance.isInterleaved()) {
    rgbInterleavedProps.visible = visible;
  }

  // COLORS TO BE USED
  const colors: number[][] = isRgb ? ([
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ]) : channelScopes.map(cScope => (
    channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR] as number[]
  ));

  // CONTRAST LIMITS
  // TODO: figure out how to initialize the channel windows in the loader.
  // TODO: is [0, 255] the right fallback?
  const contrastLimits: number[][] = isRgb ? ([
    [0, 255],
    [0, 255],
    [0, 255],
  ]) : channelScopes.map(cScope => (
    (channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_WINDOW] as number[])
         || ([0, 255])
  ));

  // CHANNEL VISIBILITY
  const channelsVisible: boolean[] = isRgb ? ([
    // Layer visible AND channel visible
    visible && true,
    visible && true,
    visible && true,
  ]) : channelScopes.map(cScope => (
    // Layer visible AND channel visible
    visible && (channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE] as boolean)
  ));

  // CHANNEL TARGET
  const channelTargetC: (number | false)[] = isRgb ? ([
    // Layer visible AND channel visible
    visible && true,
    visible && true,
    visible && true,
  ] as (number | false)[]) : channelScopes.map(cScope => (
    // Layer visible AND channel visible
    visible && imageWrapperInstance.getChannelIndex(
      channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C] as number,
    )
  ));
  const autoTargetResolution = imageWrapperInstance.getAutoTargetResolution();
  const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION] as number | null;
  const resolution = (targetResolution === null || Number.isNaN(targetResolution))
    ? autoTargetResolution
    : targetResolution;
  const allChannels: unknown[] = image!.image.loaders[0].channels ?? [];

  // Get the Clipping Planes
  let xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X] as [number, number] | null;
  let ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y] as [number, number] | null;
  let zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z] as [number, number] | null;

  xSlice = xSlice !== null ? xSlice : [-1, 100000];
  ySlice = ySlice !== null ? ySlice : [-1, 100000];
  zSlice = zSlice !== null ? zSlice : [-1, 100000];

  return {
    channelsVisible,
    allChannels,
    channelTargetC,
    resolution,
    data,
    colors,
    contrastLimits,
    is3dMode,
    renderingMode,
    layerTransparency,
    xSlice,
    ySlice,
    zSlice,
  };
}

export function useVolumeSettings(
  props: SpatialThreeProps,
  volumeSettings: VolumeSettings,
  setVolumeSettings: (v: VolumeSettings) => void,
  dataReady: boolean,
  setDataReady: (v: boolean) => void,
) {
  const {
    images = {},
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
  } = props;
  const layerScope = imageLayerScopes![0];
  const channelScopes = imageChannelScopesByLayer![layerScope];
  const layerCoordination = imageLayerCoordination![0][layerScope];
  const channelCoordination = imageChannelCoordination![0][layerScope];

  const {
    channelsVisible,
    allChannels,
    channelTargetC,
    resolution,
    data,
    colors,
    contrastLimits,
    is3dMode,
    renderingMode,
    layerTransparency,
    xSlice,
    ySlice,
    zSlice,
  } = extractInformationFromProps(layerScope, layerCoordination, channelScopes,
    channelCoordination, images[layerScope], props);
  // TODO: Find a better and more efficient way to compare the Strings here
  if (channelTargetC !== null) {
    // TODO: stop using string equality for comparisons.
    if (
      volumeSettings.channelTargetC?.length !== 0
      && (
        volumeSettings.channelTargetC?.toString() !== channelTargetC.toString()
        || volumeSettings.resolution?.toString() !== resolution.toString()
      )
    ) {
      if (!dataReady) setDataReady(true);
      // TODO: stop using string equality for comparisons.
    } else if (
      volumeSettings.channelsVisible?.toString() !== channelsVisible?.toString()
      || volumeSettings.colors?.toString() !== colors?.toString()
      || volumeSettings.is3dMode !== is3dMode
      || volumeSettings.contrastLimits?.toString() !== contrastLimits?.toString()
      || volumeSettings.renderingMode?.toString() !== renderingMode.toString()
      || volumeSettings.layerTransparency.toString() !== layerTransparency.toString()
      || volumeSettings.xSlice?.toString() !== xSlice.toString()
      || volumeSettings.ySlice?.toString() !== ySlice.toString()
      || volumeSettings.zSlice?.toString() !== zSlice.toString()
    ) {
      setVolumeSettings({
        channelsVisible,
        allChannels,
        channelTargetC,
        resolution,
        data,
        colors,
        contrastLimits,
        is3dMode,
        renderingMode,
        layerTransparency,
        xSlice,
        ySlice,
        zSlice,
      });
      setDataReady(false);
    }
  }
  return {
    images,
    layerScope,
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
    channelsVisible,
    allChannels,
    channelTargetC,
    resolution,
    data,
    colors,
    contrastLimits,
    is3dMode,
    renderingMode,
    layerTransparency,
    xSlice,
    ySlice,
    zSlice,
  };
}

function getMinMaxValue(value: number, minMax: number[]): number {
  const [min, max] = minMax;
  return (value - min) / Math.sqrt((max ** 2) - (min ** 2));
}

function setUniformsTextures(
  uniforms: UniformMap,
  textures: Data3DTexture[],
  volume: Volume,
  volConfig: VolumeConfig,
  renderstyle: number,
  contrastLimits: number[][],
  colors: number[][],
  layerTransparency: number,
  xSlice: [number, number],
  ySlice: [number, number],
  zSlice: [number, number],
  meshScale: number[],
  originalScale: number[],
) {
  uniforms.boxSize.value.set(volume.xLength, volume.yLength, volume.zLength);
  // can be done better
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex.value = textures.length > 0 ? textures[0] : null;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex2.value = textures.length > 1 ? textures[1] : null;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex3.value = textures.length > 2 ? textures[2] : null;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex4.value = textures.length > 3 ? textures[3] : null;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex5.value = textures.length > 4 ? textures[4] : null;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeTex6.value = textures.length > 5 ? textures[5] : null;
  //
  // eslint-disable-next-line no-param-reassign
  uniforms.near.value = 0.1;
  // eslint-disable-next-line no-param-reassign
  uniforms.far.value = 3000;
  // eslint-disable-next-line no-param-reassign
  uniforms.alphaScale.value = 1.0;
  // eslint-disable-next-line no-param-reassign
  uniforms.dtScale.value = layerTransparency;
  // eslint-disable-next-line no-param-reassign
  uniforms.finalGamma.value = 4.5;
  // eslint-disable-next-line no-param-reassign
  uniforms.volumeCount.value = textures.length;
  // eslint-disable-next-line no-param-reassign
  uniforms.u_size.value.set(volume.xLength, volume.yLength, volume.zLength);
  // eslint-disable-next-line no-param-reassign
  uniforms.u_stop_geom.value = null;
  // eslint-disable-next-line no-param-reassign
  uniforms.u_window_size.value.set(0, 0);
  // Normalize by the largest side and then address the phsyical dimension TODO change
  uniforms.u_vol_scale.value.set(1.0 / volume.xLength, 1.0 / volume.yLength, 1.0 / volume.zLength * 2.0);
  // eslint-disable-next-line no-param-reassign
  uniforms.u_renderstyle.value = renderstyle;

  uniforms.u_clim.value.set(contrastLimits.length > 0 ? contrastLimits[0][0] : null, contrastLimits.length > 0 ? contrastLimits[0][1] : null);
  uniforms.u_clim2.value.set(contrastLimits.length > 1 ? contrastLimits[1][0] : null, contrastLimits.length > 1 ? contrastLimits[1][1] : null);
  uniforms.u_clim3.value.set(contrastLimits.length > 2 ? contrastLimits[2][0] : null, contrastLimits.length > 2 ? contrastLimits[2][1] : null);
  uniforms.u_clim4.value.set(contrastLimits.length > 3 ? contrastLimits[3][0] : null, contrastLimits.length > 3 ? contrastLimits[3][1] : null);
  uniforms.u_clim5.value.set(contrastLimits.length > 4 ? contrastLimits[4][0] : null, contrastLimits.length > 4 ? contrastLimits[4][1] : null);
  uniforms.u_clim6.value.set(contrastLimits.length > 5 ? contrastLimits[5][0] : null, contrastLimits.length > 5 ? contrastLimits[5][1] : null);


  uniforms.u_xClip.value.set(xSlice[0] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength,
    xSlice[1] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength);
  uniforms.u_yClip.value.set(ySlice[0] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength,
    ySlice[1] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength);
  uniforms.u_zClip.value.set(zSlice[0] * (1.0 / meshScale[2]) / originalScale[2] * volume.zLength,
    zSlice[1] * (1.0 / meshScale[1]) / originalScale[2] * volume.zLength);

  uniforms.u_color.value.set(colors.length > 0 ? colors[0][0] : null,
    colors.length > 0 ? colors[0][1] : null,
    colors.length > 0 ? colors[0][2] : null);
  uniforms.u_color2.value.set(colors.length > 1 ? colors[1][0] : null,
    colors.length > 1 ? colors[1][1] : null,
    colors.length > 1 ? colors[1][2] : null);
  uniforms.u_color3.value.set(colors.length > 2 ? colors[2][0] : null,
    colors.length > 2 ? colors[2][1] : null,
    colors.length > 2 ? colors[2][2] : null);
  uniforms.u_color4.value.set(colors.length > 3 ? colors[3][0] : null,
    colors.length > 3 ? colors[3][1] : null,
    colors.length > 3 ? colors[3][2] : null);
  uniforms.u_color5.value.set(colors.length > 4 ? colors[4][0] : null,
    colors.length > 4 ? colors[4][1] : null,
    colors.length > 4 ? colors[4][2] : null);
  uniforms.u_color6.value.set(colors.length > 5 ? colors[5][0] : null,
    colors.length > 5 ? colors[5][1] : null,
    colors.length > 5 ? colors[5][2] : null);
}

export function create3DRendering(
  volumes: Map<number | false, Volume>,
  channelTargetC: (number | false)[],
  channelsVisible: boolean[],
  colors: number[][],
  textures: Map<number | false, Data3DTexture>,
  contrastLimits: number[][],
  volumeMinMax: Map<number | false, number[]>,
  scaleOrUndefined: Array<{ size: number }> | null | undefined,
  renderstyle: number,
  layerTransparency: number,
  xSlice: [number, number],
  ySlice: [number, number],
  zSlice: [number, number],
  originalScale: number[],
): [UniformMap, typeof VolumeRenderShaderPerspective, [number, number, number], [number, number, number], [number, number, number]] | null {
  const texturesList: Data3DTexture[] = [];
  const colorsSave: number[][] = [];
  const contrastLimitsList: number[][] = [];
  let volume: Volume | null = null;
  let scale = scaleOrUndefined;
  if (scale === undefined || scale === null || !Array.isArray(scale) || scale.length < 3) {
    scale = [
      { size: scale?.[0]?.size ?? 1 },
      { size: scale?.[1]?.size ?? 1 },
      { size: scale?.[2]?.size ?? 1 },
    ];
  } else {
    for (let i = 0; i < scale.length; i++) {
      if (!scale[i] || scale[i].size === undefined || scale[i].size === null) {
        scale[i] = { size: 1 };
      }
    }
  }
  channelTargetC.forEach((channel, id) => { // load on demand new channels or load all there are?? - Check VIV for it
    if (channelsVisible[id]) { // check if the channel has been loaded already or if there should be a new load
      volume = volumes.get(channel)!;
      // set textures, set volume, contrastLimits, colors
      texturesList.push(textures.get(channel)!); // Could be done better but for now we try this
      colorsSave.push([colors[id][0] / 255, colors[id][1] / 255, colors[id][2] / 255]);
      if (contrastLimits[id][0] === 0 && contrastLimits[id][1] === 255) { // Initial State TODO change??
        contrastLimitsList.push([getMinMaxValue(volumeMinMax.get(channel)![0], volumeMinMax.get(channel)!),
          getMinMaxValue(volumeMinMax.get(channel)![1], volumeMinMax.get(channel)!)]);
      } else {
        contrastLimitsList.push([getMinMaxValue(contrastLimits[id][0], volumeMinMax.get(channel)!),
          getMinMaxValue(contrastLimits[id][1], volumeMinMax.get(channel)!)]);
      }
    }
  });
  if (volume === null) {
    return null;
  }
  // TypeScript can't narrow `volume` after forEach assignment, assert non-null
  const vol = volume as Volume;
  const volconfig: VolumeConfig = {
    clim1: 0.01,
    clim2: 0.7,
    isothreshold: 0.15,
    opacity: 1.0,
    colormap: 'gray',
  };
  const shader = VolumeRenderShaderPerspective;
  const uniforms = UniformsUtils.clone(shader.uniforms);
  setUniformsTextures(uniforms, texturesList, vol, volconfig, renderstyle, contrastLimitsList, colorsSave, layerTransparency,
    xSlice, ySlice, zSlice, [scale![0].size, scale![1].size, scale![2] ? scale![2].size : 1.0], originalScale);
  return [
    uniforms,
    shader,
    [1, scale![1].size / scale![0].size, scale![2] ? scale![2].size / scale![0].size : 1.0] as [number, number, number],
    [vol.xLength, vol.yLength, vol.zLength] as [number, number, number],
    [1.0, vol.yLength / vol.xLength, vol.zLength / vol.xLength] as [number, number, number],
  ];
}

const dtypeToTypedArray: Record<string, new (size: number) => TypedArray> = {
  Uint8: Uint8Array,
  Uint16: Uint16Array,
  Uint32: Uint32Array,
  Int8: Int8Array,
  Int16: Int16Array,
  Int32: Int32Array,
  Float32: Float32Array,
  Float64: Float64Array,
};

// TODO: Use the imported function from VIV: Ask Trevor how to get there
async function getVolumeIntern({
  source,
  selection,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUpdate = () => {},
  downsampleDepth = 1,
  signal,
}: {
  source: VolumeSource;
  selection: Record<string, number>;
  onUpdate?: (info: { z: number; total: number; progress: number }) => void;
  downsampleDepth?: number;
  signal?: AbortSignal;
}) {
  const { shape, labels, dtype } = source;
  // VolumeSource is a subset of PixelSource — the loader implements the full interface at runtime.
  const { height, width } = viv.getImageSize(source as Parameters<typeof viv.getImageSize>[0]);
  const depth = shape[labels.indexOf('z')];
  const depthDownsampled = Math.max(1, Math.floor(depth / downsampleDepth));
  const rasterSize = height * width;
  const TypedArrayClass = dtypeToTypedArray[dtype];
  const volumeData = new TypedArrayClass(rasterSize * depthDownsampled);
  await Promise.all(
    new Array(depthDownsampled).fill(0).map(async (_: unknown, z: number) => {
      const depthSelection = {
        ...selection,
        z: z * downsampleDepth,
      };
      const { data: rasterData } = await source.getRaster({
        selection: depthSelection,
        signal,
      });
      let r = 0;
      onUpdate({ z, total: depthDownsampled, progress: 0.5 });
      // For now this process fills in each raster plane anti-diagonally transposed.
      // This is to ensure that the image looks right in three dimensional space.
      while (r < rasterSize) {
        const volIndex = z * rasterSize + (rasterSize - r - 1);
        const rasterIndex = ((width - r - 1) % width) + width * Math.floor(r / width);
        volumeData[volIndex] = rasterData[rasterIndex];
        r += 1;
      }
      onUpdate({ z, total: depthDownsampled, progress: 1 });
    }),
  );
  return {
    data: volumeData,
    height,
    width,
    depth: depthDownsampled,
  };
}


function getVolumeByChannel(channel: number | false, resolution: number, loader: VolumeSource[]) {
  return getVolumeIntern({
    source: loader[resolution],
    selection: { t: 0, c: channel as number }, // corresponds to the first channel of the first timepoint
    downsampleDepth: 2 ** resolution,
  });
}

function getVolumeFromOrigin(volumeOrigin: { width: number; height: number; depth: number; data: TypedArray }) {
  const volume = new Volume();
  volume.xLength = volumeOrigin.width;
  volume.yLength = volumeOrigin.height;
  volume.zLength = volumeOrigin.depth;
  volume.data = volumeOrigin.data;
  return volume;
}

function getData3DTexture(volume: Volume) {
  const texture = new Data3DTexture(volume.data as BufferSource, volume.xLength, volume.yLength, volume.zLength);
  texture.format = RedFormat;
  texture.type = FloatType;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  // texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

function getPhysicalSizeScalingMatrix(loader: VolumeSource & { meta?: { physicalSizes?: Record<string, number | undefined> } }): Array<{ size: number }> {
  const { x, y, z } = loader?.meta?.physicalSizes ?? {};
  return [{ size: x ?? 1 }, { size: y ?? 1 }, { size: z ?? 1 }];
}


function minMaxVolume(volume: Volume) {
  // get the min and max intensities
  const [min, max] = volume.computeMinMax();

  const dataASFloat32 = new Float32Array(volume.data.length);
  for (let i = 0; i < volume.data.length; i++) {
    dataASFloat32[i] = (volume.data[i] - min) / Math.sqrt((max ** 2) - (min ** 2));
  }
  return dataASFloat32;
}

export async function initialDataLoading(
  channelTargetC: (number | false)[],
  resolution: number,
  data: VolumeSource[],
  volumes: Map<number | false, Volume>,
  textures: Map<number | false, Data3DTexture>,
  volumeMinMax: Map<number | false, number[]>,
  oldResolution: number | null,
): Promise<[Map<number | false, Volume>, Map<number | false, Data3DTexture>, Map<number | false, number[]>, Array<{ size: number }> | null, number[]]> {
  let volume: Volume | null = null;
  let scale: Array<{ size: number }> | null = null;
  const { shape, labels } = data[0];
  const channelsToLoad = channelTargetC
    .filter(channel => !volumes.has(channel) || resolution !== oldResolution);
  const volumeOrigins = await Promise.all(
    channelsToLoad
      .map(channel => getVolumeByChannel(channel, resolution, data)),
  );
  // load on demand new channels or load all there are?? - Check VIV for it
  channelsToLoad.forEach((channel, channelIndex) => {
    const volumeOrigin = volumeOrigins[channelIndex];
    volume = getVolumeFromOrigin(volumeOrigin);
    const minMax = volume.computeMinMax();
    volume.data = minMaxVolume(volume); // Have the data between 0 and 1
    volumes.set(channel, volume);
    textures.set(channel, getData3DTexture(volume));
    volumeMinMax.set(channel, minMax);
    scale = getPhysicalSizeScalingMatrix(data[resolution]);
  });
  return [volumes, textures, volumeMinMax, scale,
    [shape[labels.indexOf('x')], shape[labels.indexOf('y')], shape[labels.indexOf('z')]]];
}


export function stringifyLineData(lineData: MeasureLineData): string {
  return `${lineData.startPoint.x},${lineData.startPoint.y},${lineData.startPoint.z};${lineData.endPoint.x},${lineData.endPoint.y},${lineData.endPoint.z}`;
}

type OptionalNumber = number | undefined

export function isValidGeometrySize(size: unknown): size is [OptionalNumber, OptionalNumber, OptionalNumber, OptionalNumber, OptionalNumber, OptionalNumber] {
  if (!Array.isArray(size) || size.length !== 6) {
    return false;
  }
  return size.every(s => typeof s === 'number' || s === undefined);
}
