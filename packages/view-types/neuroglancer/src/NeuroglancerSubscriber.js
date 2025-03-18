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

export function NeuroglancerSubscriber(props) {
  console.log('sub mounted');
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
    // const observationsPluralLabel = plur(observationsLabel);


  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [
    { obsIndex, obsEmbedding }, obsEmbeddingStatus, obsEmbeddingUrls,
  ] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );


  // const getObsInfo = useGetObsInfo(
  //   observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  // );

  // const getObsMembership = useGetObsMembership(obsSetsMembership);

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

  const rgbToHex = useCallback(rgb => (typeof rgb === 'string' ? rgb : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`));

  const cellColorMapping = useMemo(() => {
    const colorCellMapping = {};
    cellColors.forEach((color, cell) => colorCellMapping[cell] = rgbToHex(color));
    return colorCellMapping;
  }, [cellColors, rgbToHex]);

  return (
    <TitleInfo title={title} helpText={helpText} isSpatial theme={theme} closeButtonVisible={closeButtonVisible} downloadButtonVisible={downloadButtonVisible} removeGridComponent={removeGridComponent} isReady>
      <Neuroglancer cellColorMapping={cellColorMapping} />
    </TitleInfo>
  );
}
