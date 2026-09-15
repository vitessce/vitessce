/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useFeatureStatsData,
  useMatchingLoader,
  useColumnNameMapping,
  useCoordinationScopes,
  useMultiCoordinationScopes,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
  DataType,
  CoordinationType,
} from '@vitessce/constants-internal';
import { isEqual } from 'lodash-es';
import SingleCellSetSelector from './SingleCellSetSelector.js';

export function SingleCellSetSelectorSubscriber(props) {
  const {
    title = 'Cell Type of Interest',
    coordinationScopes: coordinationScopesRaw,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.SINGLE_OBS_SET_SELECTOR,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  // Get "props" from the coordination space.
  const [{
    obsType,
    obsSetColor,
  }, {
    setObsType,
    setObsSetColor,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SINGLE_OBS_SET_SELECTOR],
    coordinationScopes,
  );


  const obsSetSelectionScopes = useMultiCoordinationScopes(
    CoordinationType.OBS_SET_SELECTION,
    coordinationScopes,
  );

  const [{
    obsSetSelection: multiObsSetSelection,
  }, {
    setObsSetSelection: setMultiObsSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SINGLE_OBS_SET_SELECTOR],
    { obsSetSelection: obsSetSelectionScopes?.[0] },
  );

  const [{
    obsSetSelection: singleObsSetSelectionArr,
  }, {
    setObsSetSelection: setSingleObsSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SINGLE_OBS_SET_SELECTOR],
    { obsSetSelection: obsSetSelectionScopes?.[1] },
  );

  const singleObsSetSelection = singleObsSetSelectionArr?.[0];


  useEffect(() => {
    // If multiObsSetSelection changes, there are multiple things that can occur:
    // - length is one and does not match the current singleObsSetSelection
    //   -> we update singleObsSetSelection.
    // - length is zero or does not contain the current singleObsSetSelection
    //   -> we set singleObsSetSelection to null or the first entry of the
    //      multiple selection array.
    // - otherwise, do nothing.

    if (!Array.isArray(multiObsSetSelection) || multiObsSetSelection.length === 0) {
      setSingleObsSetSelection(null);
    } else {
      const multiContainsSingle = multiObsSetSelection.some(
        setPath => isEqual(setPath, singleObsSetSelection),
      );
      if (!multiContainsSingle) {
        setSingleObsSetSelection([multiObsSetSelection?.[0]]);
      }
    }
  }, [multiObsSetSelection]);

  const errors = [];

  const isReady = useReady([]);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      errors={errors}
      withPadding={false}
    >
      {Array.isArray(multiObsSetSelection) && multiObsSetSelection.length > 0 ? (
        <SingleCellSetSelector
          theme={theme}
          obsType={obsType}
          obsSetColor={obsSetColor}
          multiObsSetSelection={multiObsSetSelection}
          singleObsSetSelection={singleObsSetSelection}
          setSingleObsSetSelection={setSingleObsSetSelection}
        />
      ) : (
        <p style={{ padding: '12px' }}>Select at least one {obsType} set.</p>
      )}
    </TitleInfo>
  );
}
