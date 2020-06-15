import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';

import TitleInfo from '../TitleInfo';
import {
  CELLS_ADD, CELLS_COLOR, CELLS_HOVER, STATUS_INFO, VIEW_INFO, CELLS_SELECTION,
  CELL_SETS_VIEW, CLEAR_PLEASE_WAIT,
} from '../../events';
import Scatterplot from './Scatterplot';


export default function ScatterplotSubscriber(props) {
  const {
    onReady,
    mapping,
    uuid = null,
    children,
    view,
    removeGridComponent,
    theme,
  } = props;

  const [cells, setCells] = useState({});
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);
  const [cellRadiusScale, setCellRadiusScale] = useState(0.2);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, (msg, data) => {
        setCells(data);
      },
    );
    const cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, (msg, data) => {
        setCellColors(data);
      },
    );
    const cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, (msg, data) => {
        setSelectedCellIds(data);
      },
    );
    const cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, (msg, data) => {
        setSelectedCellIds(data);
      },
    );
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
    };
  }, [onReadyCallback, mapping]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (cells) {
      const cellCoordinates = Object.values(cells)
        .map(c => c.mappings[mapping]);
      const xExtent = extent(cellCoordinates, c => c[0]);
      const yExtent = extent(cellCoordinates, c => c[1]);
      const xRange = xExtent[1] - xExtent[0];
      const yRange = yExtent[1] - yExtent[0];
      const diagonalLength = Math.sqrt((xRange ** 2) + (yRange ** 2));
      // The 255 value here is a heuristic.
      const newScale = clamp(diagonalLength / 255, 0, 0.2);
      if (newScale) {
        setCellRadiusScale(newScale);
      }
    }
  }, [cells, mapping]);

  const cellsCount = Object.keys(cells).length;
  return (
    <TitleInfo
      title={`Scatterplot (${mapping})`}
      info={`${cellsCount} cells`}
      removeGridComponent={removeGridComponent}
    >
      {children}
      <Scatterplot
        uuid={uuid}
        theme={theme}
        view={view}
        cells={cells}
        mapping={mapping}
        selectedCellIds={selectedCellIds}
        cellColors={cellColors}
        cellRadiusScale={cellRadiusScale}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds)}
        updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
        updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
      />
    </TitleInfo>
  );
}
