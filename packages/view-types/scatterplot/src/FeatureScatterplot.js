/* eslint-disable no-param-reassign */
import React, { forwardRef } from 'react';
import { forceSimulation } from 'd3-force';
import { scaleLinear } from 'd3-scale';
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
const makeDefaultGetObsCoords = featurePositions => i => ([
  featurePositions.data[0][i],
  featurePositions.data[1][i],
  0,
]);
const makeFlippedGetObsCoords = featurePositions => i => ([
  featurePositions.data[0][i],
  -featurePositions.data[1][i],
  0,
]);
const getPosition = (object, { index, data, target }) => {
  target[0] = data.src.featurePositions.data[0][index];
  target[1] = -data.src.featurePositions.data[1][index];
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
    this.scatterplotLayer = null;
    this.featuresData = null;
    this.cellSetsForceSimulation = forceCollideRects();
    this.cellSetsLabelPrevZoom = null;
    this.axisLayers = [];

    // Initialize data and layers.
    this.onUpdateFeaturesData();
    this.onUpdateFeaturesLayer();
    this.onUpdateAxisLayers();
  }

  createAxisLayers() {
    const {
      theme,
      viewState,
      xExtent,
      height,
      width,
      marginTop,
      marginLeft,
      marginRight,
      marginBottom,
    } = this.props;
    if (!xExtent || !this.props.yExtent) return [];
    const yExtent = [-this.props.yExtent[1], this.props.yExtent[0]];
    const xMid = (xExtent[0] + xExtent[1]) / 2;
    const yMid = (yExtent[0] + yExtent[1]) / 2;

    const xScale = scaleLinear()
      .domain(xExtent);
    const xTicks = xScale.ticks();

    const yScale = scaleLinear()
      .domain(yExtent);
    const yTicks = yScale.ticks();

    const bgColor = (theme === 'dark' ? [0, 0, 0] : [241, 241, 241]);
    const fgColor = (theme === 'dark' ? [255, 255, 255] : [0, 0, 0]);

    const { zoom, target } = viewState;
    const scaleFactor = 2 ** zoom;
    function toDynamicX(fixedX) {
      const targetX = target[0];
      return targetX + ((fixedX - (width / 2)) / scaleFactor);
    }

    function toDynamicY(fixedY) {
      const targetY = target[1];
      return targetY + ((fixedY - (height / 2)) / scaleFactor);
    }

    function toDynamicSize(fixedSize) {
      return fixedSize / scaleFactor;
    }


    return [
      new deck.LineLayer({
        id: 'axis-lines',
        data: [
          {
            // x-axis
            source: [toDynamicX(marginLeft), toDynamicY(height - marginBottom)],
            target: [toDynamicX(width - marginRight), toDynamicY(height - marginBottom)],
          },
          {
            // y-axis
            source: [toDynamicX(marginLeft), toDynamicY(marginTop)],
            target: [toDynamicX(marginLeft), toDynamicY(height - marginBottom)],
          },
        ],
        getColor: fgColor,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getWidth: 2,
      }),
      new deck.TextLayer({
        id: 'x-axis-ticks',
        data: xTicks,
        getPosition: d => [d, toDynamicY(height - marginBottom + 20)],
        getText: d => `${d}`,
        getSize: d => toDynamicSize(15, viewState),
        getColor: fgColor,
        fontFamily: LABEL_FONT_FAMILY,
        sizeUnits: 'common',
      }),
      new deck.TextLayer({
        id: 'y-axis-ticks',
        data: yTicks,
        getPosition: d => [toDynamicX(marginLeft - 20), d],
        getText: d => `${d}`,
        getSize: toDynamicSize(15, viewState),
        getColor: fgColor,
        fontFamily: LABEL_FONT_FAMILY,
        sizeUnits: 'common',
      }),
      new deck.TextLayer({
        id: 'x-axis-title',
        data: [
          { text: 'log2(Fold Change)' },
        ],
        getPosition: d => [toDynamicX(width / 2), toDynamicY(height - marginBottom + 40)],
        getText: d => d.text,
        getSize: d => toDynamicSize(15),
        getColor: fgColor,
        fontFamily: LABEL_FONT_FAMILY,
        sizeUnits: 'common',
      }),
      new deck.TextLayer({
        id: 'y-axis-title',
        data: [
          { text: '-log10(Adjusted p-value)' },
        ],
        getAngle: 90,
        getPosition: d => [toDynamicX(marginLeft - 40), toDynamicY(height / 2)],
        getText: d => d.text,
        getSize: d => toDynamicSize(15),
        getColor: fgColor,
        fontFamily: LABEL_FONT_FAMILY,
        sizeUnits: 'common',
      }),
    ];
  }

  createFeaturesLayer() {
    const {
      featureIds: obsIndex,
      theme,
      featureRadius = 1.0,
      featureOpacity = 1.0,
      significanceThreshold,
      foldChangeThreshold,
      significantColor,
      insignificantColor,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected,
      cellColors,
      getExpressionValue,
      onCellClick,
      geneExpressionColormap,
      geneExpressionColormapRange = [0.0, 1.0],
      featureColorEncoding,
    } = this.props;
    return new deck.ScatterplotLayer({
      id: FEATURES_LAYER_ID,
      // Note that the reference for the object passed to the data prop should not change,
      // otherwise DeckGL will need to do a full re-render every time .createFeaturesLayer is called,
      // which can be very often to handle featureOpacity and featureRadius updates for dynamic opacity.
      data: this.featuresData,
      coordinateSystem: deck.COORDINATE_SYSTEM.CARTESIAN,
      visible: true,
      pickable: true,
      autoHighlight: true,
      filled: true,
      stroked: true,
      backgroundColor: (theme === 'dark' ? [0, 0, 0] : [241, 241, 241]),
      getCellIsSelected,
      opacity: featureOpacity,
      radiusScale: featureRadius,
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      // Our radius pixel setters measure in pixels.
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      getPosition,
      getFillColor: (object, { index, data }) => {
        const foldChange = data.src.featurePositions.data[0][index];
        const significance = data.src.featurePositions.data[1][index];
        if (Math.abs(foldChange) >= foldChangeThreshold && significance >= significanceThreshold) {
          return significantColor;
        }
        return insignificantColor;
      },
      getRadius: (object, { index, data }) => {
        const foldChange = data.src.featurePositions.data[0][index];
        const significance = data.src.featurePositions.data[1][index];
        if (Math.abs(foldChange) >= foldChangeThreshold && significance >= significanceThreshold) {
          return 1.5;
        }
        return 1;
      },
      getExpressionValue,
      getLineWidth: 0,
      extensions: [
        new ScaledExpressionExtension(),
        new SelectionExtension({ instanced: true }),
      ],
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: (featureColorEncoding === 'geneSelection'),
      colormap: geneExpressionColormap,
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      onHover: getOnHoverCallback(obsIndex, setCellHighlight, setComponentHover),
      updateTriggers: {
        getExpressionValue,
        getFillColor: [featureColorEncoding, cellSelection, cellColors],
        getLineColor: [featureColorEncoding, cellSelection, cellColors],
        getCellIsSelected,
      },
    });
  }

  createSelectionLayer() {
    const {
      featureIds: obsIndex,
      featurePositions,
      viewState,
      setCellSelection,
    } = this.props;
    const { tool } = this.state;
    const { cellsQuadTree } = this;
    const flipYTooltip = true;
    const getCellCoords = makeDefaultGetObsCoords(featurePositions);
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
      scatterplotLayer,
      axisLayers,
    } = this;
    return [
      scatterplotLayer,
      // ...axisLayers,
      ...this.createAxisLayers(),
      this.createSelectionLayer(),
    ];
  }

  onUpdateFeaturesData() {
    const { featurePositions } = this.props;
    if (featurePositions) {
      const getCellCoords = makeDefaultGetObsCoords(featurePositions);
      this.cellsQuadTree = createQuadTree(featurePositions, getCellCoords);
      this.featuresData = {
        src: {
          featurePositions,
        },
        length: featurePositions.shape[1],
      };
    }
  }

  onUpdateFeaturesLayer() {
    const { featureIds, featurePositions } = this.props;
    if (featureIds && featurePositions) {
      this.scatterplotLayer = this.createFeaturesLayer();
    } else {
      this.scatterplotLayer = null;
    }
  }

  onUpdateAxisLayers() {
    const { xExtent, yExtent } = this.props;
    if (xExtent && yExtent) {
      this.axisLayers = this.createAxisLayers();
    } else {
      this.axisLayers = [];
    }
  }

  viewInfoDidUpdate() {
    const {
      featureIds,
      featurePositions,
    } = this.props;
    super.viewInfoDidUpdate(
      featureIds,
      featurePositions,
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
    if (['featurePositions'].some(shallowDiff)) {
      // Cells data changed.
      this.onUpdateFeaturesData();
      forceUpdate = true;
    }

    if ([
      'featureIds', 'featurePositions', 'cellSelection', 'cellColors',
      'featureRadius', 'featureOpacity', 'geneExpressionColormap',
      'geneExpressionColormapRange', 'geneSelection', 'featureColorEncoding',
      'getExpressionValue',
    ].some(shallowDiff)) {
      // Cells layer props changed.
      this.onUpdateFeaturesLayer();
      forceUpdate = true;
    }

    if (['xExtent', 'yExtent'].some(shallowDiff)) {
      this.onUpdateAxisLayers();
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
