import React, { useMemo, useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../utils';
import { useCellSetsData } from '../data-hooks';
import { treeToSetSizesBySetNames } from './reducer';

import CellSetSizesPlot from './CellSetSizesPlot';

const CELL_SET_SIZES_DATA_TYPES = ['cell-sets'];

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
export default function CellSetSizesPlotSubscriber(props) {
  const {
    loaders,
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSetSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetSizes, coordinationScopes);


  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SET_SIZES_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true);

  const [width, height, containerRef] = useGridItemSize();

  const data = useMemo(() => (cellSets && cellSetSelection
    ? treeToSetSizesBySetNames(cellSets, cellSetSelection)
    : []
  ), [cellSets, cellSetSelection]);

  return (
    <TitleInfo
      title="Cell Set Sizes"
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className="vega-container">
        <CellSetSizesPlot
          data={data}
          theme={theme}
          width={width}
          height={height}
        />
      </div>
    </TitleInfo>
  );
}
