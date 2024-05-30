/* eslint-disable no-param-reassign */
import React, { forwardRef } from 'react';
import { forceSimulation } from 'd3-force';
import {
  deck, getSelectionLayer, ScaledExpressionExtension, SelectionExtension,
  ContourLayer,
} from '@vitessce/gl';
import { getDefaultColor } from '@vitessce/utils';
import {
  AbstractSpatialOrScatterplot, createQuadTree, forceCollideRects, getOnHoverCallback,
} from './shared-spatial-scatterplot/index.js';

const CELLS_LAYER_ID = 'scatterplot';
const LABEL_FONT_FAMILY = "-apple-system, 'Helvetica Neue', Arial, sans-serif";
const NUM_FORCE_SIMULATION_TICKS = 100;
const LABEL_UPDATE_ZOOM_DELTA = 0.25;

// Default getter function props.
const makeDefaultGetCellColors = (cellColors, obsIndex, theme) => (object, { index }) => {
  const [r, g, b, a] = (cellColors && obsIndex && cellColors.get(obsIndex[index]))
    || getDefaultColor(theme);
  return [r, g, b, 255 * (a || 1)];
};
const makeDefaultGetObsCoords = obsEmbedding => i => ([
  obsEmbedding.data[0][i],
  obsEmbedding.data[1][i],
  0,
]);
const makeFlippedGetObsCoords = obsEmbedding => i => ([
  obsEmbedding.data[0][i],
  -obsEmbedding.data[1][i],
  0,
]);
const getPosition = (object, { index, data, target }) => {
  target[0] = data.src.obsEmbedding.data[0][index];
  target[1] = -data.src.obsEmbedding.data[1][index];
  target[2] = 0;
  return target;
};

const contourGetPosition = (object, { index, data, target }) => {
  target[0] = data.src.embedding[0][data.src.indices[index]];
  target[1] = -data.src.embedding[1][data.src.indices[index]];
  target[2] = 0;
  return target;
};

const baseContours = [];

/**
 * React component which renders a scatterplot from cell data.
 * @param {object} props
 * @param {string} props.uuid A unique identifier for this component.
 * @param {string} props.theme The current vitessce theme.
 * @param {object} props.viewState The deck.gl view state.
 * @param {function} props.setViewState Function to call to update the deck.gl view state.
 * @param {object} props.cells
 * @param {string} props.mapping The name of the coordinate mapping field,
 * for each cell, for example "PCA" or "t-SNE".
 * @param {Map} props.cellColors Mapping of cell IDs to colors.
 * @param {array} props.cellSelection Array of selected cell IDs.
 * @param {array} props.cellFilter Array of filtered cell IDs. By default, null.
 * @param {number} props.cellRadius The value for `radiusScale` to pass
 * to the deck.gl cells ScatterplotLayer.
 * @param {number} props.cellOpacity The value for `opacity` to pass
 * to the deck.gl cells ScatterplotLayer.
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellPosition Getter function for cell [x, y, z] position.
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getExpressionValue Getter function for cell expression value.
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.setCellSelection
 * @param {function} props.setCellHighlight
 * @param {function} props.updateViewInfo
 * @param {function} props.onToolChange Callback for tool changes
 * (lasso/pan selection tools).
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 * @param {object} props.originalViewState A viewState object to pass to
 * setViewState upon clicking the recenter button.
 */
class Scatterplot extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.cellsQuadTree = null;
    this.cellsLayer = null;
    this.cellsData = null;
    this.stratifiedData = null;
    this.cellSetsForceSimulation = forceCollideRects();
    this.cellSetsLabelPrevZoom = null;
    this.cellSetsLayers = [];

    this.contourLayers = [];

    // Initialize data and layers.
    this.onUpdateCellsData();
    this.onUpdateCellsLayer();
    this.onUpdateCellSetsLayers();
    this.onUpdateStratifiedData();
    this.onUpdateContourLayers();
  }

  // TODO: support multiple types of contour layers
  // - One layer for all data points (no filtering)
  // - Array of per-selected-obsSet layers (filter to obsSet members)
  // - Array of per-selected-sampleSet layers (filter to sampleSet members)
  // - Array of per-sampleSet, per-obsSet layers (filter to sampleSet and obsSet members)
  createContourLayers() {
    const {
      //obsEmbeddingIndex: obsIndex,
      theme,
      stratifiedData,
      cellRadius = 1.0,
      cellOpacity = 1.0,
      // cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected,
      cellColors,
      //getCellColor = makeDefaultGetCellColors(cellColors, obsIndex, theme),
      //getExpressionValue,
      onCellClick,
      geneExpressionColormap,
      geneExpressionColormapRange = [0.0, 1.0],
      cellColorEncoding,
    } = this.props;

    const layers = Array.from(this.stratifiedData.entries()).flatMap(([obsSetKey, sampleSetMap], i) => Array.from(sampleSetMap.entries()).map(([sampleSetKey, arrs], j) => {
      const embeddingX = arrs.get('obsEmbeddingX');
      const embeddingY = arrs.get('obsEmbeddingY');
      const featureValues = arrs.get('featureValue');
      const obsIndex = arrs.get('obsIndex');

      return new ContourLayer({
        id: `contour-${i}-${j}`,
        coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
        data: { // TODO: memoize
          src: {
            embeddingX,
            embeddingY,
            featureValues,
            obsIndex,
          },
          length: obsIndex.length,
        },
        getWeight: (object, { index, data }) => {
          return data.src.featureValues[index];
        },
        visible: true,
        pickable: false,
        autoHighlight: false,
        filled: true,
        getPolygonOffset: () => ([0, 20]),
        // cellSize: 0.5,
        // contours: [
        //   { threshold: 10, color: [r, g, b, 0.9 * baseOpacity], strokeWidth: 2 },
        //   { threshold: [10, 1000], color: [r, g, b, 0.7 * baseOpacity] },
        cellSize: 0.25,
        //zOffset: 0.005 + (0.001 * i * j),

        // We will compute the contours internally,
        // but we need to provide a stable reference here.
        contours: baseContours,
        percentiles: [0.09, 0.9, 0.99], // TODO: get this from prop (from coordination space)
        getPosition: (object, { index, data, target }) => {
          target[0] = data.src.embeddingX[index];
          target[1] = -data.src.embeddingY[index];
          target[2] = 0;
          return target;
        },

        pattern: false,
        getFillPattern: () => "hatch-cross",
        getFillPatternScale: 350,
      });
    }));
    console.log(layers);
    return layers;

    // TODO: use stratifiedObsIndex, stratifiedObsEmbedding, and stratifiedGetExpressionValue props

    const baseOpacity = false ? 0.5 * 255 : 255;

    // TODO: return a separate contour layer for each cell set?
    // TODO: use real `group` object.
    const group = {
      name: 'test',
      color: [255, 0, 0],
      indices: obsIndex.map((x, i) => i), 
    }
    const { name, color: groupColor, indices } = group;

    const color = (true ? groupColor : [180, 180, 180]);
    const [r, g, b, a] = color;

    return [
      new ContourLayer({
        id: `contour`,
        coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
        data: this.cellsContourData, // TODO: pass filtered data
        getWeight: getExpressionValue, // TODO: pass a different getter function that is aware of the data filtering
        visible: true,
        pickable: false,
        autoHighlight: false,
        filled: true,
        getPolygonOffset: () => ([0, 20]),
        // cellSize: 0.5,
        // contours: [
        //   { threshold: 10, color: [r, g, b, 0.9 * baseOpacity], strokeWidth: 2 },
        //   { threshold: [10, 1000], color: [r, g, b, 0.7 * baseOpacity] },
        cellSize: 0.25,

        // We will compute the contours internally,
        // but we need to provide a stable reference here.
        contours: baseContours,
        percentiles: [0.09, 0.9, 0.99, 0.999], // TODO: get this from prop (from coordination space)
        getPosition: contourGetPosition,
        
        pattern: false,
        getFillPattern: () => "hatch-cross",
        getFillPatternScale: 350,
        updateTriggers: {
          getWeight: [getExpressionValue],
        },
      })
    ];
  }

  createCellsLayer() {
    const {
      obsEmbeddingIndex: obsIndex,
      theme,
      cellRadius = 1.0,
      cellOpacity = 1.0,
      // cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected,
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors, obsIndex, theme),
      getExpressionValue,
      onCellClick,
      geneExpressionColormap,
      geneExpressionColormapRange = [0.0, 1.0],
      cellColorEncoding,
    } = this.props;
    return new deck.ScatterplotLayer({
      id: CELLS_LAYER_ID,
      // Note that the reference for the object passed to the data prop should not change,
      // otherwise DeckGL will need to do a full re-render every time .createCellsLayer is called,
      // which can be very often to handle cellOpacity and cellRadius updates for dynamic opacity.
      data: this.cellsData,
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      visible: true,
      pickable: true,
      autoHighlight: true,
      filled: true,
      stroked: true,
      backgroundColor: (theme === 'dark' ? [0, 0, 0] : [241, 241, 241]),
      getCellIsSelected,
      opacity: cellOpacity,
      radiusScale: cellRadius,
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      // Our radius pixel setters measure in pixels.
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      getPosition,
      getFillColor: getCellColor,
      getLineColor: getCellColor,
      getRadius: 1,
      getExpressionValue,
      getLineWidth: 0,
      extensions: [
        new ScaledExpressionExtension(),
        new SelectionExtension({ instanced: true }),
      ],
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: (cellColorEncoding === 'geneSelection'),
      colormap: geneExpressionColormap,
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      onHover: getOnHoverCallback(obsIndex, setCellHighlight, setComponentHover),
      updateTriggers: {
        getExpressionValue,
        getFillColor: [cellColorEncoding, cellSelection, cellColors],
        getLineColor: [cellColorEncoding, cellSelection, cellColors],
        getCellIsSelected,
      },
    });
  }

  createCellSetsLayers() {
    const {
      theme,
      cellSetPolygons,
      viewState,
      cellSetPolygonsVisible,
      cellSetLabelsVisible,
      cellSetLabelSize,
    } = this.props;

    const result = [];

    if (cellSetPolygonsVisible) {
      result.push(new deck.PolygonLayer({
        id: 'cell-sets-polygon-layer',
        data: cellSetPolygons,
        stroked: true,
        filled: false,
        wireframe: true,
        lineWidthMaxPixels: 1,
        getPolygon: d => d.hull,
        getLineColor: d => d.color,
        getLineWidth: 1,
      }));
    }

    if (cellSetLabelsVisible) {
      const { zoom } = viewState;
      const nodes = cellSetPolygons.map(p => ({
        x: p.centroid[0],
        y: p.centroid[1],
        label: p.name,
      }));

      const collisionForce = this.cellSetsForceSimulation
        .size(d => ([
          cellSetLabelSize * 1 / (2 ** zoom) * 4 * d?.label?.length,
          cellSetLabelSize * 1 / (2 ** zoom) * 1.5,
        ]));

      forceSimulation()
        .nodes(nodes)
        .force('collision', collisionForce)
        .tick(NUM_FORCE_SIMULATION_TICKS);

      result.push(new deck.TextLayer({
        id: 'cell-sets-text-layer',
        data: nodes,
        getPosition: d => ([d.x, d.y]),
        getText: d => d.label,
        getColor: (theme === 'dark' ? [255, 255, 255] : [0, 0, 0]),
        getSize: cellSetLabelSize,
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: LABEL_FONT_FAMILY,
        fontWeight: 'normal',
      }));
    }

    return result;
  }

  createSelectionLayer() {
    const {
      obsEmbeddingIndex: obsIndex,
      obsEmbedding,
      viewState,
      setCellSelection,
    } = this.props;
    const { tool } = this.state;
    const { cellsQuadTree } = this;
    const flipYTooltip = true;
    const getCellCoords = makeDefaultGetObsCoords(obsEmbedding);
    return getSelectionLayer(
      tool,
      viewState.zoom,
      CELLS_LAYER_ID,
      [
        {
          getObsCoords: getCellCoords,
          obsIndex,
          obsQuadTree: cellsQuadTree,
          onSelect: (obsIds) => {
            setCellSelection(obsIds);
          },
        },
      ],
      flipYTooltip,
    );
  }

  getLayers() {
    const {
      cellsLayer,
      cellSetsLayers,
      contourLayers,
    } = this;
    return [
      //cellsLayer,
      ...contourLayers,
      ...cellSetsLayers,
      this.createSelectionLayer(),
    ];
  }

  onUpdateCellsData() {
    const { obsEmbedding } = this.props;
    if (obsEmbedding) {
      const getCellCoords = makeDefaultGetObsCoords(obsEmbedding);
      this.cellsQuadTree = createQuadTree(obsEmbedding, getCellCoords);
      this.cellsData = {
        src: {
          obsEmbedding,
        },
        length: obsEmbedding.shape[1],
      };
    }
  }

  onUpdateCellsLayer() {
    const { obsEmbeddingIndex, obsEmbedding } = this.props;
    if (obsEmbeddingIndex && obsEmbedding) {
      this.cellsLayer = this.createCellsLayer();
    } else {
      this.cellsLayer = null;
    }
  }

  onUpdateStratifiedData() {
    const { stratifiedData } = this.props;
    if (stratifiedData) {
      this.stratifiedData = stratifiedData;
    }
  }

  onUpdateContourLayers() {
    const { stratifiedData } = this.props;
    if (stratifiedData) {
      this.contourLayers = this.createContourLayers();
    } else {
      this.contourLayers = [];
    }
  }

  onUpdateCellSetsLayers(onlyViewStateChange) {
    // Because the label sizes for the force simulation depend on the zoom level,
    // we _could_ run the simulation every time the zoom level changes.
    // However, this has a performance impact in firefox.
    if (onlyViewStateChange) {
      const { viewState, cellSetLabelsVisible } = this.props;
      const { zoom } = viewState;
      const { cellSetsLabelPrevZoom } = this;
      // Instead, we can just check if the zoom level has changed
      // by some relatively large delta, to be more conservative
      // about re-running the force simulation.
      if (cellSetLabelsVisible
        && (
          cellSetsLabelPrevZoom === null
          || Math.abs(cellSetsLabelPrevZoom - zoom) > LABEL_UPDATE_ZOOM_DELTA
        )
      ) {
        this.cellSetsLayers = this.createCellSetsLayers();
        this.cellSetsLabelPrevZoom = zoom;
      }
    } else {
      // Otherwise, something more substantial than just
      // the viewState has changed, such as the label array
      // itself, so we always want to update the layer
      // in this case.
      this.cellSetsLayers = this.createCellSetsLayers();
    }
  }

  viewInfoDidUpdate() {
    const {
      obsEmbeddingIndex,
      obsEmbedding,
    } = this.props;
    super.viewInfoDidUpdate(
      obsEmbeddingIndex,
      obsEmbedding,
      makeFlippedGetObsCoords,
    );
  }

  /**
   * Here, asynchronously check whether props have
   * updated which require re-computing memoized variables,
   * followed by a re-render.
   * This function does not follow React conventions or paradigms,
   * it is only implemented this way to try to squeeze out
   * performance.
   * TODO: can this be replaced by React.memo with custom arePropsEqual?
   * @param {object} prevProps The previous props to diff against.
   */
  componentDidUpdate(prevProps) {
    this.viewInfoDidUpdate();

    const shallowDiff = propName => (prevProps[propName] !== this.props[propName]);
    let forceUpdate = false;
    if (['obsEmbedding', 'obsEmbeddingIndex'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateCellsData();
      forceUpdate = true;
    }

    if (['stratifiedData'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateStratifiedData();
      forceUpdate = true;
    }

    if ([
      'obsEmbeddingIndex', 'obsEmbedding', 'cellFilter', 'cellSelection', 'cellColors',
      'cellRadius', 'cellOpacity', 'cellRadiusMode', 'geneExpressionColormap',
      'geneExpressionColormapRange', 'geneSelection', 'cellColorEncoding',
      'getExpressionValue',
    ].some(shallowDiff)) {
      // Cells layer props changed.
      this.onUpdateCellsLayer();
      forceUpdate = true;
    }

    if (['stratifiedData'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateContourLayers();
      forceUpdate = true;
    }

    if ([
      'cellSetPolygons', 'cellSetPolygonsVisible',
      'cellSetLabelsVisible', 'cellSetLabelSize',
    ].some(shallowDiff)) {
      // Cell sets layer props changed.
      this.onUpdateCellSetsLayers(false);
      forceUpdate = true;
    }
    if (shallowDiff('viewState')) {
      // The viewState prop has changed (due to zoom or pan).
      this.onUpdateCellSetsLayers(true);
      forceUpdate = true;
    }
    if (forceUpdate) {
      this.forceUpdate();
    }
  }

  recenter() {
    const { originalViewState, setViewState } = this.props;
    if (Array.isArray(originalViewState?.target) && typeof originalViewState?.zoom === 'number') {
      setViewState(originalViewState);
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
const ScatterplotWrapper = forwardRef((props, deckRef) => (
  <Scatterplot
    {...props}
    deckRef={deckRef}
  />
));
ScatterplotWrapper.displayName = 'ScatterplotWrapper';
export default ScatterplotWrapper;
