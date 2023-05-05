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
import { capitalize, filterPaths } from '@vitessce/utils';
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

  const getNewHierarchy = useCallback((lastSelection, currentSelection) => {
    const findChangedHierarchy = (arr1, arr2) => {
      const subarrayToString = subarray => subarray.toString();

      const arr1Strings = arr1.map(subarrayToString);
      const arr2Strings = arr2.map(subarrayToString);

      const arr1UniqueStrings = arr1Strings.filter(
        subarrayStr => !arr2Strings.includes(subarrayStr),
      );
      const arr2UniqueStrings = arr2Strings.filter(
        subarrayStr => !arr1Strings.includes(subarrayStr),
      );

      if (arr1UniqueStrings.length === 0 && arr2UniqueStrings.length === 0) {
        return 0;
      }

      const changedSubarrayString = arr2UniqueStrings.length > 0
        ? arr2UniqueStrings[0] : arr1UniqueStrings[0];

      const convertSubarrayElements = subarray => subarray.split(',').map((element) => {
        const num = Number(element);
        return num === parseFloat(element) ? num : element;
      });

      const changedSubarray = convertSubarrayElements(changedSubarrayString);

      return changedSubarray.slice(0, -1); // Return the hierarchy of the changed clusters
    };

    const changedHierarchy = findChangedHierarchy(lastSelection, currentSelection);

    if (changedHierarchy !== 0) {
      setLastCellSetSelection(currentSelection);
      setCurrentHierarchyName(changedHierarchy);
      return changedHierarchy;
    } if (changedHierarchy === 0) {
      return currentHierarchyName;
    }

    return null;
  }, [currentHierarchyName]);

  const getData = useCallback(() => {
    let newHierarchy;

    if (cellSetSelection) {
      newHierarchy = getNewHierarchy(lastCellSetSelection, cellSetSelection);
    }

    const allClusters = filterPaths(mergedCellSets.tree, newHierarchy, cellSetExpansion, cellSetSelection);

    if (mergedCellSets && cellSets && cellSetSelection && cellSetColor) {
      return treeToSetSizesBySetNames(
        mergedCellSets,
        allClusters,
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

  const onBarSelect = (setNamePath, wasGrayedOut, isSelectOnly = false) => {
    if (isSelectOnly) {
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
