import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useGetObsInfo,
  useGetObsMembership,
  useMultiObsLabels,
  useObsEmbeddingData,
  useNeuroglancerViewerState, useSetNeuroglancerViewerState
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, findLongestCommonPath, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { pluralize as plur, capitalize, commaNumber, cleanFeatureId } from '@vitessce/utils';
import { Neuroglancer } from './Neuroglancer.js';
import { debounce, isEqual, throttle , cloneDeep} from 'lodash-es';
function deepCompareAndLog(obj1, obj2, path = '') {
  if (isEqual(obj1, obj2)) {
    return;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    console.log(`Difference at ${path}:`, obj1, obj2);
    return;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const allKeys = new Set([...keys1, ...keys2]);

  allKeys.forEach(key => {
    const newPath = path ? `${path}.${key}` : key;
    deepCompareAndLog(obj1[key], obj2[key], newPath);
  });
}

export function NeuroglancerSubscriber(props) {
  console.log("sub mounted")
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    observationsLabelOverride,
    title = 'Neuroglancer',
    // viewerState: viewerStateInitial = null,
    helpText = ViewHelpMapping.NEUROGLANCER,
  } = props;

    const [{
      dataset,
      obsType,
      spatialZoom,
      spatialTargetX,
      spatialTargetY,
      spatialTargetZ,
      spatialRotationX,
      spatialRotationY,
      spatialRotationZ,
      spatialAxisFixed,
      spatialOrbitAxis,
      obsHighlight,
      obsSelection,
      obsSetSelection: cellSetSelection,
      obsSelectionMode,
      embeddingType: mapping,
      obsColorEncoding,
      obsFilter,
      obsSetFilter,
      additionalObsSets: additionalCellSets,
      obsSetColor: cellSetColor,
    }, {
      setAdditionalObsSets: setAdditionalCellSets,
      setObsSetColor: setCellSetColor,
      setObsColorEncoding: setCellColorEncoding,
      setObsSetSelection: setCellSetSelection,
    }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER], coordinationScopes);
  
    const observationsLabel = observationsLabelOverride || obsType;
    const loaders = useLoaders();
    const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
      coordinationScopes, obsType, loaders, dataset,
    );
    const observationsPluralLabel = plur(observationsLabel);
    // console.log('colorEncoding', obsColorEncoding);
  
  
    const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
      loaders, dataset, false,
      { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
      { cellSetSelection, obsSetColor: cellSetColor },
      { obsType },
    );
  
    // console.log("test", cellSetSelection, setCellColorEncoding);
    const [
      { obsIndex, obsEmbedding }, obsEmbeddingStatus, obsEmbeddingUrls,
    ] = useObsEmbeddingData(
      loaders, dataset, true, {}, {},
      { obsType, embeddingType: mapping },
    );

  
    const getObsInfo = useGetObsInfo(
      observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
    );
  
    const getObsMembership = useGetObsMembership(obsSetsMembership);
  
    const onSegmentSelect = useCallback((value) => {
      if (value) {
        const selectedCellIds = [value];
        setObsSelection(
          selectedCellIds, additionalCellSets, cellSetColor,
          setCellSetSelection, setAdditionalCellSets, setCellSetColor,
          setCellColorEncoding,
          'Selection ',
          `: based on selected segments ${value} `,
        );
      }
    }, [additionalCellSets, cellSetColor, dataset, setAdditionalCellSets,
      setCellColorEncoding, setCellSetColor, setCellSetSelection,
    ]);
    
    const mergedCellSets = useMemo(() => mergeObsSets(
      cellSets, additionalCellSets,
    ), [cellSets, additionalCellSets]);
  
    const cellColors = useMemo(() => getCellColors({
      cellSets: mergedCellSets,
      cellSetSelection,
      cellSetColor,
      obsIndex,
      theme,
    }), [mergedCellSets, theme,
      cellSetColor, cellSetSelection, obsIndex]);
  
  const rgbToHex = useCallback((rgb) => typeof rgb === 'string' ? rgb : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);

  const cellColorMapping = useMemo(() => {
    const colorCellMapping = {};
    cellColors.forEach((color, cell) => colorCellMapping[cell] = rgbToHex(color));
    return colorCellMapping;
  }, [cellColors, rgbToHex]);

  const viewerState = useNeuroglancerViewerState();
  const setViewerState = useSetNeuroglancerViewerState();
  const isFirstRender = useRef(true);

  const [mergedViewerState, setMergedViewerState] = useState(viewerState);
  const previousCellColorMapping = useRef(cellColorMapping);
  const previousMergedState = useRef(viewerState);
  const throttledHandleNeuroglancerStateChange = useRef(throttle((newState) => {
    console.log("newState before setViewerState:", newState);
    // setViewerState(newState);
  }, 100));

  const handleNeuroglancerStateChange = useCallback((newState) => {
    throttledHandleNeuroglancerStateChange.current(newState);
    console.log("state");
  }, [setViewerState]);

  useEffect(() => {
    console.log("sub mounted");
    if (!isEqual(cellColorMapping, previousCellColorMapping.current)) {
      previousCellColorMapping.current = cellColorMapping;
      setMergedViewerState((prevState) => {
        if (!prevState || !prevState.layers?.length) return prevState;

        const updatedLayers = prevState.layers.map((layer, index) =>
          index === 0
            ? { ...layer, segments: Object.keys(cellColorMapping), segmentColors: cellColorMapping }
            : layer
        );
        const updatedState = { ...prevState, layers: updatedLayers };
        return updatedState;
      });
    }
  }, [cellColorMapping]);

   useEffect(() => {
    console.log("viewerState changed");
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setMergedViewerState(viewerState);
      setViewerState(viewerState); // Update global state on initial render
      console.log("initial viewerState set:", viewerState);
      return;
    }

    deepCompareAndLog(viewerState, previousMergedState.current);

    if (!isEqual(viewerState, previousMergedState.current)) {
      previousMergedState.current = cloneDeep(viewerState);
      setMergedViewerState(viewerState);
      setViewerState(viewerState); // Update global state on subsequent renders
    }
  }, [viewerState]);

  useEffect(() => {
      console.log("initial viewerState", viewerState);
  }, []);

  return (
    <TitleInfo title={title} helpText={helpText} isSpatial theme={theme} closeButtonVisible={closeButtonVisible} downloadButtonVisible={downloadButtonVisible} removeGridComponent={removeGridComponent} isReady>
      <Neuroglancer viewerState={mergedViewerState} cellColorMapping={cellColorMapping} onViewerStateChanged={handleNeuroglancerStateChange} />
    </TitleInfo>
  );
}