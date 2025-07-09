/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  TitleInfo,
  useCoordination,
  useObsSetsData,
  useLoaders,
  useObsEmbeddingData,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { isEqual } from 'lodash-es';
import { Neuroglancer } from './Neuroglancer.js';
import { useStyles } from './styles.js';
import {
  deckZoomToProjectionScale,
  projectionScaleToDeckZoom,
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  compareViewerState,

} from './utils.js';
import { useBaseScale } from './hooks.js';

// TODO: the initial value after 0 changes, should be a way to capture it as is
const deckZoom = -4.4;
const VITESSCE_INTERACTION_DELAY = 50;

export function NeuroglancerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
    viewerState: initialViewerState,
  } = props;

  const { classes } = useStyles();


  const NeuroglancerMemo = React.memo(Neuroglancer, (prevProps, nextProps) => {
    // console.log("NeuroglancerMemo", prevProps.viewerState, nextProps.viewerState);
    // Compare the viewer states to avoid unnecessary re-renders
    // It should return true if the old and new props are equal
    return true;
    //return compareViewerState(prevProps.viewerState, nextProps.viewerState);

  });

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
      withPadding={false}
    >
      {/* <button onClick={updateVitessceRotation}>Update</button> */}
      <NeuroglancerMemo
        classes={classes}
        onSegmentClick={() => {}}
        onSelectHoveredCoords={() => {}}
        viewerState={initialViewerState}
        // viewerState={initialViewerState}
        setViewerState={() => {}}
      />
    </TitleInfo>
  );
}
