/* eslint-disable */
import React, {
  useState, useCallback, useMemo, forwardRef, PureComponent,
} from 'react';
import some from 'lodash/some';
import isEqual from 'lodash/isEqual';
import DeckGL, {
  ScatterplotLayer, PolygonLayer, OrthographicView, COORDINATE_SYSTEM,
} from 'deck.gl';
import { MultiscaleImageLayer, ImageLayer } from '@hms-dbmi/viv';
import { quadtree } from 'd3-quadtree';
import { SelectablePolygonLayer, getSelectionLayers } from '../../layers';
import ToolMenu from '../ToolMenu';
import {
  cellLayerDefaultProps, PALETTE, DEFAULT_COLOR,
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateStatus, createDefaultUpdateCellsSelection,
  createDefaultUpdateCellsHover,
  createDefaultUpdateViewInfo, createDefaultClearPleaseWait,
} from '../utils';

const COMPONENT_NAME = 'Spatial';
const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';


export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

const getCursorWithTool = () => 'crosshair';
const getCursor = interactionState => (interactionState.isDragging ? 'grabbing' : 'default');

const defaultGetCellCoords = cell => cell.xy;

function createCellsQuadTree(cellsEntries, getCellCoords) {
  // Use the cellsEntries variable since it is already
  // an array, converted by Object.entries().
  if (!cellsEntries) {
    // Abort if the cells data is not yet available.
    return null;
  }
  const tree = quadtree()
    .x(d => getCellCoords(d[1])[0])
    .y(d => getCellCoords(d[1])[1])
    .addAll(cellsEntries);
  return tree;
}

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @prop {string} uuid
 * @prop {object} view
 * @prop {number} view.zoom
 * @prop {number[]} view.target See https://github.com/uber/deck.gl/issues/2580 for more information.
 * @prop {object} molecules
 * @prop {object} cells
 * @prop {object} neighborhoods
 * @prop {number} moleculeRadius
 * @prop {number} cellOpacity The value for `opacity` to pass
 * to the deck.gl cells PolygonLayer.
 * @prop {number} lineWidthScale Width of cell border in view space (deck.gl).
 * @prop {number} lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @prop {object} imageLayerProps
 * @prop {object} imageLayerLoaders
 * @prop {object} cellColors Object mapping cell IDs to colors.
 * @prop {Set} selectedCellIds Set of selected cell IDs.
 * @prop {function} getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @prop {function} getCellColor Getter function for cell color as [r, g, b] array.
 * @prop {function} getCellPolygon
 * @prop {function} getCellIsSelected Getter function for cell layer isSelected.
 * @prop {function} getMoleculeColor
 * @prop {function} getMoleculePosition
 * @prop {function} getNeighborhoodPolygon
 * @prop {function} updateStatus
 * @prop {function} updateCellsSelection
 * @prop {function} updateCellsHover
 * @prop {function} updateViewInfo
 * @prop {function} onCellClick Getter function for cell layer onClick.
 */

class Spatial extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      gl: null,
      tool: null,
    };

    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.onInitializeViewInfo = this.onInitializeViewInfo.bind(this);
    this.onWebGLInitialized = this.onWebGLInitialized.bind(this);
    this.onToolChange = this.onToolChange.bind(this);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.cellsEntries = [];
    this.moleculesEntries = [];
    this.cellsQuadTree = null;
    this.cellsLayer = null;
    this.moleculesLayer = null;
    this.neighborhoodsLayer = null;
    this.imageLayers = [];
    this.layerLoaderSelections = {};
    
    // Initialize data and layers.
    this.onUpdateCellsData();
    this.onUpdateCellsLayer();
    this.onUpdateMoleculesData();
    this.onUpdateMoleculesLayer();
    this.onUpdateNeighborhoods();
    this.onUpdateImages();
  }

  onViewStateChange({ viewState: nextViewState }) {
    const { setViewState } = this.props;
    setViewState(nextViewState);
  }

  onInitializeViewInfo({ viewport }) {
    const { updateViewInfo, cells, uuid, getCellCoords = defaultGetCellCoords } = this.props;
    updateViewInfo({
      uuid,
      project: (cellId) => {
        const cell = cells[cellId];
        try {
          const [positionX, positionY] = getCellCoords(cell);
          return viewport.project([positionX, positionY]);
        } catch (e) {
          return [null, null];
        }
      },
    });
  }

  onWebGLInitialized(gl) {
    this.setState({ gl });
  }

  onToolChange(tool) {
    const { onToolChange: onToolChangeProp } = this.props;
    this.setState({ tool });
    if (onToolChangeProp) {
      onToolChangeProp(tool);
    }
  }

  createCellsLayer(layerDef) {
    const { radius, stroked, visible, opacity } = layerDef;
    const {
      cellFilter = null,
      cellSelection = [],
      cellHighlight = null,

      setCellHighlight,

      getCellIsSelected = cellEntry => (
        cellSelection.length
          ? cellSelection.includes(cellEntry[0])
          : true // If nothing is selected, everything is selected.
      ),
      // TODO: implement getCellColor based on cell set selections and gene expression selections.
      getCellColor = () => DEFAULT_COLOR,
      getCellPolygon = (cellEntry) => {
        const cell = cellEntry[1];
        return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], radius);
      },
      onCellClick = (info) => {
        const cellId = info.object[0];
        // TODO?
      },
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
      uuid,
    } = this.props;
    const { tool } = this.state;
    const { cellsEntries } = this;
    const filteredCellsEntries = (cellFilter ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0])) : cellsEntries);
    
    // Graphics rendering has the y-axis positive going south,
    // so we need to flip it for rendering tooltips.
    const flipYTooltip = true;

    return new SelectablePolygonLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: [0, 0, 0],
      isSelected: getCellIsSelected,
      stroked: stroked,
      getPolygon: getCellPolygon,
      updateTriggers: {
        getFillColor: [opacity],
      },
      getColor: (cellEntry) => {
        const color = getCellColor(cellEntry);
        color[3] = opacity * 255;
        return color;
      },
      onClick: (info) => {
        if (tool) {
          // If using a tool, prevent individual cell selection.
          // Let SelectionLayer handle the clicks instead.
          return;
        }
        onCellClick(info);
      },
      visible: visible,
      getLineWidth: stroked ? 1 : 0,
      lineWidthScale,
      lineWidthMaxPixels,
      ...cellLayerDefaultProps(filteredCellsEntries, undefined, setCellHighlight, uuid, flipYTooltip),
    });
  }

  createMoleculesLayer(layerDef) {
    const {
      updateStatus,
      getMoleculeColor = d => PALETTE[d[2] % PALETTE.length],
      getMoleculePosition = d => [d[0], d[1], 0],
    } = this.props;
    const { moleculesEntries } = this;
    
    return new ScatterplotLayer({
      id: MOLECULES_LAYER_ID,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: moleculesEntries,
      pickable: true,
      autoHighlight: true,
      radiusMaxPixels: 3,
      opacity: layerDef.opacity,
      visible: layerDef.visible,
      getRadius: layerDef.radius,
      getPosition: getMoleculePosition,
      getLineColor: getMoleculeColor,
      getFillColor: getMoleculeColor,
      onHover: (info) => {
        if (info.object && updateStatus) { updateStatus(`Gene: ${info.object[3]}`); }
      },
    });
  }

  createSelectionLayers() {
    const { viewState, getCellCoords = defaultGetCellCoords, setCellSelection, setCellFilter } = this.props;
    const { tool } = this.state;
    const { cellsQuadTree } = this;
    return getSelectionLayers(
      tool,
      viewState.zoom,
      CELLS_LAYER_ID,
      getCellCoords,
      setCellSelection,
      cellsQuadTree,
    );
  }

  createImageLayer(layerDef, loader, i) {

    // We need to keep the same loaderSelection array reference,
    // otherwise the Viv layer will not be re-used as we want it to,
    // since loaderSelection is one of its `updateTriggers`.
    // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
    let loaderSelection;
    const nextLoaderSelection = layerDef.channels.map(c => c.selection);
    const prevLoaderSelection = this.layerLoaderSelections[layerDef.index];
    if(isEqual(prevLoaderSelection, nextLoaderSelection)) {
      loaderSelection = prevLoaderSelection;
    } else {
      loaderSelection = nextLoaderSelection;
      this.layerLoaderSelections[layerDef.index] = nextLoaderSelection;
    }


    const layerProps = {
      colormap: layerDef.colormap,
      opacity: layerDef.opacity,
      colors: layerDef.channels.map(c => c.color),
      sliders: layerDef.channels.map(c => c.slider),
      visibilities: layerDef.channels.map(c => c.visible),
    };

    if (!loader || !layerProps) return null;
    const { scale, translate, isPyramid } = loader;
    const Layer = isPyramid ? MultiscaleImageLayer : ImageLayer;
    return new Layer({
      loader,
      id: `image-layer-${layerDef.index}-${i}`,
      colorValues: layerProps.colors,
      sliderValues: layerProps.sliders,
      loaderSelection: loaderSelection,
      channelIsOn: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap.length > 0 && layerProps.colormap,
      scale: scale || 1,
      translate: translate ? [translate.x, translate.y] : [0, 0],
    });
  }

  createImageLayers() {
    const { layers = [], imageLayerLoaders = {} } = this.props;
    return layers
      .filter(layer => layer.type === "raster")
      .map((layer, i) => this.createImageLayer(layer, imageLayerLoaders[layer.index], i));
  }

  getLayers() {
    const {
      imageLayers,
      cellsLayer,
      neighborhoodsLayer,
      moleculesLayer,
    } = this;
    return [
      ...imageLayers,
      cellsLayer,
      neighborhoodsLayer,
      moleculesLayer,
      ...this.createSelectionLayers(),
    ];
  }

  onUpdateCellsData() {
    const { cells = {}, getCellCoords = defaultGetCellCoords } = this.props;
    const cellsEntries = Object.entries(cells);
    this.cellsEntries = cellsEntries;
    this.cellsQuadTree = createCellsQuadTree(cellsEntries, getCellCoords);
  }

  onUpdateCellsLayer() {
    const { layers = [] } = this.props;
    const layerDef = layers.find(layer => layer.type === "cells");
    if(layerDef) {
      this.cellsLayer = this.createCellsLayer(layerDef);
    } else {
      this.cellsLayer = null;
    }
  }

  onUpdateMoleculesData() {
    const { molecules = {} } = this.props;
    const moleculesEntries = Object
        .entries(molecules)
        .flatMap(([molecule, coords], index) => coords.map(([x, y]) => [x, y, index, molecule]));
    this.moleculesEntries = moleculesEntries;
  }

  onUpdateMoleculesLayer() {
    const { layers = [] } = this.props;
    const layerDef = layers.find(layer => layer.type === "molecules");
    if(layerDef) {
      this.moleculesLayer = this.createMoleculesLayer(layerDef);
    } else {
      this.moleculesLayer = null;
    }
  }

  onUpdateNeighborhoods() {

  }

  onUpdateImages() {
    this.imageLayers = this.createImageLayers();
  }

  /**
   * Here, asynchronously check whether props have
   * updated which require re-computing memoized variables,
   * followed by a re-render.
   * This function does not follow React conventions or paradigms,
   * it is only implemented this way to try to squeeze out every
   * ounce of performance possible. Would not recommend this.
   * @param {object} prevProps The previous props to diff against.
   */
  componentDidUpdate(prevProps) {
    const shallowDiff = (propName) => (prevProps[propName] !== this.props[propName]);
    if(some(['cells'], shallowDiff)) {
      console.log("cells data changed")
      this.onUpdateCellsData();
      this.forceUpdate();
    }

    if(some(['layers', 'cells', 'cellFilter', 'cellSelection'], shallowDiff)) {
      console.log("cells layer changed")
      this.onUpdateCellsLayer();
      this.forceUpdate();
    }

    if(some(['molecules'], shallowDiff)) {
      console.log("molecules data changed")
      this.onUpdateMoleculesData();
      this.forceUpdate();
    }

    if(some(['layers', 'molecules'], shallowDiff)) {
      console.log("molecules layer changed")
      this.onUpdateMoleculesLayer();
      this.forceUpdate();
    }

    if(some(['layers', 'imageLayerLoaders'], shallowDiff)) {
      this.onUpdateImages();
      this.forceUpdate();
    }
  }

  render() {
    const { deckRef, viewState, } = this.props;
    const { gl, tool } = this.state;
    const layers = this.getLayers();

    const showCellSelectionTools = this.cellsLayer !== null;
    const showPanTool = this.cellsLayer !== null;

    return (
      <>
        <ToolMenu
          activeTool={tool}
          setActiveTool={this.onToolChange}
          visibleTools={{
            pan: showPanTool,
            selectRectangle: showCellSelectionTools,
            selectLasso: showCellSelectionTools,
          }}
        />
        <DeckGL
          ref={deckRef}
          views={[new OrthographicView({ id: 'ortho' })]} // id is a fix for https://github.com/uber/deck.gl/issues/3259
          layers={gl ? layers : ([])}
          glOptions={DEFAULT_GL_OPTIONS}
          onWebGLInitialized={this.onWebGLInitialized}
          onViewStateChange={this.onViewStateChange}
          viewState={viewState}
          controller={tool ? ({ dragPan: false }) : true}
          getCursor={tool ? getCursorWithTool : getCursor}
        >
          {this.onInitializeViewInfo}
        </DeckGL>
      </>
    );
  }
}

/**
 * Need this wrapper function here,
 * since we want to pass a forwardRef
 * so that outer components can
 * access the grandchild DeckGL ref,
 * but we are using a class component.
 */
const SpatialWrapper = forwardRef((props, deckRef) => { return <Spatial {...props} deckRef={deckRef} />;  });

export default SpatialWrapper;