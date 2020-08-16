/* eslint-disable */
import React, {
  useState, useCallback, useMemo, forwardRef,
} from 'react';
import DeckGL, { OrthographicView } from 'deck.gl';
import { quadtree } from 'd3-quadtree';
import { SelectableScatterplotLayer, getSelectionLayers } from '../../layers';
import ToolMenu from '../ToolMenu';
import {
  cellLayerDefaultProps, DEFAULT_COLOR,
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateStatus, createDefaultUpdateCellsSelection,
  createDefaultUpdateCellsHover,
  createDefaultUpdateViewInfo, createDefaultClearPleaseWait,
} from '../utils';

const COMPONENT_NAME = 'Scatterplot';
const CELLS_LAYER_ID = 'scatterplot';

/**
 * React component which renders a scatterplot from cell data, typically tSNE or PCA.
 * @prop {string} uuid
 * @prop {string} theme The current vitessce theme.
 * @prop {object} view
 * @prop {number} view.zoom
 * @prop {number[]} view.target See https://github.com/uber/deck.gl/issues/2580 for more information.
 * @prop {object} cells
 * @prop {string} mapping
 * @prop {object} cellColors Object mapping cell IDs to colors.
 * @prop {Set} selectedCellIds Set of selected cell IDs.
 * @prop {number} cellRadiusScale The value for `radiusScale` to pass
 * to the deck.gl cells ScatterplotLayer.
 * @prop {number} cellOpacity The value for `opacity` to pass
 * to the deck.gl cells ScatterplotLayer.
 * @prop {function} getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @prop {function} getCellPosition Getter function for cell [x, y, z] position.
 * @prop {function} getCellColor Getter function for cell color as [r, g, b] array.
 * @prop {function} getCellIsSelected Getter function for cell layer isSelected.
 * @prop {function} updateStatus
 * @prop {function} updateCellsSelection
 * @prop {function} updateCellsHover
 * @prop {function} updateViewInfo
 * @prop {function} clearPleaseWait
 * @prop {function} onCellClick Getter function for cell layer onClick.
 */
const Scatterplot = forwardRef((props, deckRef) => {
  const {
    uuid = null,
    theme,
    viewState,
    setViewState,
    cells,
    mapping,
    
    cellFilter = null,
    cellSelection = [],
    cellHighlight = null,

    setCellFilter,
    setCellSelection,
    setCellHighlight,

    cellRadiusScale = 0.2,
    cellOpacity = 1.0,
    getCellCoords = cell => cell.mappings[mapping],
    getCellPosition = (cellEntry) => {
      const { mappings } = cellEntry[1];
      if (!(mapping in mappings)) {
        const available = Object.keys(mappings).map(s => `"${s}"`).join(', ');
        throw new Error(`Expected to find "${mapping}", but available mappings are: ${available}`);
      }
      const mappedCell = mappings[mapping];
      // The negative applied to the y-axis is because
      // graphics rendering has the y-axis positive going south.
      return [mappedCell[0], -mappedCell[1], 0];
    },
    // TODO: implement getCellColor based on cell set selections and gene expression selections.
    cellColors,
    getCellColor = cellEntry => (cellColors && cellColors.get(cellEntry[0])) || DEFAULT_COLOR,
    getCellIsSelected = cellEntry => (
      cellSelection.length
        ? cellSelection.includes(cellEntry[0])
        : true // If nothing is selected, everything is selected.
    ),
    
    updateViewInfo = createDefaultUpdateViewInfo(COMPONENT_NAME),
    onCellClick = (info) => {
      const cellId = info.object[0];
      // TODO?
    },
  } = props;
  
  const [gl, setGl] = useState(null);
  const [tool, setTool] = useState(null);

  const onInitializeViewInfo = useCallback(({ viewport }) => {
    updateViewInfo({
      uuid,
      project: (cellId) => {
        const cellInfo = cells[cellId];
        try {
          const [positionX, positionY] = getCellPosition([cellId, cellInfo]);
          return viewport.project([positionX, positionY]);
        } catch (e) {
          return [null, null];
        }
      },
    });
  }, [updateViewInfo, uuid, cells, getCellPosition]);

  // Listen for viewState changes.
  const onViewStateChange = useCallback(({ viewState: nextViewState }) => {
    setViewState(nextViewState);
  }, [setViewState]);

  const cellsData = useMemo(() => {
    let result = null;
    if (cells) {
      // Process cells data and cache into re-usable array.
      result = Object.entries(cells);
    }
    return result;
  }, [cells]);

  // Graphics rendering has the y-axis positive going south,
  // so we need to flip it for rendering tooltips.
  const flipYTooltip = true;

  const layers = useMemo(() => {
    if (!cellsData) {
      return [];
    }
    return [
      new SelectableScatterplotLayer({
        id: CELLS_LAYER_ID,
        backgroundColor: (theme === 'dark' ? [0, 0, 0] : [241, 241, 241]),
        isSelected: getCellIsSelected,
        opacity: cellOpacity,
        radiusScale: cellRadiusScale,
        radiusMinPixels: 1.5,
        radiusMaxPixels: 10,
        getPosition: getCellPosition,
        getColor: getCellColor,
        onClick: (info) => {
          if (tool) {
            // If using a tool, prevent individual cell selection.
            // Let SelectionLayer handle the clicks instead.
            return;
          }
          onCellClick(info);
        },
        ...cellLayerDefaultProps(
          cellsData, undefined, setCellHighlight, uuid,
        ),
      }),
    ];
  }, [cellsData, theme, getCellIsSelected, cellOpacity, cellRadiusScale,
    getCellPosition, getCellColor, setCellHighlight, uuid,
    tool, onCellClick]);

  const cellsQuadTree = useMemo(() => {
    // Use the cellsData variable since it is already
    // an array, converted by Object.entries().
    if (!cellsData) {
      // Abort if the cells data is not yet available.
      return null;
    }
    const tree = quadtree()
      .x(d => getCellCoords(d[1])[0])
      .y(d => getCellCoords(d[1])[1])
      .addAll(cellsData);
    return tree;
  }, [getCellCoords, cellsData]);

  const selectionLayers = getSelectionLayers(
    tool,
    viewState.zoom,
    CELLS_LAYER_ID,
    getCellCoords,
    setCellSelection,
    cellsQuadTree,
    flipYTooltip,
  );

  const deckProps = {
    views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
    // gl needs to be initialized for us to use it in Texture creation
    layers: gl ? layers.concat(selectionLayers) : [],
    ...(tool ? {
      controller: { dragPan: false },
      getCursor: () => 'crosshair',
    } : {
      controller: true,
      getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
    }),
  };

  return (
    <>
      <div className="d-flex">
        <ToolMenu
          activeTool={tool}
          setActiveTool={setTool}
        />
      </div>
      <DeckGL
        ref={deckRef}
        onWebGLInitialized={setGl}
        glOptions={DEFAULT_GL_OPTIONS}
        onViewStateChange={onViewStateChange}
        viewState={viewState}
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
});

export default Scatterplot;
