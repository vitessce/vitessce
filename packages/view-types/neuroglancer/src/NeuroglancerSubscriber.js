import React from 'react';
import {
  TitleInfo,
} from '@vitessce/vit-s';
import { ViewHelpMapping } from '@vitessce/constants-internal';
import { Neuroglancer } from './Neuroglancer.js';

export function NeuroglancerSubscriber(props) {
  const {
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Neuroglancer',
    viewerState: viewerStateInitial = null,
    helpText = ViewHelpMapping.NEUROGLANCER,
  } = props;

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
      {viewerStateInitial && <Neuroglancer viewerState={viewerStateInitial} />}
    </TitleInfo>

  );
}
