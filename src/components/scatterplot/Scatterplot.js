import React, { useState, useRef, useCallback } from 'react';
import DeckGL, { OrthographicView } from 'deck.gl';
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
 * @prop {object} view
 * @prop {number} view.zoom
 * @prop {number[]} view.target See https://github.com/uber/deck.gl/issues/2580 for more information.
 * @prop {object} cells
 * @prop {string} mapping
 * @prop {object} cellColors Object mapping cell IDs to colors.
 * @prop {Set} selectedCellIds Set of selected cell IDs.
 * @prop {number} cellRadiusScale The value for `radiusScale` to pass
 * to the deck.gl ScatterplotLayer.
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
export default function Scatterplot(props) {
  const {
    uuid = null,
    view = {
      zoom: 2,
      target: [0, 0, 0],
    },
    cells,
    mapping,
    cellColors,
    selectedCellIds = new Set(),
    cellRadiusScale = 0.2,
    getCellCoords = cell => cell.mappings[mapping],
    getCellPosition = (cellEntry) => {
      const { mappings } = cellEntry[1];
      if (!(mapping in mappings)) {
        const available = Object.keys(mappings).map(s => `"${s}"`).join(', ');
        throw new Error(`Expected to find "${mapping}", but available mappings are: ${available}`);
      }
      const mappedCell = mappings[mapping];
      return [mappedCell[0], mappedCell[1], 0];
    },
    getCellColor = cellEntry => (cellColors && cellColors[cellEntry[0]]) || DEFAULT_COLOR,
    getCellIsSelected = cellEntry => (
      selectedCellIds.size
        ? selectedCellIds.has(cellEntry[0])
        : true // If nothing is selected, everything is selected.
    ),
    updateStatus = createDefaultUpdateStatus(COMPONENT_NAME),
    updateCellsSelection = createDefaultUpdateCellsSelection(COMPONENT_NAME),
    updateCellsHover = createDefaultUpdateCellsHover(COMPONENT_NAME),
    updateViewInfo = createDefaultUpdateViewInfo(COMPONENT_NAME),
    clearPleaseWait = createDefaultClearPleaseWait(COMPONENT_NAME),
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
  } = props;

  const deckRef = useRef();
  const viewRef = useRef({
    viewport: null,
    width: null,
    height: null,
    uuid,
  });
  const [gl, setGl] = useState(null);
  const [tool, setTool] = useState(null);

  const onInitializeViewInfo = useCallback(({ width, height, viewport }) => {
    viewRef.current.viewport = viewport;
    viewRef.current.width = width;
    viewRef.current.height = height;
    updateViewInfo(viewRef.current);
  }, [viewRef, updateViewInfo]);

  if (cells) {
    clearPleaseWait('cells');
  }

  const layers = (cells ? [
    new SelectableScatterplotLayer({
      id: CELLS_LAYER_ID,
      isSelected: getCellIsSelected,
      // No radiusMin, so texture remains open even zooming out.
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
      ...cellLayerDefaultProps(Object.entries(cells), updateStatus, updateCellsHover, uuid),
    }),
  ] : []);

  const selectionLayers = getSelectionLayers(
    tool,
    view.zoom,
    CELLS_LAYER_ID,
    getCellCoords,
    updateCellsSelection,
  );

  const deckProps = {
    views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
    // gl needs to be initialized for us to use it in Texture creation
    layers: gl ? layers.concat(selectionLayers) : [],
    initialViewState: view,
    ...(tool ? {
      controller: { dragPan: false },
      getCursor: () => 'crosshair',
    } : {
      controller: true,
      getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
    }),
  };

  console.log("scatterplot render"); // eslint-disable-line

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
        {...deckProps}
      >
        {onInitializeViewInfo}
      </DeckGL>
    </>
  );
}
