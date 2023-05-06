import React, { useMemo, useState, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsSetsData,
} from '@vitessce/vit-s';
import isEqual from 'lodash/isEqual';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, treeToSetSizesBySetNames } from '@vitessce/sets-utils';
import { capitalize, generateCellSetPaths, findChangedHierarchy } from '@vitessce/utils';
import CellSetSizesPlot from './CellSetSizesPlot';
import { useStyles } from './styles';

/**
 * A subscriber component for `CellSetSizePlot`,
 * which listens for cell sets data updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {function} props.onReady The function to call when the subscriptions
 * have been made.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {string} props.title The component title.
 */
export function CellSetSizesPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title: titleOverride,
  } = props;

  const classes = useStyles();

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    obsSetExpansion: cellSetExpansion,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES], coordinationScopes);

  const title = titleOverride || `${capitalize(obsType)} Set Sizes`;

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const [currentHierarchyName, setCurrentHierarchyName] = useState('');
  const [lastCellSetSelection, setLastCellSetSelection] = useState([]);

  // Get data from loaders using the data hooks.
  const [{ obsSets: cellSets }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, true,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([
    obsSetsStatus,
  ]);

  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  const getData = useCallback(() => {
    let newHierarchy = currentHierarchyName;

    if (cellSetSelection) {
      const changedHierarchy = findChangedHierarchy(lastCellSetSelection, cellSetSelection);
      setLastCellSetSelection(cellSetSelection);

      if (changedHierarchy !== 0) {
        setCurrentHierarchyName(changedHierarchy);
        newHierarchy = changedHierarchy;
      }
    }

    const cellSetPaths = generateCellSetPaths(mergedCellSets, newHierarchy, cellSetExpansion, cellSetSelection);

    if (mergedCellSets && cellSets && cellSetSelection && cellSetColor) {
      return treeToSetSizesBySetNames(
        mergedCellSets,
        cellSetPaths,
        cellSetSelection,
        cellSetColor,
        theme,
      );
    }

    return [];
  }, [cellSetSelection, cellSetColor, cellSets, mergedCellSets, theme]);

  const data = useMemo(getData, [
    mergedCellSets,
    cellSetSelection,
    cellSetExpansion,
    cellSetColor,
    theme,
  ]);

  const onBarSelect = (setNamePath, wasGrayedOut, selectOnlyEnabled = false) => {
    if (selectOnlyEnabled) {
      setCellSetSelection([setNamePath]);
      return;
    }
    if (!wasGrayedOut) {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, setNamePath)));
    } else if (wasGrayedOut) {
      setCellSetSelection([...cellSetSelection, setNamePath]);
    }
  };

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        <CellSetSizesPlot
          data={data}
          onBarSelect={onBarSelect}
          theme={theme}
          width={width}
          height={height}
          obsType={obsType}
        />
      </div>
    </TitleInfo>
  );
}
