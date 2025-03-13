import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
} from '@vitessce/vit-s';

import { ViewHelpMapping, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { setObsSelection, getObsInfoFromDataWithinSegments } from '@vitessce/sets-utils';
import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Neuroglancer } from './Neuroglancer.js';

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

  // console.log('Test', spatialTargetX, spatialTargetY, spatialZoom, obsSelection, obsSetSelection, additionalCellSets);

  const loaders = useLoaders();
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  console.log(obsSetSelection);

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
        viewerState={viewerStateInitial}
        // onViewerStateChanged={handleViewerStateChange}
        onSegmentSelect={onSegmentSelect}
      />
    </TitleInfo>
  );
}
