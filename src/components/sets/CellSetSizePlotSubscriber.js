import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import { CELL_SETS_CHANGE } from '../../events';
import { treeToVisibleSetSizes } from './reducer';
import { useGridItemSize } from '../utils';

import CellSetSizePlot from './CellSetSizePlot';

/**
 * A subscriber component for `CellSetSizePlot`,
 * which listens for `CELL_SETS_CHANGE` events and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {function} props.onReady The function to call when the subscriptions
 * have been made.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export default function CellSetSizePlotSubscriber(props) {
  const {
    removeGridComponent,
    onReady,
    theme,
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [width, height, containerRef] = useGridItemSize();
  const [data, setData] = useState([]);

  useEffect(() => {
    const cellSetsChangeToken = PubSub.subscribe(CELL_SETS_CHANGE,
      (msg, cellSets) => {
        const setSizes = treeToVisibleSetSizes(cellSets);
        setData(setSizes);
      });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellSetsChangeToken);
    };
  }, [onReadyCallback]);

  return (
    <TitleInfo
      title="Cell Set Size"
      removeGridComponent={removeGridComponent}
    >
      <div ref={containerRef} className="vega-container">
        <CellSetSizePlot
          data={data}
          theme={theme}
          width={width}
          height={height}
        />
      </div>
    </TitleInfo>
  );
}
