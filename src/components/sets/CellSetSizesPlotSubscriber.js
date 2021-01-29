import React, { useMemo, useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { mergeCellSets } from '../utils';
import { useCellSetsData } from '../data-hooks';
import { treeToSetSizesBySetNames } from './cell-set-utils';
import CellSetSizesPlot from './CellSetSizesPlot';

const CELL_SET_SIZES_DATA_TYPES = ['cell-sets'];

/**
 * A subscriber component for `CellSetSizePlot`,
 * which listens for cell sets data updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {function} props.onReady The function to call when the subscriptions
 * have been made.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {boolean} props.initializeCellSetSelection Should the coordination
 * value be automatically initialized based on the data?
 * @param {boolean} props.initializeCellSetColor Should the coordination
 * value be automatically initialized based on the data?
 * @param {string} props.title The component title.
 */
export default function CellSetSizesPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    initializeCellSetSelection = true,
    initializeCellSetColor = true,
    title = 'Cell Set Sizes',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSetSelection,
    cellSetColor,
    additionalCellSets,
  }, {
    setCellSetSelection,
    setCellSetColor,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetSizes, coordinationScopes);

  const [width, height, containerRef] = useGridItemSize();
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
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, true,
    { setCellSetSelection, setCellSetColor },
    { initializeCellSetSelection, initializeCellSetColor },
  );

  const mergedCellSets = useMemo(
    () => mergeCellSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const data = useMemo(() => (mergedCellSets && cellSetSelection
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor]);

  return (
    <TitleInfo
      title={title}
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
