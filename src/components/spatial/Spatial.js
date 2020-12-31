import React, { forwardRef } from 'react';
import isEqual from 'lodash/isEqual';
import { ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { Matrix4 } from 'math.gl';
import { MultiscaleImageLayer, ImageLayer, ScaleBarLayer } from '@hms-dbmi/viv';
import { SelectablePolygonLayer, getSelectionLayers } from '../../layers';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import { square } from './utils';
import AbstractSpatialOrScatterplot from '../shared-spatial-scatterplot/AbstractSpatialOrScatterplot';
import {
  createCellsQuadTree,
} from '../shared-spatial-scatterplot/quadtree';

const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';
const NEIGHBORHOODS_LAYER_ID = 'neighborhoods-layer';

// Default getter function props.
const defaultGetCellCoords = cell => cell.xy;
const makeDefaultGetCellPolygon = radius => (cellEntry) => {
  const cell = cellEntry[1];
  return cell.poly?.length ? cell.poly : square(cell.xy[0], cell.xy[1], radius);
};
const makeDefaultGetCellColors = cellColors => cellEntry => (
  cellColors && cellColors.get(cellEntry[0])
) || DEFAULT_COLOR;
const makeDefaultGetCellIsSelected = cellSelection => cellEntry => (
  cellSelection
    ? cellSelection.includes(cellEntry[0])
    : true // If nothing is selected, everything is selected.
);

/**
 * React component which expresses the spatial relationships between cells and molecules.
 * @param {object} props
 * @param {string} props.uuid A unique identifier for this component,
 * used to determine when to show tooltips vs. crosshairs.
 * @param {number} props.height Height of the DeckGL canvas, used when
 * rendering the scale bar layer.
 * @param {number} props.width Width of the DeckGL canvas, used when
 * rendering the scale bar layer.
 * @param {object} props.viewState The DeckGL viewState object.
 * @param {function} props.setViewState A handler for updating the DeckGL
 * viewState object.
 * @param {object} props.molecules Molecules data.
 * @param {object} props.cells Cells data.
 * @param {object} props.neighborhoods Neighborhoods data.
 * @param {number} props.lineWidthScale Width of cell border in view space (deck.gl).
 * @param {number} props.lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @param {object} props.imageLayerLoaders An object mapping raster layer index to Viv loader
 * instances.
 * @param {object} props.cellColors Map from cell IDs to colors [r, g, b].
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getCellPolygon Getter function for cell polygons.
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.getMoleculeColor
 * @param {function} props.getMoleculePosition
 * @param {function} props.getNeighborhoodPolygon
 * @param {function} props.updateViewInfo Handler for DeckGL viewport updates,
 * used when rendering tooltips and crosshairs.
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
    this.onUpdateNeighborhoodsData();
    this.onUpdateNeighborhoodsLayer();
    this.onUpdateImages();
  }

  createCellsLayer(layerDef) {
    const {
      radius, stroked, visible, opacity,
    } = layerDef;
    const {
      cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected = makeDefaultGetCellIsSelected(cellSelection),
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors),
      getCellPolygon = makeDefaultGetCellPolygon(radius),
      onCellClick,
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
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
        filteredCellsEntries, undefined, setCellHighlight,
        setComponentHover, flipYTooltip,
      ),
    });
  }

  createMoleculesLayer(layerDef) {
    const {
      setMoleculeHighlight,
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
        if (setMoleculeHighlight) {
          if (info.object) {
            setMoleculeHighlight(info.object[3]);
          } else {
            setMoleculeHighlight(null);
          }
        }
      },
    });
  }

  createNeighborhoodsLayer(layerDef) {
    const {
      getNeighborhoodPolygon = (neighborhoodsEntry) => {
        const neighborhood = neighborhoodsEntry[1];
        return neighborhood.poly;
      },
    } = this.props;
    const { neighborhoodsEntries } = this;

    return new PolygonLayer({
      id: NEIGHBORHOODS_LAYER_ID,
      getPolygon: getNeighborhoodPolygon,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: neighborhoodsEntries,
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getElevation: 0,
      getLineWidth: 10,
      visible: layerDef.visible,
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

  createScaleBarLayer() {
    const {
      viewState, width, height, imageLayerLoaders = {},
    } = this.props;
    // Just get the first layer/loader since they should all be spatially
    // resolved and therefore have the same unit size scale.
    const loaders = Object.values(imageLayerLoaders);
    if (!viewState || !width || !height || loaders.length < 1) return null;
    const loader = loaders[0];
    if (!loader) return null;
    const { physicalSizes } = loader;
    if (physicalSizes) {
      const { x } = physicalSizes;
      const { unit, value } = x;
      if (unit && value) {
        return new ScaleBarLayer({
          id: 'scalebar-layer',
          loader,
          unit,
          size: value,
          viewState: { ...viewState, width, height },
        });
      }
      return null;
    }
    return null;
  }

  createImageLayer(rawLayerDef, loader, i) {
    const layerDef = {
      ...rawLayerDef,
      channels: rawLayerDef.channels
        .filter(channel => channel.selection && channel.color && channel.slider),
    };

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
    let modelMatrix;
    if (scale && translate) {
      modelMatrix = new Matrix4().translate([translate.x, translate.y, 0]).scale(scale);
    } else if (layerDef.modelMatrix) {
      // eslint-disable-next-line prefer-destructuring
      modelMatrix = new Matrix4(layerDef.modelMatrix);
    }
    const Layer = isPyramid ? MultiscaleImageLayer : ImageLayer;
    return new Layer({
      loader,
      id: `image-layer-${layerDef.index}-${i}`,
      colorValues: layerProps.colors,
      sliderValues: layerProps.sliders,
      loaderSelection,
      channelIsOn: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: (layerProps.colormap ? layerProps.colormap : ''),
      modelMatrix,
    });
  }

  createImageLayers() {
    const { layers, imageLayerLoaders = {} } = this.props;
    return (layers || [])
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
      this.createScaleBarLayer(),
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
    const { layers } = this.props;
    const layerDef = (layers || []).find(layer => layer.type === 'cells');
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
    const { layers } = this.props;
    const layerDef = (layers || []).find(layer => layer.type === 'molecules');
    if (layerDef) {
      this.moleculesLayer = this.createMoleculesLayer(layerDef);
    } else {
      this.moleculesLayer = null;
    }
  }

  onUpdateNeighborhoodsData() {
    const { neighborhoods = {} } = this.props;
    const neighborhoodsEntries = Object
      .entries(neighborhoods);
    this.neighborhoodsEntries = neighborhoodsEntries;
  }

  onUpdateNeighborhoodsLayer() {
    const { layers } = this.props;
    const layerDef = (layers || []).find(layer => layer.type === 'neighborhoods');
    if (layerDef) {
      this.neighborhoodsLayer = this.createNeighborhoodsLayer(layerDef);
    } else {
      this.neighborhoodsLayer = null;
    }
  }

  onUpdateImages() {
    this.imageLayers = this.createImageLayers();
  }

  viewInfoDidUpdate() {
    const { getCellCoords = defaultGetCellCoords } = this.props;
    super.viewInfoDidUpdate(getCellCoords);
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
    this.viewInfoDidUpdate();

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

    if (['neighborhoods'].some(shallowDiff)) {
      // Neighborhoods data changed.
      this.onUpdateNeighborhoodsData();
      this.forceUpdate();
    }

    if (['layers', 'neighborhoods'].some(shallowDiff)) {
      // Neighborhoods layer props changed.
      this.onUpdateNeighborhoodsLayer();
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
