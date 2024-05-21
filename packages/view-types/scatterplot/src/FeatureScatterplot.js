/* eslint-disable no-param-reassign */
import React, { forwardRef } from 'react';
import { forceSimulation } from 'd3-force';
import {
  deck, getSelectionLayer, ScaledExpressionExtension, SelectionExtension,
} from '@vitessce/gl';
import { getDefaultColor } from '@vitessce/utils';
import {
  AbstractSpatialOrScatterplot, createQuadTree, forceCollideRects, getOnHoverCallback,
} from './shared-spatial-scatterplot/index.js';

const FEATURES_LAYER_ID = 'feature-scatterplot';
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


class FeatureScatterplot extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.cellsQuadTree = null;
    this.cellsLayer = null;
    this.cellsData = null;
    this.cellSetsForceSimulation = forceCollideRects();
    this.cellSetsLabelPrevZoom = null;
    this.cellSetsLayers = [];

    // Initialize data and layers.
    this.onUpdateCellsData();
    this.onUpdateCellsLayer();
  }

  createCellsLayer() {
    const {
      obsEmbeddingIndex: obsIndex,
      theme,
      cellRadius = 1.0,
      cellOpacity = 1.0,
      significanceThreshold,
      foldChangeThreshold,
      significantColor,
      insignificantColor,
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
      id: FEATURES_LAYER_ID,
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
      getFillColor: (object, { index, data }) => {
        const foldChange = data.src.obsEmbedding.data[0][index];
        const significance = data.src.obsEmbedding.data[1][index];
        if (Math.abs(foldChange) >= foldChangeThreshold && significance >= significanceThreshold) {
          return significantColor;
        }
        return insignificantColor;
      },
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
      FEATURES_LAYER_ID,
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
    } = this;
    return [
      cellsLayer,
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
   * @param {object} prevProps The previous props to diff against.
   */
  componentDidUpdate(prevProps) {
    this.viewInfoDidUpdate();

    const shallowDiff = propName => (prevProps[propName] !== this.props[propName]);
    let forceUpdate = false;
    if (['obsEmbedding'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateCellsData();
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
  <FeatureScatterplot
    {...props}
    deckRef={deckRef}
  />
));
ScatterplotWrapper.displayName = 'FeatureScatterplotWrapper';
export default ScatterplotWrapper;
