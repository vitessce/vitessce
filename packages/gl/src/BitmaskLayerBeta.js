/* eslint-disable no-unused-vars */
import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { fromEntries } from '@vitessce/utils';
import { range } from 'lodash-es';
import { extent } from 'd3-array';
import { fs, vs } from './bitmask-layer-beta-shaders.js';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants.js';

const MAX_CHANNELS = 7;
const MULTI_FEATURE_TEX_SIZE = 2048;

function padWithDefault(arr, defaultValue, padWidth) {
  const newArr = [...arr];
  for (let i = 0; i < padWidth; i += 1) {
    newArr.push(defaultValue);
  }
  return newArr;
}

function getColor(arr) {
  return arr ? arr.map(v => v / 255) : [0, 0, 0];
}

function normalize(arr) {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(
    arr.map(i => Math.floor((i - min) * ratio)),
  );
  return data;
}

const defaultProps = {
  channelStrokeWidths: { type: 'array', value: null, compare: true },
  channelsFilled: { type: 'array', value: null, compare: true },
  channelOpacities: { type: 'array', value: null, compare: true },
  channelColors: { type: 'array', value: null, compare: true },
  hoveredCell: { type: 'number', value: null, compare: true },
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  expressionData: { type: 'object', value: null, compare: true },
  multiFeatureValues: { type: 'array', value: null, compare: true },
  setColorValues: { type: 'array', value: null, compare: true },
  channelFeatureValueColormaps: { type: 'array', value: null, compare: true },
  channelFeatureValueColormapRanges: { type: 'array', value: null, compare: true },
  channelIsStaticColorMode: { type: 'array', value: null, compare: true },
};

/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
export default class BitmaskLayer extends XRLayer {
  // eslint-disable-next-line class-methods-use-this
  getShaders() {
    const { colormap } = this.props;
    return {
      fs,
      vs,
      modules: [project32, picking],
      defines: {
        [COLORMAP_SHADER_PLACEHOLDER]: GLSL_COLORMAPS.includes(colormap)
          ? colormap
          : GLSL_COLORMAP_DEFAULT,
      },
    };
  }

  /**
   * Override the parent loadChannelTextures to enable
   * up to eight channels (rather than six).
   * Reference: https://github.com/hms-dbmi/viv/blob/v0.13.3/packages/layers/src/xr-layer/xr-layer.js#L316
  */
  loadChannelTextures(channelData) {
    const textures = {
      channel0: null,
      channel1: null,
      channel2: null,
      channel3: null,
      channel4: null,
      channel5: null,
      channel6: null,
    };
    if (this.state.textures) {
      Object.values(this.state.textures).forEach(tex => tex && tex.delete());
    }
    if (channelData
      && Object.keys(channelData).length > 0
      && channelData.data
    ) {
      channelData.data.forEach((d, i) => {
        textures[`channel${i}`] = this.dataToTexture(
          d,
          channelData.width,
          channelData.height,
        );
      }, this);
      this.setState({ textures });
    }
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (props.multiFeatureValues !== oldProps.multiFeatureValues) {
      const { multiFeatureValues } = this.props;
      // Use one expressionTex for all channels,
      // using an offset mechanism.
      const [expressionTex, expressionTexOffsets, expressionTexHeight] = this.multiDataToTexture(
        multiFeatureValues,
      );
      this.setState({ expressionTex, expressionTexOffsets, expressionTexHeight });
    }
    if (props.setColorValues !== oldProps.setColorValues) {
      const { setColorValues } = this.props;
      // Use one setColorIndexTex for all channels,
      // using an offset mechanism.
      const [
        setIndicesTex, setColorTex,
        setIndicesOffsets, setColorOffsets,
        setIndicesTexHeight, setColorTexHeight,
      ] = this.multiSetsToTexture(
        setColorValues,
      );
      this.setState({
        setIndicesTex, setColorTex,
        setIndicesOffsets, setColorOffsets,
        setIndicesTexHeight, setColorTexHeight,
      });
    }
    if (props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      // eslint-disable-next-line no-underscore-dangle
      this.setState({ model: this._getModel(gl) });

      this.getAttributeManager().invalidateAll();
    }
  }

  draw(opts) {
    const { uniforms } = opts;
    const {
      channelStrokeWidths,
      channelsFilled,
      channelOpacities,
      channelColors,
      channelsVisible,
      // TODO: use `channelFeatureValueColormaps` in shader,
      // figure out how to call multiple GLSL colormap functions
      channelFeatureValueColormaps,
      channelFeatureValueColormapRanges,
      channelIsStaticColorMode,
      channelIsSetColorMode,
      hoveredCell,
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
      cellTexHeight,
      cellTexWidth,
      zoom,
      minZoom,
      maxZoom,
      zoomOffset, // TODO: figure out if this needs to be used or not
    } = this.props;
    const {
      textures, model,
      // Expression textures with offsets
      expressionTex, expressionTexOffsets, expressionTexHeight,
      // Set indices and colors textures with offsets
      setIndicesTex, setColorTex,
      setIndicesOffsets, setColorOffsets,
      setIndicesTexHeight, setColorTexHeight,
    } = this.state;
    // Render the image
    if (textures && model) {
      const scaleFactor = 1 / (2 ** (maxZoom - zoom));
      const colors = fromEntries(range(MAX_CHANNELS).map(i => ([`color${i}`, getColor(channelColors[i])])));
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            ...colors,
            // Bitmask image channel data textures
            ...textures,
            multiFeatureTexSize: MULTI_FEATURE_TEX_SIZE,
            // Expression textures with offsets
            expressionTex,
            expressionTexOffsets: padWithDefault(expressionTexOffsets, 0, MAX_CHANNELS - expressionTexOffsets.length),
            expressionTexHeight,
            // Set indices and colors textures with offsets
            setIndicesTex,
            setColorTex,
            setIndicesOffsets: padWithDefault(setIndicesOffsets, 0, MAX_CHANNELS - setIndicesOffsets.length),
            setColorOffsets: padWithDefault(setColorOffsets, 0, MAX_CHANNELS - setColorOffsets.length),
            setIndicesTexHeight,
            setColorTexHeight,
            // Visualization properties
            channelsFilled: padWithDefault(
              channelsFilled,
              true,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelsFilled.length,
            ),
            channelOpacities: padWithDefault(
              channelOpacities,
              0.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelOpacities.length,
            ),
            channelStrokeWidths: padWithDefault(
              channelStrokeWidths,
              1.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelStrokeWidths.length,
            ),
            channelColormapRangeStarts: padWithDefault(
              channelFeatureValueColormapRanges.map(r => r?.[0] || 0.0),
              0.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelFeatureValueColormapRanges.length,
            ),
            channelColormapRangeEnds: padWithDefault(
              channelFeatureValueColormapRanges.map(r => r?.[1] || 1.0),
              1.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelFeatureValueColormapRanges.length,
            ),
            channelIsStaticColorMode: padWithDefault(
              channelIsStaticColorMode,
              true,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelIsStaticColorMode.length,
            ),
            channelIsSetColorMode: padWithDefault(
              channelIsSetColorMode,
              false,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelIsSetColorMode.length,
            ),
            hovered: hoveredCell || 0,
            colorTexHeight: cellTexHeight,
            colorTexWidth: cellTexWidth,
            channelsVisible: padWithDefault(
              channelsVisible,
              false,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelsVisible.length,
            ),
            // uColorScaleRange: [colorScaleLo, colorScaleHi],
            // uIsExpressionMode: isExpressionMode,
            // uIsOutlined: false,
            scaleFactor,
          }),
        )
        .draw();
    }
  }

  /**
   * This function creates textures from the data
   */
  dataToTexture(data, width, height) {
    const isWebGL2On = isWebGL2(this.context.gl);
    return new Texture2D(this.context.gl, {
      width,
      height,
      // Only use Float32 so we don't have to write two shaders
      data: new Float32Array(data),
      // we don't want or need mimaps
      mipmaps: false,
      parameters: {
        // NEAREST for integer data
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        // CLAMP_TO_EDGE to remove tile artifacts
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
      },
      format: isWebGL2On ? GL.R32F : GL.LUMINANCE,
      dataFormat: isWebGL2On ? GL.RED : GL.LUMINANCE,
      type: GL.FLOAT,
    });
  }

  multiDataToTexture(data) {
    const isWebGL2On = isWebGL2(this.context.gl);
    const totalLength = data.reduce((a, h) => a + h.length, 0); // Throw error if too large
    const texHeight = Math.max(2, Math.ceil(totalLength / MULTI_FEATURE_TEX_SIZE));
    if (texHeight > MULTI_FEATURE_TEX_SIZE) {
      console.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
    }
    const totalData = new Uint8Array(MULTI_FEATURE_TEX_SIZE * texHeight);
    const offsets = [];
    let offset = 0;
    data.forEach((featureArr) => {
      // TODO: use normalized values
      totalData.set(normalize(featureArr), offset);
      offsets.push(offset);
      offset += featureArr.length;
    });
    return [
      new Texture2D(this.context.gl, {
        width: MULTI_FEATURE_TEX_SIZE,
        height: texHeight,
        // Only use Float32 so we don't have to write two shaders
        data: new Float32Array(totalData),
        // we don't want or need mimaps
        mipmaps: false,
        parameters: {
          // NEAREST for integer data
          [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
          [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
          // CLAMP_TO_EDGE to remove tile artifacts
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
        },
        format: isWebGL2On ? GL.R32F : GL.LUMINANCE,
        dataFormat: isWebGL2On ? GL.RED : GL.LUMINANCE,
        type: GL.FLOAT,
      }),
      offsets,
      texHeight,
    ];
  }

  multiSetsToTexture(data) {
    const isWebGL2On = isWebGL2(this.context.gl);
    const totalIndicesLength = data.reduce((a, h) => a + h.setColorIndices.size, 0); // Throw error if too large
    const totalColorLength = data.reduce((a, h) => a + h.setColors.length * 3, 0); // Throw error if too large
    const texIndicesHeight = Math.max(2, Math.ceil(totalIndicesLength / MULTI_FEATURE_TEX_SIZE));
    const texColorHeight = Math.max(2, Math.ceil(totalColorLength / MULTI_FEATURE_TEX_SIZE));
    if (texIndicesHeight > MULTI_FEATURE_TEX_SIZE) {
      console.error('Error: length of concatenated quantitative feature values larger than maximum texture size');
    }
    // Array for texture containing color indices.
    const totalData = new Uint8Array(MULTI_FEATURE_TEX_SIZE * texIndicesHeight);
    // Array for texture containing color RGB values.
    const totalColors = new Uint8Array(MULTI_FEATURE_TEX_SIZE * texColorHeight);
    // Per-channel offsets into the texture arrays.
    const indicesOffsets = [];
    const colorsOffsets = []; // Color offsets need to be multiplied by 3 in the shader.
    let indexOffset = 0;
    let colorOffset = 0;
    // Iterate over the data for each channel.
    data.forEach((dataObj) => {
      const { setColorIndices, setColors } = dataObj;
      for(let i = 0; i < setColorIndices.size; i ++) {
        // TODO: should one be added here to account for background pixel value?
        // TODO: should another one be added to account for "null" (i.e., a cell that does not belong to any selected set).
        totalData[indexOffset + i] = setColorIndices.get(String(i+1));
      }
      for(let i = 0; i < setColors.length; i ++) {
        totalColors[(colorOffset + i) * 3 + 0] = setColors[i].color[0];
        totalColors[(colorOffset + i) * 3 + 1] = setColors[i].color[1];
        totalColors[(colorOffset + i) * 3 + 2] = setColors[i].color[2];
      }
      indicesOffsets.push(indexOffset);
      colorsOffsets.push(colorOffset);
      indexOffset += setColorIndices.size;
      colorOffset += setColors.length;
    });

    return [
      // Color indices texture
      new Texture2D(this.context.gl, {
        width: MULTI_FEATURE_TEX_SIZE,
        height: texIndicesHeight,
        // Only use Float32 so we don't have to write two shaders
        data: new Float32Array(totalData),
        // we don't want or need mimaps
        mipmaps: false,
        parameters: {
          // NEAREST for integer data
          [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
          [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
          // CLAMP_TO_EDGE to remove tile artifacts
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
        },
        format: isWebGL2On ? GL.R32F : GL.LUMINANCE,
        dataFormat: isWebGL2On ? GL.RED : GL.LUMINANCE,
        type: GL.FLOAT,
      }),
      // Colors texture
      new Texture2D(this.context.gl, {
        width: MULTI_FEATURE_TEX_SIZE,
        height: texColorHeight,
        // Only use Float32 so we don't have to write two shaders
        data: new Float32Array(totalColors),
        // we don't want or need mimaps
        mipmaps: false,
        parameters: {
          // NEAREST for integer data
          [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
          [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
          // CLAMP_TO_EDGE to remove tile artifacts
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
        },
        format: isWebGL2On ? GL.R32F : GL.LUMINANCE,
        dataFormat: isWebGL2On ? GL.RED : GL.LUMINANCE,
        type: GL.FLOAT,
      }),
      // Offsets
      indicesOffsets,
      colorsOffsets,
      // Texture heights
      texIndicesHeight,
      texColorHeight,
    ];
  }
}
BitmaskLayer.layerName = 'BitmaskLayer';
BitmaskLayer.defaultProps = defaultProps;
