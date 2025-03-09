import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { Neuroglancer } from './Neuroglancer.js';
import { setObsSelection, getObsInfoFromDataWithinSegments } from '@vitessce/sets-utils';
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
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
    obsSetSelection,
    obsSelectionMode,
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

  console.log("Test", spatialTargetX, spatialTargetY, spatialZoom, obsSelection, obsSetSelection, additionalCellSets);

  const loaders = useLoaders();
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: obsSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  // Use a ref to track the current viewerState.
  const currentViewerStateRef = useRef(viewerStateInitial);

  // Memoize the initial viewerState to prevent unnecessary changes.
  const stableViewerStateInitial = useMemo(() => viewerStateInitial, [viewerStateInitial]);

  // Update the ref when the initial viewerState changes.
  useEffect(() => {
    currentViewerStateRef.current = stableViewerStateInitial;
  }, [stableViewerStateInitial]);

  // Handle viewerState changes from the Neuroglancer component.
  const handleViewerStateChange = useCallback((newState) => {
    if (JSON.stringify(newState) !== JSON.stringify(currentViewerStateRef.current)) {
      currentViewerStateRef.current = newState;
    }
  }, []);

  // Handle segment selection.
  const onSegmentSelect = useCallback((value) => {
    console.log("Selected segments:", value);
    const selectedCellIds = value;
    setObsSelection(
      selectedCellIds, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Selection ',
      `: based on selected segments ${value} `,
    );
  }, [additionalCellSets, cellSetColor, dataset, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

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
      {stableViewerStateInitial && (
        <Neuroglancer
          viewerState={currentViewerStateRef.current}
          onViewerStateChanged={handleViewerStateChange}
          onSegmentSelect={onSegmentSelect}
        />
      )}
    </TitleInfo>
  );
}