import React from 'react';
import {
  TitleInfo,
  useReady,
  useUrls,
  useCoordination,
  useLoaders,
  useViewMapping,
  useAnnotationStoryData,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
} from '@vitessce/constants-internal';
import { AnnotationController } from './AnnotationController.js';

/**
 * A subscriber component for the annotation story controller.
 * @param {object} props
 * @param {string} props.uuid The unique identifier for this component, also used as its
 * view uid for looking up its coordination mapping via `useViewMapping`.
 * @param {string} props.theme The current theme name.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function AnnotationControllerSubscriber(props) {
  const {
    uuid,
    removeGridComponent,
    theme,
    title = 'Annotation',
    closeButtonVisible,
    downloadButtonVisible,
    helpText = ViewHelpMapping.ANNOTATION_CONTROLLER,
  } = props;

  const loaders = useLoaders();
  const [
    coordinationScopes, _coordinationScopesBy, coordinationValues,
  ] = useViewMapping(uuid);

  const [{
    dataset,
    annotationStory,
    annotationFrameIndex,
  }, {
    setAnnotationStory,
    setAnnotationFrameIndex,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.ANNOTATION_CONTROLLER], coordinationScopes,
    coordinationValues, uuid,
  );

  // The loaded story is only used to initialize the annotationStory
  // coordination value (when it is currently null), so the data is not needed here.
  const [
    , annotationStoryStatus, annotationStoryUrls, annotationStoryError,
  ] = useAnnotationStoryData(
    loaders, dataset, false,
    { setAnnotationStory },
    { annotationStory },
    {},
  );

  const errors = [annotationStoryError];
  const isReady = useReady([annotationStoryStatus]);
  const urls = useUrls([annotationStoryUrls]);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      isReady={isReady}
      urls={urls}
      errors={errors}
      helpText={helpText}
      withPadding={false}
    >
      <AnnotationController
        story={annotationStory}
        frameIndex={annotationFrameIndex}
        setFrameIndex={setAnnotationFrameIndex}
      />
    </TitleInfo>
  );
}
