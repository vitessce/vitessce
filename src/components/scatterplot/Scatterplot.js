import React, { forwardRef } from 'react';
import { SelectableScatterplotLayer, getSelectionLayers } from '../../layers';
import { cellLayerDefaultProps, DEFAULT_COLOR } from '../utils';
import {
  createCellsQuadTree,
} from '../shared-spatial-scatterplot/quadtree';
import AbstractSpatialOrScatterplot from '../shared-spatial-scatterplot/AbstractSpatialOrScatterplot';

const CELLS_LAYER_ID = 'scatterplot';

// Default getter function props.
const makeDefaultGetCellPosition = mapping => (cellEntry) => {
  const { mappings } = cellEntry[1];
  if (!(mapping in mappings)) {
    const available = Object.keys(mappings).map(s => `"${s}"`).join(', ');
    throw new Error(`Expected to find "${mapping}", but available mappings are: ${available}`);
  }
  const mappedCell = mappings[mapping];
  // The negative applied to the y-axis is because
  // graphics rendering has the y-axis positive going south.
  return [mappedCell[0], -mappedCell[1], 0];
};
const makeDefaultGetCellCoords = mapping => cell => cell.mappings[mapping];
const makeDefaultGetCellColors = cellColors => cellEntry => (
  cellColors && cellColors.get(cellEntry[0])
) || DEFAULT_COLOR;
const makeDefaultGetCellIsSelected = cellSelection => cellEntry => (
  cellSelection.length
    ? cellSelection.includes(cellEntry[0])
    : true // If nothing is selected, everything is selected.
);

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
 * @param {number} props.cellRadiusScale The value for `radiusScale` to pass
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
class Scatterplot extends AbstractSpatialOrScatterplot {
  constructor(props) {
    super(props);

    // To avoid storing large arrays/objects
    // in React state, this component
    // uses instance variables.
    // All instance variables used in this class:
    this.cellsEntries = [];
    this.cellsQuadTree = null;
    this.cellsLayer = null;

    // Initialize data and layers.
    this.onUpdateCellsData();
    this.onUpdateCellsLayer();
  }

  onInitializeViewInfo({ viewport }) {
    const {
      mapping,
      getCellPosition = makeDefaultGetCellPosition(mapping),
    } = this.props;
    super.onInitializeViewInfo(
      viewport,
      cell => getCellPosition([null, cell]),
    );
  }

  createCellsLayer() {
    const {
      theme,
      mapping,
      getCellPosition = makeDefaultGetCellPosition(mapping),
      cellRadiusScale = 0.2,
      cellOpacity = 1.0,
      cellFilter = null,
      cellSelection = [],
      setCellHighlight,
      setComponentHover,
      getCellIsSelected = makeDefaultGetCellIsSelected(cellSelection),
      cellColors,
      getCellColor = makeDefaultGetCellColors(cellColors),
      onCellClick,
    } = this.props;
    const { cellsEntries } = this;
    const filteredCellsEntries = (cellFilter
      ? cellsEntries.filter(cellEntry => cellFilter.includes(cellEntry[0]))
      : cellsEntries);

    return new SelectableScatterplotLayer({
      id: CELLS_LAYER_ID,
      backgroundColor: (theme === 'dark' ? [0, 0, 0] : [241, 241, 241]),
      isSelected: getCellIsSelected,
      opacity: cellOpacity,
      radiusScale: cellRadiusScale,
      radiusMinPixels: 1.5,
      radiusMaxPixels: 10,
      getPosition: getCellPosition,
      getColor: getCellColor,
      getLineWidth: 0,
      onClick: (info) => {
        if (onCellClick) {
          onCellClick(info);
        }
      },
      ...cellLayerDefaultProps(
        filteredCellsEntries, undefined, setCellHighlight, setComponentHover,
      ),
    });
  }

  createSelectionLayers() {
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
      CELLS_LAYER_ID,
      getCellCoords,
      setCellSelection,
      cellsQuadTree,
      flipYTooltip,
    );
  }

  getLayers() {
    const {
      cellsLayer,
    } = this;
    return [
      cellsLayer,
      ...this.createSelectionLayers(),
    ];
  }

  onUpdateCellsData() {
    const {
      cells = {},
      mapping,
      getCellCoords = makeDefaultGetCellCoords(mapping),
    } = this.props;
    const cellsEntries = Object.entries(cells);
    this.cellsEntries = cellsEntries;
    this.cellsQuadTree = createCellsQuadTree(cellsEntries, getCellCoords);
  }

  onUpdateCellsLayer() {
    this.cellsLayer = this.createCellsLayer();
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
      'cells', 'cellFilter', 'cellSelection', 'cellColors', 'cellRadiusScale',
    ].some(shallowDiff)) {
      // Cells layer props changed.
      this.onUpdateCellsLayer();
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
const ScatterplotWrapper = forwardRef((props, deckRef) => (
  <Scatterplot
    {...props}
    deckRef={deckRef}
  />
));
export default ScatterplotWrapper;
