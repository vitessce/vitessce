import { useMemo } from 'react';
import { isEqual } from 'lodash-es';
import { colorArrayToString } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';


function createOrdinalScale(domainArr, rangeArr) {
  return (queryVal) => {
    const i = domainArr.findIndex(domainVal => isEqual(domainVal, queryVal));
    return rangeArr[i];
  };
}

// Create a d3-scale ordinal scale mapping set paths to color strings.
export function getColorScale(setSelectionArr, setColorArr, theme) {
  /*
  // The equality seems incorrect with d3.scaleOrdinal
  return scaleOrdinal()
    .domain(setSelectionArr || [])
    .range(
    */
  const domainArr = setSelectionArr || [];
  const rangeArr = setSelectionArr
    ?.map(setNamePath => (
      setColorArr?.find(d => isEqual(d.path, setNamePath))?.color
          || getDefaultColor(theme)
    ))
    ?.map(colorArrayToString) || [];
  return createOrdinalScale(domainArr, rangeArr);
}


/**
 * Transform set paths which use group names to those which use column names.
 * @param {Record<string, string>} columnNameMapping Return value of useColumnNameMapping.
 * @param {string[][]} setPaths Array of set paths, such as obsSetSelection.
 * @returns {string[][]} Transformed set paths.
 */
export function useRawSetPaths(columnNameMapping, setPaths) {
  return useMemo(() => setPaths?.map((setPath) => {
    const newSetPath = [...setPath];
    if (newSetPath?.[0] && columnNameMapping[newSetPath[0]]) {
      newSetPath[0] = columnNameMapping[newSetPath[0]];
    }
    return newSetPath;
  }), [columnNameMapping, setPaths]);
}
