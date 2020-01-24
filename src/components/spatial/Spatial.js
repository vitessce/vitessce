import React from 'react';

import {
  ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, BitmapLayer, BaseTileLayer,
} from 'deck.gl';
import { load } from '@loaders.gl/core';
import { Texture2D } from '@luma.gl/webgl';
import GL from '@luma.gl/constants';
import { slice, openArray } from 'zarr';
import { SelectablePolygonLayer, XRLayer } from '../../layers';
import { tileToBoundingBox, getTileIndices } from './tiling-utils';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';

const zarrArraysCache = {};

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

// TODO: Clean all this up with
// https://github.com/hubmapconsortium/vitessce/issues/422
// and creation of new NPM published component
// Currently this function fetches the channels from a set of zarr files whose
// location is passed in as a config for a single "tile index"
async function getTexture({
  config, gl, tileSize, x, y, stride, tilingWidth,
}) {
  const xStride = stride * tilingWidth * y + stride * x;
  const yStride = stride * tilingWidth * y + stride * (x + 1);
  const arrSlice = slice(xStride, yStride);
  const zarrKey = config.zarrConfig.store + config.zarrConfig.path;
  if (!(zarrKey in zarrArraysCache)) {
    zarrArraysCache[zarrKey] = await openArray(config.zarrConfig);
  }
  const arr = zarrArraysCache[zarrKey];
  const dataSlice = await arr.get([arrSlice]);
  const { data } = dataSlice;
  const isInt8 = data instanceof Uint8Array;
  const isInt16 = data instanceof Uint16Array;
  const isInt32 = data instanceof Uint32Array;
  const formats = {
    format: (isInt8 && GL.R8UI)
         || (isInt16 && GL.R16UI)
         || (isInt32 && GL.R32UI),
    dataFormat: GL.RED_INTEGER,
    type: (isInt8 && GL.UNSIGNED_BYTE)
          || (isInt16 && GL.UNSIGNED_SHORT)
          || (isInt32 && GL.UNSIGNED_INT),
  };
  const { channelType } = config;
  const texObj = {};
  texObj[channelType] = new Texture2D(gl, {
    width: tileSize,
    height: tileSize,
    data,
    // We don't want or need mimaps.
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
    mipmaps: false,
    parameters: {
      // NEAREST for integer data
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
    },
    ...formats,
  });
  return texObj;
}

function loadZarr({
  sourceChannels, tileSize, x, y, z, width, gl,
}) {
  const tilingWidth = Math.ceil(width / (tileSize * (2 ** z)));
  const textureNames = ['redTexture', 'greenTexture', 'blueTexture'];
  const configList = sourceChannels.map((channel, i) => ({
    channelName: channel.name,
    channelType: textureNames[i],
    zarrConfig: {
      store: `${channel.tileSource}/`,
      path: `pyramid_${z}.zarr`,
      mode: 'r',
    },
  }));
  const stride = tileSize * tileSize;
  // eslint-disable-next-line  arrow-body-style
  const configListPromises = configList.map((config) => {
    return getTexture({
      config, gl, tileSize, x, y, stride, tilingWidth,
    });
  });
  return Promise.all(configListPromises).then(list => list);
}


/**
 React component which expresses the spatial relationships between cells and molecules.
 */
export default class Spatial extends AbstractSelectableComponent {
  constructor(props) {
    super(props);
    this.state.layerIsVisible = {
      molecules: true,
      cells: true,
      neighborhoods: false,
      raster: false,
    };

    // In Deck.gl, layers are considered light weight, and
    // can be created and destroyed quickly, if the data they wrap is stable.
    // https://deck.gl/#/documentation/developer-guide/using-layers?section=creating-layer-instances-is-cheap
    this.moleculesData = [];
    this.cellsData = [];
    this.neighborhoodsData = [];
    this.images = [];
    this.raster = [];
    this.maxHeight = 0;
    this.maxWidth = 0;
    this.setLayerIsVisible = this.setLayerIsVisible.bind(this);
    this.getInitialViewState = this.getInitialViewState.bind(this);
  }

  static defaultProps = {
    clearPleaseWait: (layer) => { console.warn(`"clearPleaseWait" not provided; layer: ${layer}`); },
    cellRadius: 10,
  };


  componentDidUpdate() {
    if (!this.props.images) {
      return;
    }
    const imageNames = Object.keys(this.props.images);
    // Add imagery to layerIsVisible UI toggle list, if not already present.
    if (!(imageNames[0] in this.state.layerIsVisible)) {
      // This is not ideal, but it should be OK as long as the `if` prevents an infinite loop.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) => {
        imageNames.forEach((name) => {
          // TODO: Do not mutate! https://github.com/hubmapconsortium/vitessce/issues/148
          // eslint-disable-next-line no-param-reassign
          prevState.layerIsVisible[name] = true;
        });
        return prevState;
      });
    }
  }

  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return this.props.view;
  }

  // eslint-disable-next-line class-methods-use-this
  getCellCoords(cell) {
    return cell.xy;
  }

  // eslint-disable-next-line class-methods-use-this
  getCellBaseLayerId() {
    return 'base-polygon-layer';
  }

  renderCellLayer() {
    const {
      selectedCellIds = new Set(),
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
      updateCellsHover = (hoverInfo) => {
        console.warn(`Spatial updateCellsHover: ${hoverInfo.cellId}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Spatial updateCellsSelection: ${cellsSelection}`);
      },
      uuid = null,
    } = this.props;

    const { tool } = this.state;
    const { cellRadius } = this.props;

    return new SelectablePolygonLayer({
      id: 'polygon-layer',
      isSelected: cellEntry => (
        selectedCellIds.size
          ? selectedCellIds.has(cellEntry[0])
          : true // If nothing is selected, everything is selected.
      ),
      getPolygon(cellEntry) {
        const cell = cellEntry[1];
        return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], cellRadius);
      },
      stroked: false,
      getColor: cellEntry => (
        (this.props.cellColors && this.props.cellColors[cellEntry[0]]) || DEFAULT_COLOR
      ),
      onClick: (info) => {
        if (tool) {
          // If using a tool, prevent individual cell selection.
          // Let SelectionLayer handle the clicks instead.
          return;
        }
        const cellId = info.object[0];
        if (selectedCellIds.has(cellId)) {
          selectedCellIds.delete(cellId);
          updateCellsSelection(selectedCellIds);
        } else {
          selectedCellIds.add(cellId);
          updateCellsSelection(selectedCellIds);
        }
      },
      visible: this.state.layerIsVisible.cells,
      ...cellLayerDefaultProps(this.cellsData, updateStatus, updateCellsHover, uuid),
    });
  }

  renderMoleculesLayer() {
    const {
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
    } = this.props;

    const getColor = d => PALETTE[d[2] % PALETTE.length];
    return new ScatterplotLayer({
      id: 'scatter-plot',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: this.moleculesData,
      pickable: true,
      autoHighlight: true,
      getRadius: this.props.moleculeRadius,
      getPosition: d => [d[0], d[1], 0],
      getLineColor: getColor,
      getFillColor: getColor,
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
      visible: this.state.layerIsVisible.molecules,
    });
  }

  renderNeighborhoodsLayer() {
    return new PolygonLayer({
      id: 'neighborhoods-layer',
      getPolygon(neighborhoodsEntry) {
        const neighborhood = neighborhoodsEntry[1];
        return neighborhood.poly;
      },
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: this.neighborhoodsData,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getElevation: 0,
      getLineWidth: 10,
      visible: this.state.layerIsVisible.neighborhoods,
    });
  }

  renderImageLayers() {
    const layers = this.images.map(layer => this.createImageTileLayer(layer));
    return layers;
  }

  createImageTileLayer(layer) {
    const [layerType, source] = layer;
    const minZoom = Math.floor(-1 * Math.log2(Math.max(source.height, source.width)));
    return new BaseTileLayer({
      id: `${layerType}-${source.tileSource}-tile-layer`,
      pickable: true,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getTileData: ({ x, y, z }) => load(`${source.tileSource}/${layerType}_files/${z - minZoom}/${x}_${y}.jpeg`),
      // eslint-disable-next-line  arrow-body-style
      getTileIndices: (viewport, maxZoomLevel, minZoomLevel) => {
        return getTileIndices(viewport, maxZoomLevel, minZoomLevel,
          source.tileSize, source.width, source.height);
      },
      // eslint-disable-next-line  arrow-body-style
      tileToBoundingBox: (x, y, z) => {
        return tileToBoundingBox(x, y, z, source.height, source.width, source.tileSize);
      },
      minZoom,
      maxZoom: 0,
      visible: this.state.layerIsVisible[layerType],
      renderSubLayers: (props) => {
        const {
          bbox: {
            west, south, east, north,
          },
        } = props.tile;
        const bml = new BitmapLayer(props, {
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          data: null,
          image: props.data,
          bounds: [west, south, east, north],
        });
        return bml;
      },
    });
  }

  createRasterLayer() {
    const layerType = 'raster';
    const source = this.raster;
    if (source.height) {
      const propSettings = {
        height: source.height * source.tileSize,
        width: source.width * source.tileSize,
        tileSize: source.tileSize,
        sourceChannels: source.channels,
      };
      const minZoomLevel = Math.floor(
        -1 * Math.log2(Math.max(propSettings.height, propSettings.width)),
      );
      return new BaseTileLayer({
        id: `${layerType}-tile-layer`,
        pickable: false,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        // eslint-disable-next-line  arrow-body-style
        getTileData: ({ x, y, z }) => {
          return loadZarr({
            x, y, z: -1 * z, gl: this.state.gl, ...propSettings,
          });
        },
        // eslint-disable-next-line  arrow-body-style
        getTileIndices: (viewport, maxZoom, minZoom) => {
          return getTileIndices({
            viewport, maxZoom, minZoom, ...propSettings,
          });
        },
        // eslint-disable-next-line  arrow-body-style
        tileToBoundingBox: (x, y, z) => {
          return tileToBoundingBox({
            x, y, z, ...propSettings,
          });
        },
        minZoom: minZoomLevel,
        maxZoom: 0,
        visible: true,
        sliderValues: {
          redSliderValue: 10000,
          greenSliderValue: 10000,
          blueSliderValue: 10000,
        },
        renderSubLayers: (props) => {
          const {
            bbox: {
              west, south, east, north,
            },
          } = props.tile;
          const { sliderValues } = props;
          const xrl = new XRLayer(props, {
            id: `XR-Layer-w${west}-s${south}-e${east}-n${north}`,
            pickable: false,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            rgbTextures: props.data,
            sliderValues,
            bounds: [west, south, east, north],
            visible: true,
          });
          return xrl;
        },
      });
    }
    return null;
  }

  setLayerIsVisible(layers) {
    this.setState({ layers });
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    return (
      <LayersMenu
        layerIsVisible={this.state.layerIsVisible}
        setLayerIsVisible={this.setLayerIsVisible}
      />
    );
  }

  renderLayers() {
    const {
      molecules,
      cells,
      neighborhoods,
      images,
      clearPleaseWait,
      raster,
    } = this.props;
    // Process molecules data and cache into re-usable array.
    if (molecules && this.moleculesData.length === 0) {
      Object.entries(molecules).forEach(([molecule, coords], index) => {
        this.moleculesData = this.moleculesData.concat(
          coords.map(([x, y]) => [x, y, index, molecule]), // eslint-disable-line no-loop-func
          // Because we use the inner function immediately,
          // the eslint warning about closures is a red herring:
          // The index and molecule values are correct.
        );
      });
    }
    // Process cells data and cache into re-usable array.
    if (cells && this.cellsData.length === 0) {
      this.cellsData = Object.entries(cells);
    }
    // Process neighborhoods data and cache into re-usable array.
    if (neighborhoods && this.neighborhoodsData.length === 0) {
      this.neighborhoodsData = Object.entries(neighborhoods);
    }
    if (images && this.images.length === 0) {
      this.images = Object.entries(images);
    }
    if (raster && this.raster.length === 0) {
      this.raster = raster;
    }
    // Append each layer to the list.
    const layerList = [];

    if (images && clearPleaseWait) clearPleaseWait('images');
    layerList.push(...this.renderImageLayers());

    if (raster && clearPleaseWait) clearPleaseWait('raster');
    layerList.push(this.createRasterLayer());

    if (cells && clearPleaseWait) clearPleaseWait('cells');
    layerList.push(this.renderCellLayer());

    if (neighborhoods && clearPleaseWait) clearPleaseWait('neighborhoods');
    layerList.push(this.renderNeighborhoodsLayer());

    if (molecules && clearPleaseWait) clearPleaseWait('molecules');
    layerList.push(this.renderMoleculesLayer());

    return layerList;
  }
}
