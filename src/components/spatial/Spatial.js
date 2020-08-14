/* eslint-disable */
import React, {
  useState, useCallback, useMemo, forwardRef, PureComponent,
} from 'react';
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

    this.onUpdateCells();
    this.onUpdateMolecules();
    this.onUpdateNeighborhoods();
    this.onUpdateImages();

    this.imageLayers = [];
    this.selectionLayers = [];
  }

  onViewStateChange({ viewState: nextViewState }) {
    const { setZoom, setTarget } = this.props;
    const { zoom, target } = nextViewState;
    setZoom(zoom);
    setTarget(target);
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
    this.setState({ tool });
  }

  createCellsLayer() {
    const {
      selectedCellIds = new Set(),
      getCellIsSelected = cellEntry => (
        selectedCellIds.size
          ? selectedCellIds.has(cellEntry[0])
          : true // If nothing is selected, everything is selected.
      ),
      cellColors = {},
      getCellColor = cellEntry => (cellColors && cellColors.get(cellEntry[0])) || DEFAULT_COLOR,
      cellRadius = 50,
      getCellPolygon = (cellEntry) => {
        const cell = cellEntry[1];
        return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], cellRadius);
      },
      cellOpacity = 1.0,
      onCellClick = (info) => {
        const cellId = info.object[0];
        const newSelectedCellIds = new Set(selectedCellIds);
        if (selectedCellIds.has(cellId)) {
          newSelectedCellIds.delete(cellId);
          updateCellsSelection(newSelectedCellIds);
        } else {
          newSelectedCellIds.add(cellId);
          updateCellsSelection(newSelectedCellIds);
        }
      },
      areCellsOn = true,
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
      updateStatus, updateCellsHover, uuid,
    } = this.props;

    const { cellsEntries } = this;
    
    // Graphics rendering has the y-axis positive going south,
    // so we need to flip it for rendering tooltips.
    const flipYTooltip = true;

    return new SelectablePolygonLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: [0, 0, 0],
      isSelected: getCellIsSelected,
      stroked: true,
      getPolygon: getCellPolygon,
      updateTriggers: {
        getFillColor: [cellOpacity],
      },
      getFillColor: (cellEntry) => {
        const color = getCellColor(cellEntry);
        color[3] = cellOpacity * 255;
        return color;
      },
      getLineColor: (cellEntry) => {
        const color = getCellColor(cellEntry);
        color[3] = 255;
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
      visible: areCellsOn,
      ...cellLayerDefaultProps(cellsEntries, updateStatus, updateCellsHover, uuid, flipYTooltip),
      getLineWidth: cellOpacity < 0.7 ? 1 : 0,
      lineWidthScale,
      lineWidthMaxPixels,
    });
  }

  createMoleculesLayer() {
    const {
      moleculesOpacity = 1.0, moleculeRadius = 10, areMoleculesOn = true, updateStatus,
      getMoleculeColor = d => PALETTE[d[2] % PALETTE.length],
      getMoleculePosition = d => [d[0], d[1], 0],
    } = this.props;
    const { moleculesEntries } = this;
    return new ScatterplotLayer({
      id: MOLECULES_LAYER_ID,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: moleculesEntries,
      pickable: true,
      opacity: moleculesOpacity,
      autoHighlight: true,
      getRadius: moleculeRadius,
      radiusMaxPixels: 3,
      getPosition: getMoleculePosition,
      getLineColor: getMoleculeColor,
      getFillColor: getMoleculeColor,
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
      visible: areMoleculesOn,
    });
  }

  createSelectionLayers() {
    const { tool, zoom, getCellCoords = defaultGetCellCoords, updateCellsSelection } = this.props;
    const { cellsQuadTree } = this;
    return getSelectionLayers(
      tool,
      zoom,
      CELLS_LAYER_ID,
      getCellCoords,
      updateCellsSelection,
      cellsQuadTree,
    );
  }

  createImageLayer(loaderDef, layerDef) {

    console.log('createImageLayer', loaderDef, layerDef);

    const { loader, index: layerId } = loaderDef;
    const layerProps = {
      colormap: layerDef.colormap,
      opacity: layerDef.opacity,
      colors: layerDef.channels.map(c => c.color),
      sliders: layerDef.channels.map(c => c.slider),
      visibilities: layerDef.channels.map(c => c.visibility),
      selections: layerDef.channels.map(c => c.selection),
    };

    if (!loader || !layerProps) return null;
    const { scale, translate, isPyramid } = loader;
    const Layer = isPyramid ? MultiscaleImageLayer : ImageLayer;
    return new Layer({
      loader,
      id: layerId,
      colorValues: layerProps.colors,
      sliderValues: layerProps.sliders,
      loaderSelection: layerProps.selections,
      channelIsOn: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap.length > 0 && layerProps.colormap,
      scale: scale || 1,
      translate: translate ? [translate.x, translate.y] : [0, 0],
    });
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
      ...this.createSelectionLayers(),
      neighborhoodsLayer,
      moleculesLayer,
    ];
  }

  onUpdateCells() {
    const { cells = {}, getCellCoords = defaultGetCellCoords, } = this.props;
    const cellsEntries = Object.entries(cells);
    this.cellsEntries = cellsEntries;
    this.cellsQuadTree = createCellsQuadTree(cellsEntries, getCellCoords);
    this.cellsLayer = this.createCellsLayer();
  }

  onUpdateMolecules() {
    const { molecules = {} } = this.props;
    const moleculesEntries = Object
        .entries(molecules)
        .flatMap(([molecule, coords], index) => coords.map(([x, y]) => [x, y, index, molecule]));
    this.moleculesEntries = moleculesEntries;
    this.moleculesLayer = this.createMoleculesLayer();
  }

  onUpdateNeighborhoods() {

  }

  onUpdateImages() {
    const { imageLayerLoaders = [], imageLayerDefs = [] } = this.props;

    if(imageLayerDefs.length === imageLayerLoaders.length) {
      this.imageLayers = imageLayerLoaders.map((loaderDef, i) => this.createImageLayer(loaderDef, imageLayerDefs[i]));
    }
    
    
    console.log(this.imageLayers);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.cells !== this.props.cells) {
      console.log("cells changed")
      this.onUpdateCells();
    }

    if(prevProps.molecules !== this.props.molecules) {
      console.log("molecules changed")
      this.onUpdateMolecules();
    }

    if(prevProps.imageLayerLoaders !== this.props.imageLayerLoaders || prevProps.imageLayerDefs !== this.props.imageLayerDefs) {
      console.log("images changed")
      this.onUpdateImages();
    }
  }

  render() {
    const { deckRef, zoom = 0, target = [0, 0, 0], } = this.props;
    const { gl, tool } = this.state;
    const layers = this.getLayers();

    const viewState = { zoom, target };

    return (
      <>
        <ToolMenu
          activeTool={tool}
          setActiveTool={this.onToolChange}
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

const SpatialWrapper = forwardRef((props, deckRef) => { return <Spatial {...props} deckRef={deckRef} />;  });

export default SpatialWrapper;