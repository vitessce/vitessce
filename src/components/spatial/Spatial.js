import React from 'react';

import { ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, BitmapLayer } from 'deck.gl';
import { SelectablePolygonLayer, IdentityCoordinatesTileLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", err => reject(err));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
};

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
      polyT: true,
      nuclei: true,
    };

    // In Deck.gl, layers are considered light weight, and
    // can be created and destroyed quickly, if the data they wrap is stable.
    // https://deck.gl/#/documentation/developer-guide/using-layers?section=creating-layer-instances-is-cheap
    this.moleculesData = [];
    this.cellsData = [];
    this.neighborhoodsData = [];
    this.images = [];
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
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
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
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
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

  renderImagesLayer() {
    var layers = []
    this.images.forEach((layer) => {layers.push(this._createTileLayer(layer))})
    return layers
  }

  _createTileLayer(layer) {
    var [layerType, source] = layer
    return new IdentityCoordinatesTileLayer({
        id:`${layerType}-tile-layer`,
        pickable: true,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        maxCacheSize: 50,
        getTileData: ({x, y, z}) => loadImage(`http://127.0.0.1:8081/linnarsson.images.${layerType}/${layerType}_files/${z + 16}/${x}_${y}.jpeg`),
        //getTileData: ({x, y, z}) => load(`https://vitessce-data.s3.amazonaws.com/0.0.18/tile_ometiff/linnarsson/linnarsson.tiles/linnarsson.images.nuclei/nuclei_files/${z + 16}/${x}_${y}.jpeg`),
        minZoom: -16,
        maxZoom: 0,
        tileSource: source.tileSource,
        visible: this.state.layerIsVisible[layerType],
        renderSubLayers: props => {
          const {
            bbox: {west, south, east, north}
          } = props.tile;
          var bml = new BitmapLayer(props, {
            coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
            data: null,
            image: props.data,
            bounds: [west, south, east, north]
          })
          return bml;
        }
      })
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
      this.images =  Object.entries(images);
    }

    // Append each layer to the list.
    const layerList = [];

    if (images && clearPleaseWait) clearPleaseWait('images');
    layerList.push(...this.renderImagesLayer());

    if (cells && clearPleaseWait) clearPleaseWait('cells');
    layerList.push(this.renderCellLayer());

    if (neighborhoods && clearPleaseWait) clearPleaseWait('neighborhoods');
    layerList.push(this.renderNeighborhoodsLayer());

    if (molecules && clearPleaseWait) clearPleaseWait('molecules');
    layerList.push(this.renderMoleculesLayer());

    return layerList;
  }
}
