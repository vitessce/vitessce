import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TitleInfo,
  useCoordination,
  useCoordinationScopes,
  useViewConfigStoreApi,
  cleanExportConfig,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
} from '@vitessce/constants-internal';
import { AnnotationController } from './AnnotationController.js';


export function AnnotationControllerSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    removeGridComponent,
    theme,
    title = 'Annotation',
    closeButtonVisible,
    helpText = ViewHelpMapping.ANNOTATION_CONTROLLER,
  } = props;

  // TODO: use the annotation frame and story hooks here - see EmbeddingScatterplotSubscriber.


  return (
    <TitleInfo
      title={title}
      theme={theme}
      withPadding={false}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <AnnotationController
        story={annotationStory}
        frameIndex={annotationFrameIndex}
        setFrameIndex={setAnnotationFrameIndex}
      />
    </TitleInfo>
  );
}
