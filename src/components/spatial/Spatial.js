import React, { forwardRef } from 'react';
import isEqual from 'lodash/isEqual';
import { COORDINATE_SYSTEM } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { PolygonLayer, ScatterplotLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { Matrix4 } from 'math.gl';
import { ScaleBarLayer, MultiscaleImageLayer } from '@hms-dbmi/viv';
import { getSelectionLayers } from '../../layers';
import { cellLayerDefaultProps, PALETTE, getDefaultColor } from '../utils';
import { getSourceFromLoader } from '../../utils';
import { square, getLayerLoaderTuple, renderSubBitmaskLayers } from './utils';
import AbstractSpatialOrScatterplot from '../shared-spatial-scatterplot/AbstractSpatialOrScatterplot';
import { createCellsQuadTree } from '../shared-spatial-scatterplot/quadtree';
import { ScaledExpressionExtension } from '../../layer-extensions';

const CELLS_LAYER_ID = 'cells-layer';
const MOLECULES_LAYER_ID = 'molecules-layer';
const NEIGHBORHOODS_LAYER_ID = 'neighborhoods-layer';

// Default getter function props.
const defaultGetCellCoords = cell => cell.xy;
const makeDefaultGetCellPolygon = radius => (cellEntry) => {
  const cell = cellEntry[1];
  return cell.poly?.length ? cell.poly : square(cell.xy[0], cell.xy[1], radius);
};
const makeDefaultGetCellColors = (cellColors, theme) => (cellEntry) => {
  const [r, g, b, a] = (cellColors && cellColors.get(cellEntry[0])) || getDefaultColor(theme);
  return [r, g, b, 255 * (a || 1)];
};
const makeDefaultGetCellIsSelected = (cellSelection) => {
  if (cellSelection) {
    // For performance, convert the Array to a Set instance.
    // Set.has() is faster than Array.includes().
    const cellSelectionSet = new Set(cellSelection);
    return cellEntry => (cellSelectionSet.has(cellEntry[0]) ? 1.0 : 0.0);
  }
  return () => 0.0;
};

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
 * @param {string} props.theme "light" or "dark" for the vitessce theme
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
    // Better for the bitmask layer when there is no color data to use this.
    // 2048 is best for performance and for stability (4096 texture size is not always supported).
    this.randomColorData = {
      data: new Uint8Array(2048 * 2048 * 3)
        .map((_, j) => (j < 4 ? 0 : Math.round(255 * Math.random()))),
      // This buffer should be able to hold colors for 2048 x 2048 ~ 4 million cells.
      height: 2048,
      width: 2048,
    };
    this.color = { ...this.randomColorData };
    this.expression = {
      data: new Uint8Array(2048 * 2048),
      // This buffer should be able to hold colors for 2048 x 2048 ~ 4 million cells.
      height: 2048,
      width: 2048,
    };

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
    const { cellsEntries } = this;
    const {
      theme,
      cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected = makeDefaultGetCellIsSelected(
        cellsEntries.length === cellSelection.length ? null : cellSelection,
      ),
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors, theme),
      getCellPolygon = makeDefaultGetCellPolygon(radius),
      onCellClick,
      lineWidthScale = 10,
      lineWidthMaxPixels = 2,
      geneExpressionColormapRange,
      cellColorEncoding,
      getExpressionValue,
      geneExpressionColormap,
    } = this.props;
    const filteredCellsEntries = cellFilter
      ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0]))
      : cellsEntries;

    // Graphics rendering has the y-axis positive going south,
    // so we need to flip it for rendering tooltips.
    const flipYTooltip = true;

    return new PolygonLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: [0, 0, 0],
      isSelected: getCellIsSelected,
      getPolygon: getCellPolygon,
      updateTriggers: {
        getLineWidth: [stroked],
        isSelected: cellSelection,
        getExpressionValue,
        getFillColor: [opacity, cellColorEncoding, cellSelection, cellColors],
        getLineColor: [cellColorEncoding, cellSelection, cellColors],
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
      getExpressionValue,
      extensions: [new ScaledExpressionExtension({ instanced: false })],
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: cellColorEncoding === 'geneSelection',
      colormap: geneExpressionColormap,
      ...cellLayerDefaultProps(
        filteredCellsEntries,
        undefined,
        setCellHighlight,
        setComponentHover,
        flipYTooltip,
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
    const {
      viewState,
      getCellCoords = defaultGetCellCoords,
      setCellSelection,
    } = this.props;
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
      viewState,
      width,
      height,
      imageLayerLoaders = {},
      layers,
    } = this.props;
    const use3d = (layers || []).some(i => i.use3d);
    // Just get the first layer/loader since they should all be spatially
    // resolved and therefore have the same unit size scale.
    const loaders = Object.values(imageLayerLoaders);
    if (!viewState || !width || !height || loaders.length < 1) return null;
    const loader = loaders[0];
    if (!loader) return null;
    const source = getSourceFromLoader(loader);
    if (!source.meta) return null;
    const { physicalSizes } = source.meta;
    if (physicalSizes && !use3d) {
      const { x } = physicalSizes;
      const { unit, size } = x;
      if (unit && size) {
        return new ScaleBarLayer({
          id: 'scalebar-layer',
          unit,
          size,
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
      channels: rawLayerDef.channels.filter(
        channel => channel.selection && channel.color && channel.slider,
      ),
    };

    // We need to keep the same selections array reference,
    // otherwise the Viv layer will not be re-used as we want it to,
    // since selections is one of its `updateTriggers`.
    // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
    let selections;
    const nextLoaderSelection = layerDef.channels.map(c => c.selection);
    const prevLoaderSelection = this.layerLoaderSelections[layerDef.index];
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
      selections = prevLoaderSelection;
    } else {
      selections = nextLoaderSelection;
      this.layerLoaderSelections[layerDef.index] = nextLoaderSelection;
    }
    const layerProps = {
      colormap: layerDef.colormap,
      opacity: layerDef.opacity,
      transparentColor: layerDef.transparentColor,
      colors: layerDef.channels.map(c => c.color),
      sliders: layerDef.channels.map(c => c.slider),
      resolution: layerDef.resolution,
      renderingMode: layerDef.renderingMode,
      xSlice: layerDef.xSlice,
      ySlice: layerDef.ySlice,
      zSlice: layerDef.zSlice,
      callback: layerDef.callback,
      visibilities: layerDef.channels.map(c => (!layerDef.visible && typeof layerDef.visible === 'boolean'
        ? false
        : c.visible)),
    };

    if (!loader || !layerProps) return null;
    const {
      metadata: { transform },
      data,
    } = loader;
    let modelMatrix;
    if (transform) {
      const { scale, translate } = transform;
      modelMatrix = new Matrix4()
        .translate([translate.x, translate.y, 0])
        .scale(scale);
    } else if (layerDef.modelMatrix) {
      // eslint-disable-next-line prefer-destructuring
      modelMatrix = new Matrix4(layerDef.modelMatrix);
    }
    if (rawLayerDef.type === 'bitmask') {
      const {
        geneExpressionColormap,
        geneExpressionColormapRange = [0.0, 1.0],
        cellColorEncoding,
      } = this.props;
      return new MultiscaleImageLayer({
        // `bitmask` is used by the AbstractSpatialOrScatterplot
        // https://github.com/vitessce/vitessce/pull/927/files#diff-9cab35a2ca0c5b6d9754b177810d25079a30ca91efa062d5795181360bc3ff2cR111
        id: `bitmask-layer-${layerDef.index}-${i}`,
        channelsVisible: layerProps.visibilities,
        opacity: layerProps.opacity,
        modelMatrix,
        hoveredCell: Number(this.props.cellHighlight),
        renderSubLayers: renderSubBitmaskLayers,
        loader: data,
        selections,
        // For some reason, deck.gl doesn't recognize the prop diffing
        // unless these are separated out.  I don't think it's a bug, just
        // has to do with the fact that we don't have it in the `defaultProps`,
        // could be wrong though.
        cellColorData: this.color.data,
        cellTexHeight: this.color.height,
        cellTexWidth: this.color.width,
        excludeBackground: true,
        onViewportLoad: layerProps.callback,
        colorScaleLo: geneExpressionColormapRange[0],
        colorScaleHi: geneExpressionColormapRange[1],
        isExpressionMode: cellColorEncoding === 'geneSelection',
        colormap: geneExpressionColormap,
        expressionData: this.expression.data,
      });
    }
    const [Layer, layerLoader] = getLayerLoaderTuple(data, layerDef.use3d);

    return new Layer({
      loader: layerLoader,
      id: `${layerDef.use3d ? 'volume' : 'image'}-layer-${layerDef.index}-${i}`,
      colors: layerProps.colors,
      contrastLimits: layerProps.sliders,
      selections,
      channelsVisible: layerProps.visibilities,
      opacity: layerProps.opacity,
      colormap: layerProps.colormap,
      modelMatrix,
      transparentColor: layerProps.transparentColor,
      resolution: layerProps.resolution,
      renderingMode: layerProps.renderingMode,
      pickable: false,
      xSlice: layerProps.xSlice,
      ySlice: layerProps.ySlice,
      zSlice: layerProps.zSlice,
      onViewportLoad: layerProps.callback,
    });
  }

  createImageLayers() {
    const {
      layers,
      imageLayerLoaders = {},
      rasterLayersCallbacks = [],
    } = this.props;
    const use3d = (layers || []).some(i => i.use3d);
    const use3dIndex = (layers || []).findIndex(i => i.use3d);
    return (layers || [])
      .filter(layer => layer.type === 'raster' || layer.type === 'bitmask')
      .filter(layer => (use3d ? layer.use3d === use3d : true))
      .map((layer, i) => this.createImageLayer(
        { ...layer, callback: rasterLayersCallbacks[use3d ? use3dIndex : i] },
        imageLayerLoaders[layer.index],
        i,
      ));
  }

  getLayers() {
    const {
      imageLayers, cellsLayer, neighborhoodsLayer, moleculesLayer,
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
    const { cells = {}, getCellCoords = defaultGetCellCoords } = this.props;
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

  onUpdateCellColors() {
    const color = this.randomColorData;
    const { size } = this.props.cellColors;
    if (typeof size === 'number') {
      const cellIds = this.props.cellColors.keys();
      color.data = new Uint8Array(color.height * color.width * 3).fill(
        getDefaultColor(this.props.theme)[0],
      );
      // 0th cell id is the empty space of the image i.e black color.
      color.data[0] = 0;
      color.data[1] = 0;
      color.data[2] = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const id of cellIds) {
        if (id > 0) {
          const cellColor = this.props.cellColors.get(id);
          if (cellColor) {
            color.data.set(cellColor.slice(0, 3), Number(id) * 3);
          }
        }
      }
    }
    this.color = color;
  }

  onUpdateExpressionData() {
    const { expressionData } = this.props;
    if (expressionData[0]?.length) {
      this.expression.data = new Uint8Array(
        this.expression.height * this.expression.width,
      );
      this.expression.data.set(expressionData[0]);
    }
  }

  onUpdateMoleculesData() {
    const { molecules = {} } = this.props;
    const moleculesEntries = Object.entries(molecules).flatMap(
      ([molecule, coords], index) => coords.map(([x, y]) => [x, y, index, molecule]),
    );
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
    const neighborhoodsEntries = Object.entries(neighborhoods);
    this.neighborhoodsEntries = neighborhoodsEntries;
  }

  onUpdateNeighborhoodsLayer() {
    const { layers } = this.props;
    const layerDef = (layers || []).find(
      layer => layer.type === 'neighborhoods',
    );
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

    const shallowDiff = propName => prevProps[propName] !== this.props[propName];
    if (['cells'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateCellsData();
      this.forceUpdate();
    }

    if (
      [
        'layers',
        'cells',
        'cellFilter',
        'cellSelection',
        'cellColors',
        'geneExpressionColormapRange',
        'cellColorEncoding',
        'geneExpressionColormap',
      ].some(shallowDiff)
    ) {
      // Cells layer props changed.
      this.onUpdateCellsLayer();
      this.forceUpdate();
    }

    if (['cellColors'].some(shallowDiff)) {
      // Cells Color layer props changed.
      this.onUpdateCellColors();
      this.forceUpdate();
    }

    if (['expressionData'].some(shallowDiff)) {
      // Expression data prop changed.
      this.onUpdateExpressionData();
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

    if (
      [
        'layers',
        'imageLayerLoaders',
        'cellColors',
        'cellHighlight',
        'geneExpressionColormapRange',
        'expressionData',
        'rasterLayersCallbacks',
        'geneExpressionColormap',
      ].some(shallowDiff)
    ) {
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
const SpatialWrapper = forwardRef((props, deckRef) => (
  <Spatial {...props} deckRef={deckRef} />
));
export default SpatialWrapper;
