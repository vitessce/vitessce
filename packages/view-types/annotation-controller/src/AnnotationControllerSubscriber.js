/**
 * Attribution: Originally written by @RPSeaman
 * Reference: https://github.com/vitessce/vitessce/pull/2528
 */
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
    // TODO: when true, allow the user to edit the story.
    // eslint-disable-next-line no-unused-vars
    isEditable = false,
    // TODO: when true, allow the user to download the story JSON.
    // eslint-disable-next-line no-unused-vars
    isExportable = true,
  } = props;

  const loaders = useLoaders();
  const [
    // eslint-disable-next-line no-unused-vars
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
