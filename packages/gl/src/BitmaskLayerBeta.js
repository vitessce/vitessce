/* eslint-disable no-unused-vars */
import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { range } from 'lodash-es';
import { fs, vs } from './bitmask-layer-beta-shaders.js';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants.js';
import { multiSetsToTextureData } from './bitmask-utils.js';


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

function isEqualShallow(prevArr, nextArr) {
  if (prevArr === nextArr) {
    return true;
  }
  if (Array.isArray(prevArr) && Array.isArray(nextArr)) {
    if (prevArr.length === nextArr.length) {
      return !prevArr.some((v, i) => (v !== nextArr[i] && (
        (!Array.isArray(v) && !Array.isArray(nextArr[i]))
        || (v.length > 0 || nextArr[i].length > 0)
      )
      ));
    }
  }
  return prevArr === nextArr;
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
  multiMatrixObsIndex: { type: 'array', value: null, compare: true },
  setColorValues: { type: 'array', value: null, compare: true },
  channelFeatureValueColormaps: { type: 'array', value: null, compare: true },
  channelFeatureValueColormapRanges: { type: 'array', value: null, compare: true },
  channelIsStaticColorMode: { type: 'array', value: null, compare: true },
  channelIsSetColorMode: { type: 'array', value: null, compare: true },
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
    if (
      !isEqualShallow(props.multiFeatureValues, oldProps.multiFeatureValues)
      || !isEqualShallow(props.multiMatrixObsIndex, oldProps.multiMatrixObsIndex)
      || !isEqualShallow(props.setColorValues, oldProps.setColorValues)
      || !isEqualShallow(props.channelIsSetColorMode, oldProps.channelIsSetColorMode)
    ) {
      const {
        multiFeatureValues, multiMatrixObsIndex, setColorValues, channelIsSetColorMode,
      } = this.props;
      // Use one expressionTex for all channels,
      // using an offset mechanism.
      const [
        valueTex,
        colorTex,
        valueTexOffsets,
        colorTexOffsets,
        valueTexHeight,
        colorTexHeight,
      ] = this.multiSetsToTexture(
        multiFeatureValues,
        multiMatrixObsIndex,
        setColorValues,
        channelIsSetColorMode,
      );
      this.setState({
        valueTex,
        colorTex,
        valueTexOffsets,
        colorTexOffsets,
        valueTexHeight,
        colorTexHeight,
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
      zoom,
      minZoom,
      maxZoom,
      zoomOffset, // TODO: figure out if this needs to be used or not
    } = this.props;
    const {
      textures,
      model,
      // Expression and set index (and colors) textures with offsets
      valueTex,
      colorTex,
      valueTexOffsets,
      colorTexOffsets,
      valueTexHeight,
      colorTexHeight,
    } = this.state;
    // Render the image
    if (textures && model) {
      const scaleFactor = 1 / (2 ** (maxZoom - zoom));
      const colors = Object.fromEntries(range(MAX_CHANNELS).map(i => ([`color${i}`, getColor(channelColors[i])])));
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            ...colors,
            // Bitmask image channel data textures
            ...textures,
            multiFeatureTexSize: MULTI_FEATURE_TEX_SIZE,
            // Expression textures with offsets
            valueTex,
            valueTexOffsets: padWithDefault(
              valueTexOffsets,
              0,
              MAX_CHANNELS - valueTexOffsets.length,
            ),
            valueTexHeight,
            // Set indices and colors textures with offsets
            colorTex,
            colorTexOffsets: padWithDefault(
              colorTexOffsets,
              0,
              MAX_CHANNELS - colorTexOffsets.length,
            ),
            colorTexHeight,
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

  multiSetsToTexture(
    multiFeatureValues,
    multiMatrixObsIndex,
    setColorValues,
    channelIsSetColorMode,
  ) {
    const isWebGL2On = isWebGL2(this.context.gl);

    const [
      totalData,
      valueTexHeight,
      indicesOffsets,
      totalColors,
      colorTexHeight,
      colorsOffsets,
    ] = multiSetsToTextureData(
      multiFeatureValues,
      multiMatrixObsIndex,
      setColorValues,
      channelIsSetColorMode,
      MULTI_FEATURE_TEX_SIZE,
    );

    return [
      // Color indices texture
      new Texture2D(this.context.gl, {
        width: MULTI_FEATURE_TEX_SIZE,
        height: valueTexHeight,
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
        height: colorTexHeight,
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
      valueTexHeight,
      colorTexHeight,
    ];
  }
}
BitmaskLayer.layerName = 'BitmaskLayer';
BitmaskLayer.defaultProps = defaultProps;
