import React, { useMemo, useState } from 'react';
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
      const addedSubarray = arr2UniqueStrings[0].split(',').map((element) => {
        const num = Number(element);
        return num === parseFloat(element) ? num : element;
      });
      return addedSubarray.slice(0, -1); // Return the hierarchy of the added clusters
    }
    const removedSubarray = arr1UniqueStrings[0].split(',').map((element) => {
      const num = Number(element);
      return num === parseFloat(element) ? num : element;
    });
    return removedSubarray.slice(0, -1); // Return the hierarchy of the removed clusters
  }

  const getPaths = (node, currentPath = [], paths = []) => {
    if (node.children) {
      node.children.forEach((child) => {
        const newPath = [...currentPath, child.name];
        paths.push(newPath);
        getPaths(child, newPath, paths);
      });
    }
    return paths;
  };

  const filterPaths = (paths, hierarchy) => {
    const contains = (allPaths, path) => allPaths.some(p => p.toString() === path.toString());

    /**
     * Finds either the longest subset or the longest superset of path in
     * arrOfPaths.
     * @param {array} arrOfPaths An array of paths.
     * @param {array} path An array of strings, representing a path
     * @param {boolean} isSubset A boolean flag that indicates whether we are
     * looking for the longest subset (true) or the longest superset (false).
     */
    const findLongest = (arrOfPaths, path, isSubset) => {
      let longest = null; let
        longestLength = 0;
      arrOfPaths.forEach((subArray) => {
        const matchCount = subArray.filter((v, i) => v === path[i]).length;
        if (
          matchCount === (isSubset ? subArray.length : path.length)
            && subArray.length > longestLength
        ) {
          longest = subArray;
          longestLength = subArray.length;
        }
      });
      if (longestLength > 0) {
        return longest;
      } if (isSubset) {
        return [];
      }
      return false;
    };

    return paths.filter((clusterPath) => {
      // clusterPath is a parent of some selected cell set and is expanded. We should discard it.
      if (contains(cellSetExpansion, clusterPath)) return false;

      // clusterPath is not selected. Now we need to determine if we should keep it.
      if (!contains(cellSetSelection, clusterPath)) {
        /* This line checks if the longest super set of clusterPath in cellSetSelection is longer
         than clusterPath itself. If true, it means clusterPath is a parent of some selected cell
         set but not expanded and we should discard it. */
        if (findLongest(cellSetSelection, clusterPath, false).length > clusterPath.length) {
          return false;
        }

        // the clusterPath is too deep in the tree. We should discard it.
        if (cellSetExpansion.length === 0 && clusterPath.length > 2) return false;

        const longestSubset = findLongest(cellSetExpansion, clusterPath, true);
        // another case of the clusterPath being deep in the tree. We should discard it.
        if (cellSetExpansion.length > 0 && longestSubset.length + 1 < clusterPath.length) {
          return false;
        }
      }
      return clusterPath[0] === hierarchy[0];
    });
  };

  const data = useMemo(() => {
    let newHierarchy;
    if (cellSetSelection) {
      newHierarchy = findChangedHierarchy(lastCellSetSelection, cellSetSelection);
      if (newHierarchy !== 0) {
        setLastCellSetSelection(cellSetSelection);
        setCurrentHierarchyName(newHierarchy);
      } else if (newHierarchy === 0) {
        newHierarchy = currentHierarchyName;
      }
    }
    const allPaths = getPaths({ children: mergedCellSets.tree });
    const allClusters = filterPaths(allPaths, newHierarchy);
    return (mergedCellSets && cellSets && cellSetSelection && cellSetColor
      ? treeToSetSizesBySetNames(mergedCellSets, allClusters, cellSetSelection, cellSetColor, theme)
      : []
    );
  }, [mergedCellSets, cellSetSelection, cellSetExpansion, cellSetColor, theme]);

  const onBarSelect = (setNamePath, shownPrev) => {
    if (shownPrev) {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, setNamePath)));
    } else {
      setCellSetSelection([...cellSetSelection, setNamePath]);
    }
  };

  const onSelectOnly = (setNamePath) => {
    setCellSetSelection([setNamePath]);
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
          onSelectOnly={onSelectOnly}
          theme={theme}
          width={width}
          height={height}
          obsType={obsType}
        />
      </div>
    </TitleInfo>
  );
}
