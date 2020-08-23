import React, { forwardRef } from 'react';
import isEqual from 'lodash/isEqual';
import { ScatterplotLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { MultiscaleImageLayer, ImageLayer } from '@hms-dbmi/viv';
import { SelectablePolygonLayer, getSelectionLayers } from '../../layers';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import { square } from './utils';
import AbstractSpatialOrScatterplot from '../shared-spatial-scatterplot/AbstractSpatialOrScatterplot';
import {
  createCellsQuadTree,
} from '../shared-spatial-scatterplot/quadtree';

const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';

// Default getter function props.
const defaultGetCellCoords = cell => cell.xy;
const makeDefaultGetCellPolygon = radius => (cellEntry) => {
  const cell = cellEntry[1];
  return cell.poly.length ? cell.poly : square(cell.xy[0], cell.xy[1], radius);
};
const makeDefaultGetCellColors = cellColors => cellEntry => (
  cellColors && cellColors.get(cellEntry[0])
) || DEFAULT_COLOR;
const makeDefaultGetCellIsSelected = cellSelection => cellEntry => (
  cellSelection.length
    ? cellSelection.includes(cellEntry[0])
    : true // If nothing is selected, everything is selected.
);

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @param {object} props
 * @param {string} props.uuid
 * @param {object} props.viewState
 * @param {function} props.setViewState
 * @param {object} props.molecules
 * @param {object} props.cells
 * @param {object} props.neighborhoods
 * @param {number} props.lineWidthScale Width of cell border in view space (deck.gl).
 * @param {number} props.lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @param {object} props.imageLayerLoaders
 * @param {object} props.cellColors Object mapping cell IDs to colors.
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getCellPolygon
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.getMoleculeColor
 * @param {function} props.getMoleculePosition
 * @param {function} props.getNeighborhoodPolygon
 * @param {function} props.updateStatus
 * @param {function} props.updateViewInfo
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 */
class Spatial extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

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

  onInitializeViewInfo({ viewport }) {
    const { getCellCoords = defaultGetCellCoords } = this.props;
    super.onInitializeViewInfo(viewport, getCellCoords);
  }

  createCellsLayer(layerDef) {
    const {
      radius, stroked, visible, opacity,
    } = layerDef;
    const {
      cellFilter = null,
      cellSelection = [],
      setCellHighlight,
      getCellIsSelected = makeDefaultGetCellIsSelected(cellSelection),
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors),
      getCellPolygon = makeDefaultGetCellPolygon(radius),
      onCellClick,
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
      uuid,
    } = this.props;
    const { cellsEntries } = this;
    const filteredCellsEntries = (cellFilter
      ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0]))
      : cellsEntries);

    // Graphics rendering has the y-axis positive going south,
    // so we need to flip it for rendering tooltips.
    const flipYTooltip = true;

    return new SelectablePolygonLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: [0, 0, 0],
      isSelected: getCellIsSelected,
      getPolygon: getCellPolygon,
      updateTriggers: {
        getFillColor: [opacity],
        getLineWidth: [stroked],
      },
      getFillColor: (cellEntry) => {
        const color = getCellColor(cellEntry);
        color[3] = opacity * 255;
        return color;
      },
      getLineColor: (cellEntry) => {
        const color = getCellColor(cellEntry);
        color[3] = 255;
        return color;
      },
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      visible,
      getLineWidth: stroked ? 1 : 0,
      lineWidthScale,
      lineWidthMaxPixels,
      ...cellLayerDefaultProps(
        filteredCellsEntries, undefined, setCellHighlight, uuid, flipYTooltip,
      ),
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
        if (info.object && updateStatus) {
          updateStatus(`Gene: ${info.object[3]}`);
        }
      },
    });
  }

  createSelectionLayers() {
    const { viewState, getCellCoords = defaultGetCellCoords, setCellSelection } = this.props;
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
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
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
      loaderSelection,
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
      .filter(layer => layer.type === 'raster')
      .map((layer, i) => this.createImageLayer(
        layer, imageLayerLoaders[layer.index], i,
      ));
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
    const {
      cells = {},
      getCellCoords = defaultGetCellCoords,
    } = this.props;
    const cellsEntries = Object.entries(cells);
    this.cellsEntries = cellsEntries;
    this.cellsQuadTree = createCellsQuadTree(cellsEntries, getCellCoords);
  }

  onUpdateCellsLayer() {
    const { layers = [] } = this.props;
    const layerDef = layers.find(layer => layer.type === 'cells');
    if (layerDef) {
      this.cellsLayer = this.createCellsLayer(layerDef);
    } else {
      this.cellsLayer = null;
    }
  }

  onUpdateMoleculesData() {
    const { molecules = {} } = this.props;
    const moleculesEntries = Object
      .entries(molecules)
      .flatMap(([molecule, coords], index) => coords.map(([x, y]) => [
        x, y, index, molecule,
      ]));
    this.moleculesEntries = moleculesEntries;
  }

  onUpdateMoleculesLayer() {
    const { layers = [] } = this.props;
    const layerDef = layers.find(layer => layer.type === 'molecules');
    if (layerDef) {
      this.moleculesLayer = this.createMoleculesLayer(layerDef);
    } else {
      this.moleculesLayer = null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
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
   * it is only implemented this way to try to squeeze out
   * performance.
   * @param {object} prevProps The previous props to diff against.
   */
  componentDidUpdate(prevProps) {
    const shallowDiff = propName => (prevProps[propName] !== this.props[propName]);
    if (['cells'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateCellsData();
      this.forceUpdate();
    }

    if ([
      'layers', 'cells', 'cellFilter', 'cellSelection', 'cellColors',
    ].some(shallowDiff)) {
      // Cells layer props changed.
      this.onUpdateCellsLayer();
      this.forceUpdate();
    }

    if (['molecules'].some(shallowDiff)) {
      // Molecules data changed.
      this.onUpdateMoleculesData();
      this.forceUpdate();
    }

    if (['layers', 'molecules'].some(shallowDiff)) {
      // Molecules layer props changed.
      this.onUpdateMoleculesLayer();
      this.forceUpdate();
    }

    if (['layers', 'imageLayerLoaders'].some(shallowDiff)) {
      // Image layers changed.
      this.onUpdateImages();
      this.forceUpdate();
    }
  }

  // render() is implemented in the abstract parent class.
}

/**
 * Need this wrapper function here,
 * since we want to pass a forwardRef
 * so that outer components can
 * access the grandchild DeckGL ref,
 * but we are using a class component.
 */
const SpatialWrapper = forwardRef((props, deckRef) => <Spatial {...props} deckRef={deckRef} />);
export default SpatialWrapper;
