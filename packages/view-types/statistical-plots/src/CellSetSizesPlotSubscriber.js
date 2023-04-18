import React, { useMemo, useEffect, useState } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsSetsData,
} from '@vitessce/vit-s';
import isEqual from 'lodash/isEqual';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, treeToSetSizesBySetNames } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';
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
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES], coordinationScopes);

  const title = titleOverride || `${capitalize(obsType)} Set Sizes`;

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const [currentHierarchyName, setCurrentHierarchyName] = useState('');
  const [cellSetSelectionLength, setCellSetSelectionLength] = useState(0);
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

  function findChangedHierarchy(arr1, arr2) {
    const subarrayToString = subarray => subarray.toString();
  
    const arr1Strings = arr1.map(subarrayToString);
    const arr2Strings = arr2.map(subarrayToString);
  
    const arr1UniqueStrings = arr1Strings.filter(subarrayStr => !arr2Strings.includes(subarrayStr));
    const arr2UniqueStrings = arr2Strings.filter(subarrayStr => !arr1Strings.includes(subarrayStr));
  
    if (arr1UniqueStrings.length === 0 && arr2UniqueStrings.length === 0) {
      return 0;
    }
  
    if (arr2UniqueStrings.length > 0) {
      const addedSubarray = arr2UniqueStrings[0].split(',').map(element => {
        return isNaN(Number(element)) ? element : Number(element);
      });
      return addedSubarray.slice(0, -1); // Return the hierarchy of the added clusters
    } else {
      const removedSubarray = arr1UniqueStrings[0].split(',').map(element => {
        return isNaN(Number(element)) ? element : Number(element);
      });
      return removedSubarray.slice(0, -1); // Return the hierarchy of the removed clusters
    }
  }

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const data = useMemo(() => {
    let newHierarchy;
    if (cellSetSelection) {
      newHierarchy = findChangedHierarchy(lastCellSetSelection, cellSetSelection);
      if (newHierarchy !== 0) {
        console.log("**** new hierarchy: ", newHierarchy);
        setLastCellSetSelection(cellSetSelection);
        setCurrentHierarchyName(newHierarchy);
      } else if (newHierarchy === 0) {
        newHierarchy = currentHierarchyName;
      }
    }
    console.log("the hierarchy we use: ", newHierarchy);
    console.log("++++ cellSetSelection: ", cellSetSelection);
    return (mergedCellSets && cellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, newHierarchy, cellSetColor, theme)
    : []
  )}, [mergedCellSets, cellSetSelection, cellSetColor, theme]);

  const onBarSelect = (setNamePath, shownPrev) => {
    console.log("setNamePath: ", setNamePath);
    if (shownPrev) {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, setNamePath)));
    } else {
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
