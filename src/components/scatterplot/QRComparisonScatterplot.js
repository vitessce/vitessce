/* eslint-disable */
import React, { forwardRef } from 'react';
import { PolygonLayer, TextLayer, ScatterplotLayer, PointCloudLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { HeatmapLayer } from '@deck.gl/aggregation-layers'; // eslint-disable-line import/no-extraneous-dependencies
import { forceSimulation } from 'd3-force';
import { getSelectionLayers } from '../../layers';
import { cellLayerDefaultProps, getDefaultColor } from '../utils';
import {
  createCellsQuadTree,
} from '../shared-spatial-scatterplot/quadtree';
import AbstractSpatialOrScatterplot from '../shared-spatial-scatterplot/AbstractSpatialOrScatterplot';
import { forceCollideRects } from '../shared-spatial-scatterplot/force-collide-rects';
import { ScaledExpressionExtension, SelectionExtension } from '../../layer-extensions';
import { Matrix4 } from "@math.gl/core";

const REF_LAYER_ID = 'ref-scatterplot';
const QRY_LAYER_ID = 'qry-scatterplot';
const LABEL_FONT_FAMILY = "-apple-system, 'Helvetica Neue', Arial, sans-serif";
const NUM_FORCE_SIMULATION_TICKS = 100;
const LABEL_UPDATE_ZOOM_DELTA = 0.25;

// Default getter function props.
const makeDefaultGetCellPosition = (mapping, zVal) => (cellEntry) => {
  const { mappings } = cellEntry[1];
  if (!(mapping in mappings)) {
    const available = Object.keys(mappings).map(s => `"${s}"`).join(', ');
    throw new Error(`Expected to find "${mapping}", but available mappings are: ${available}`);
  }
  const mappedCell = mappings[mapping];
  // The negative applied to the y-axis is because
  // graphics rendering has the y-axis positive going south.
  return [mappedCell[0], -mappedCell[1], zVal]; // TODO: fix upstream
};
const makeDefaultGetCellCoords = mapping => cell => cell.mappings[mapping];
const makeDefaultGetCellColors = (cellColors, theme) => (cellEntry) => {
  const [r, g, b, a] = (cellColors && cellColors.get(cellEntry[0])) || getDefaultColor(theme);
  return [r, g, b, 255 * (a || 1)];
};

/**
 * React component which renders a scatterplot from cell data, typically tSNE or PCA.
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
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.setCellSelection
 * @param {function} props.setCellHighlight
 * @param {function} props.updateViewInfo
 * @param {function} props.onToolChange Callback for tool changes
 * (lasso/pan/rectangle selection tools).
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 */
class QRComparisonScatterplot extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.cellsEntries = [];
    this.cellsQuadTree = null;
    this.qryCellsLayer = null;
    this.refCellsLayer = null;
    this.cellSetsForceSimulation = forceCollideRects();
    this.cellSetsLabelPrevZoom = null;
    this.cellSetsLayers = [];

    // Initialize data and layers.
    this.onUpdateRefCellsData();
    this.onUpdateQryCellsData();
    this.onUpdateRefCellsLayer();
    this.onUpdateQryCellsLayer();
    this.onUpdateCellSetsLayers();
  }

  createRefCellsLayer() {
    const { cellsEntries } = this;
    const {
      theme,
      mapping,
      getCellPosition = makeDefaultGetCellPosition(mapping, 0),
      cellRadius = 1.0,
      cellOpacity = 1.0,
      cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected,
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors, theme),
      getExpressionValue,
      onCellClick,
      geneExpressionColormap,
      geneExpressionColormapRange = [0.0, 1.0],
      cellColorEncoding,
    } = this.props;
    const filteredCellsEntries = (cellFilter
      ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0]))
      : cellsEntries);
    return new HeatmapLayer({
      id: REF_LAYER_ID,
      radiusPixels: 40,
      radiusScale: cellRadius,
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      colorRange: [
        [247,247,247],
        [217,217,217],
        [189,189,189],
        [150,150,150],
        [99,99,99],
        [37,37,37]
      ],
      getPolygonOffset: () => ([0, 100]),
      //modelMatrix: new Matrix4().makeTranslation(0, 0, 1),
      // Our radius pixel setters measure in pixels.
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      getPosition: getCellPosition,
      getFillColor: getCellColor,
      getLineColor: getCellColor,
      getPointRadius: 1,
      getExpressionValue,
      getLineWidth: 0,
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: (cellColorEncoding === 'geneSelection'),
      colormap: geneExpressionColormap,
      updateTriggers: {
        getExpressionValue,
        getFillColor: [cellColorEncoding, cellSelection, cellColors],
        getLineColor: [cellColorEncoding, cellSelection, cellColors],
        getCellIsSelected,
      },
      ...cellLayerDefaultProps(
        filteredCellsEntries, undefined, setCellHighlight, setComponentHover,
      ),
    });
  }

  createQryCellsLayer() {
    const { cellsEntries } = this;
    const {
      theme,
      mapping,
      getCellPosition = makeDefaultGetCellPosition(mapping, 2),
      cellRadius = 1.0,
      cellOpacity = 1.0,
      cellFilter,
      cellSelection,
      setCellHighlight,
      setComponentHover,
      getCellIsSelected,
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors, theme),
      getExpressionValue,
      onCellClick,
      geneExpressionColormap,
      geneExpressionColormapRange = [0.0, 1.0],
      cellColorEncoding,
    } = this.props;
    const filteredCellsEntries = (cellFilter
      ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0]))
      : cellsEntries);
    return new ScatterplotLayer({
      id: QRY_LAYER_ID,
      opacity: cellOpacity,
      radiusScale: cellRadius, // TODO: fix upstream
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      // Reference: http://pessimistress.github.io/deck.gl/docs/api-reference/core/layer#getpolygonoffset
      getPolygonOffset: () => ([0, -100]), // TODO: determine optimal value
      // Our radius pixel setters measure in pixels.
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      getPosition: getCellPosition,
      getFillColor: getCellColor,
      getLineColor: getCellColor,
      getPointRadius: 1,
      getExpressionValue,
      getLineWidth: 0,
      colorScaleLo: geneExpressionColormapRange[0],
      colorScaleHi: geneExpressionColormapRange[1],
      isExpressionMode: (cellColorEncoding === 'geneSelection'),
      colormap: geneExpressionColormap,
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      updateTriggers: {
        getExpressionValue,
        getFillColor: [cellColorEncoding, cellSelection, cellColors],
        getLineColor: [cellColorEncoding, cellSelection, cellColors],
        getCellIsSelected,
      },
      ...cellLayerDefaultProps(
        filteredCellsEntries, undefined, setCellHighlight, setComponentHover,
      ),
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
      result.push(new PolygonLayer({
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
          cellSetLabelSize * 1 / (2 ** zoom) * 4 * d.label.length,
          cellSetLabelSize * 1 / (2 ** zoom) * 1.5,
        ]));

      forceSimulation()
        .nodes(nodes)
        .force('collision', collisionForce)
        .tick(NUM_FORCE_SIMULATION_TICKS);

      result.push(new TextLayer({
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

  createQrySelectionLayers() {
    const {
      viewState,
      mapping,
      getCellCoords = makeDefaultGetCellCoords(mapping),
      setCellSelection,
    } = this.props;
    const { tool } = this.state;
    const { cellsQuadTree } = this;
    const flipYTooltip = true;
    return getSelectionLayers(
      tool,
      viewState.zoom,
      QRY_LAYER_ID,
      getCellCoords,
      setCellSelection,
      cellsQuadTree,
      flipYTooltip,
    );
  }

  getLayers() {
    const {
      refCellsLayer,
      qryCellsLayer,
      cellSetsLayers,
    } = this;
    return [
      qryCellsLayer,
      refCellsLayer,
      //...cellSetsLayers,
      //...this.createQrySelectionLayers(),
      // TODO: ref selection layers
    ];
  }

  onUpdateQryCellsData() {
    const {
      cells = {},
      mapping,
      getCellCoords = makeDefaultGetCellCoords(mapping),
    } = this.props;
    const cellsEntries = Object.entries(cells);
    // TODO: store in qryCells___ variables
    this.cellsEntries = cellsEntries;
    this.cellsQuadTree = createCellsQuadTree(cellsEntries, getCellCoords);
  }

  onUpdateRefCellsData() {
    // TODO
  }

  onUpdateQryCellsLayer() {
    this.qryCellsLayer = this.createQryCellsLayer();
  }

  onUpdateRefCellsLayer() {
    this.refCellsLayer = this.createRefCellsLayer();
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
      mapping,
      getCellPosition = makeDefaultGetCellPosition(mapping, 0),
    } = this.props;
    super.viewInfoDidUpdate(cell => getCellPosition([null, cell]));
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
      this.onUpdateQryCellsData();
      this.onUpdateRefCellsData();
      this.forceUpdate();
    }

    if ([
      'cells', 'cellFilter', 'cellSelection', 'cellColors',
      'cellRadius', 'cellOpacity', 'cellRadiusMode', 'geneExpressionColormap',
      'geneExpressionColormapRange', 'geneSelection', 'cellColorEncoding',
    ].some(shallowDiff)) {
      // Cells layer props changed.
      this.onUpdateQryCellsLayer();
      this.onUpdateRefCellsLayer();
      this.forceUpdate();
    }
    if ([
      'cellSetPolygons', 'cellSetPolygonsVisible',
      'cellSetLabelsVisible', 'cellSetLabelSize',
    ].some(shallowDiff)) {
      // Cell sets layer props changed.
      this.onUpdateCellSetsLayers(false);
      this.forceUpdate();
    }
    if (shallowDiff('viewState')) {
      // The viewState prop has changed (due to zoom or pan).
      this.onUpdateCellSetsLayers(true);
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
const QRComparisonScatterplotWrapper = forwardRef((props, deckRef) => (
  <QRComparisonScatterplot
    {...props}
    deckRef={deckRef}
  />
));
export default QRComparisonScatterplotWrapper;
