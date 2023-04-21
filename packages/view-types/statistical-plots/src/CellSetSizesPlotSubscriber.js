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
    obsSetExpansion: cellSetExpansion,
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


  console.log("$$$$$ EXPANDED:", cellSetExpansion);

  const getPaths = (node, currentPath = [], paths = []) => {
    if (node.children) {
      for (const child of node.children) {
        const newPath = [...currentPath, child.name];
        paths.push(newPath);
        getPaths(child, newPath, paths);
      }
    }
    return paths;
  };

  const filterPaths = (paths, currentHierarchyName) => {

    const isPathMatching = (path, arrOfPaths) => {
      return arrOfPaths.some(p => {
        if (p.length !== path.length) return false;
        
        return p.every((value, index) => value === path[index]);
      });
    };

    // arr1 is big, arr2 is small
    // Returns the longest path in arr1 that is a subset of arr2
    const findLongestSubset = (arr1, arr2) => {
      let longestSubset = null;
      let longestLength = 0;
    
      arr1.forEach(subArray => {
        let subArrayIndex = 0;
        let matchCount = 0;
    
        arr2.forEach(element => {
          if (subArray[subArrayIndex] === element) {
            matchCount++;
            subArrayIndex++;
          }
          if (subArrayIndex === subArray.length) return;
        });
    
        if (matchCount === subArray.length && subArray.length > longestLength) {
          longestSubset = subArray;
          longestLength = subArray.length;
        }
      });
    
      return longestLength > 0 ? longestSubset : [];
    };

    // returns the element with the longest length from arr1 that arr2 is a subset of.
    const findLongestElementWithSubset = (arr1, arr2) => {
      let longestElement = null;
      let longestLength = 0;
    
      for (const subArray of arr1) {
        let subArrayIndex = 0;
        let matchCount = 0;
    
        for (const element of arr2) {
          if (subArray[subArrayIndex] === element) {
            matchCount++;
            subArrayIndex++;
          }
          if (subArrayIndex === subArray.length) break;
        }
    
        if (matchCount === arr2.length && subArray.length > longestLength) {
          longestElement = subArray;
          longestLength = subArray.length;
        }
      }
    
      return longestLength > 0 ? longestElement : false;
    };

    return paths.filter(clusterPath => {

      // clusterPath is a parent of some cell sets and is expanded.
        if (isPathMatching(clusterPath, cellSetExpansion)) {
          console.log("---- Cluster path is expanded, discard it");
          return;
        }

        // clusterPath is not in cellSetSelection, now we need to determine if we should keep it.
        if (!isPathMatching(clusterPath, cellSetSelection)) {
  
          // clusterPath is a parent of some selected cell set and is not expanded:
          const longestSelectedChild = findLongestElementWithSubset(cellSetSelection, clusterPath);
          if (longestSelectedChild.length > clusterPath.length) {
            console.log("** cluster path is not selected and not expanded");
            return;
          }      
          const longestSubset = findLongestSubset(cellSetExpansion, clusterPath);
          // the clusterPath is too deep in the tree
          if (cellSetExpansion.length === 0 && clusterPath.length > 2) {
            console.log("** clusterPath goes too deep 1:", clusterPath, longestSubset);
            return;
          }
          // another case of the clusterPath being deep in the tree
          if (cellSetExpansion.length > 0 && longestSubset.length + 1 < clusterPath.length) {
            console.log("** clusterPath goes too deep 2:", clusterPath, longestSubset);
            return;
          }
        }
      return clusterPath[0] === currentHierarchyName[0];
    });
  };

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
    const allPaths = getPaths({ children: mergedCellSets.tree });
    const allClusters = filterPaths(allPaths, newHierarchy);
    return (mergedCellSets && cellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, allClusters, cellSetSelection, cellSetColor, theme)
    : []
  )}, [mergedCellSets, cellSetSelection, cellSetExpansion, cellSetColor, theme]);

  const onBarSelect = (setNamePath, shownPrev) => {
    console.log("setNamePath: ", setNamePath);
    if (shownPrev) {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, setNamePath)));
    } else {
      setCellSetSelection([...cellSetSelection, setNamePath]);
    }
  };

  const onSelectOnly = (setNamePath) => {
    setCellSetSelection([setNamePath]);
  }

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
