import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useGetObsInfo,
  useGetObsMembership,
  useMultiObsLabels,
  useObsEmbeddingData,
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, findLongestCommonPath, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { pluralize as plur, capitalize, commaNumber, cleanFeatureId } from '@vitessce/utils';
import { Neuroglancer } from './Neuroglancer.js';
import { debounce, isEqual } from 'lodash-es';

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    observationsLabelOverride,
    title = 'Neuroglancer',
    viewerState: viewerStateInitial = null,
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
  // console.log("index", obsIndex)

  // const mergedCellSets = useMemo(() => mergeObsSets(
  //   cellSets, additionalCellSets,
  // ), [cellSets, additionalCellSets]);

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

  // useEffect(() => {
  //   console.log("obsHighlight", obsHighlight,cellSetSelection)
  //   if (cellSetSelection) {
  //     const selectionFullPath = getObsMembership(obsHighlight);
  //     console.log("path", selectionFullPath);
  //     if (selectionFullPath?.length > 0) {
  //       const selectionToHighlight = findLongestCommonPath(selectionFullPath, cellSetSelection);
  //       if (selectionToHighlight) {
  //         setCellSetSelection([selectionToHighlight]);
  //         setCellColorEncoding('cellSelection');
  //       }
  //     }
  //   }
  // }, [cellSetSelection]);

  // const setCellSelectionProp = useCallback((v) => {
  //   setObsSelection(
  //     v, additionalCellSets, cellSetColor,
  //     setCellSetSelection, setAdditionalCellSets, setCellSetColor,
  //     setCellColorEncoding,
  //   );
  // }, [additionalCellSets, cellSetColor, setCellColorEncoding,
  //   setAdditionalCellSets, setCellSetColor, setCellSetSelection]);


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

  // console.log("NG colors", cellColors?.size, obsIndex?.length, cellSetSelection,mergedCellSets)


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);
  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);

  const rgbToHex = useCallback((rgb) => {
    if (typeof rgb === 'string') return rgb; // If it's already a hex string, return as is
    return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
  });


  const cellColorMapping = useMemo(() => {
    const colorCellMapping = {};
    cellSelectionSet.forEach((cell) => {
      if (cellColors.has(cell)) {
        colorCellMapping[cell] = rgbToHex(cellColors.get(cell));
      }
    });
    return colorCellMapping;
  }, [cellSelectionSet, cellColors, rgbToHex]);



  const mergedViewerStateRef = useRef(viewerStateInitial);
  const [mergedViewerState, setMergedViewerState] = useState(viewerStateInitial);


  // const cellColorMapping = useMemo(() => {
  //   const colorMap = {};
  //   Array.from(cellColors.keys()).forEach(cell => {
  //     colorMap[cell] = `#${cellColors.get(cell)?.map(c => c.toString(16).padStart(2, '0')).join('')}`;
  //   });
  //   return colorMap;
  // }, [cellColors]);

  // Debounced function to handle viewer state changes
  const debouncedHandleViewerStateChangeRef = useRef(null);

  useEffect(() => {
    debouncedHandleViewerStateChangeRef.current = debounce((newState) => {
      if (!isEqual(newState, mergedViewerStateRef.current)) {
        console.log("Updating viewer state:", newState);
        mergedViewerStateRef.current = newState;
        setMergedViewerState(newState);
      }
    }, 200);
  }, []); // ✅ Only initialize the debounce function once

  // Effect to merge cellColorMapping into the viewerState **without overriding interactions**
  useEffect(() => {
    setMergedViewerState(prevState => {
      if (!prevState || !prevState.layers?.length) return prevState;

      const newLayers = prevState.layers.map((layer, index) =>
        index === 0
          ? {
              ...layer,
              segments: Object.keys(cellColorMapping),
              segmentColors: cellColorMapping,
            }
          : layer
      );

      // ✅ Preserve user interactions by merging instead of replacing
      const newState = { ...prevState, layers: newLayers };

      if (isEqual(newState, prevState)) {
        return prevState; // Prevent unnecessary updates
      }

      // ✅ Store the updated state reference so interactions persist
      mergedViewerStateRef.current = newState;
      return newState;
    });
  }, [cellColorMapping]);


  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <Neuroglancer
        viewerState={mergedViewerState}
        onViewerStateChanged={debouncedHandleViewerStateChangeRef}
        onSegmentSelect={onSegmentSelect}
        cellColorMapping={cellColorMapping}
      />
    </TitleInfo>
  );
}
