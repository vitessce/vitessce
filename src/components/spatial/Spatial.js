import React from 'react';

import {
  ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, BitmapLayer, BaseTileLayer,
} from 'deck.gl';
import { MicroscopyViewerLayer } from '@hubmap/vitessce-image-viewer'
import { load } from '@loaders.gl/core';
import { SelectablePolygonLayer } from '../../layers';
import { tileToBoundingBox, getTileIndices } from './tiling-utils';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
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
      const rootTIFFUrl = 'https://vitessce-demo-data.storage.googleapis.com/test-data/VAN0001-RK-1-21_24-MxIF-mxIF_toIMS/';
      const remoteData = {
        tileSize: 256,
        sourceChannels: {
          'Cy3 - Synaptopodin (glomerular)': `${rootTIFFUrl}vanderbilt_test_Cy3 - Synaptopodin (glomerular).ome.tiff`,
          'Cy5 - THP (thick limb)': `${rootTIFFUrl}vanderbilt_test_Cy5 - THP (thick limb).ome.tiff`,
          'DAPI - Hoescht (nuclei)': `${rootTIFFUrl}vanderbilt_test_DAPI - Hoescht (nuclei).ome.tiff`,
          'FITC - Laminin (basement membrane)': `${rootTIFFUrl}vanderbilt_test_FITC - Laminin (basement membrane).ome.tiff`
        }
      };
      const propSettings = {
        imageHeight: 141 * remoteData.tileSize,
        imageWidth: 206 * remoteData.tileSize,
        ...remoteData,
        colorValues: {
          'Cy3 - Synaptopodin (glomerular)': [255, 0, 0],
          'Cy5 - THP (thick limb)': [0, 255, 0],
          'DAPI - Hoescht (nuclei)': [0, 0, 255],
          'FITC - Laminin (basement membrane)': [255, 128, 0]
        },
        sliderValues: {
          'Cy3 - Synaptopodin (glomerular)': [0,10000],
          'Cy5 - THP (thick limb)': [0,10000],
          'DAPI - Hoescht (nuclei)': [0,10000],
          'FITC - Laminin (basement membrane)': [0,10000]
        },
        maxZoom: -9,
        minZoom: -16
      };
      return new MicroscopyViewerLayer({
        useTiff: true,
        ...propSettings

      })
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
    // layerList.push(...this.renderImageLayers());

    if (raster && clearPleaseWait) clearPleaseWait('raster');
    layerList.push(this.createRasterLayer());

    if (cells && clearPleaseWait) clearPleaseWait('cells');
    // layerList.push(this.renderCellLayer());

    if (neighborhoods && clearPleaseWait) clearPleaseWait('neighborhoods');
    // layerList.push(this.renderNeighborhoodsLayer());

    if (molecules && clearPleaseWait) clearPleaseWait('molecules');
    // layerList.push(this.renderMoleculesLayer());

    console.log(layerList)
    return layerList;
  }
}
