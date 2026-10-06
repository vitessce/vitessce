/**
 * Attribution: Originally written by @RPSeaman
 * Reference: https://github.com/vitessce/vitessce/pull/2528
 */
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  TitleInfo,
  useReady,
  useUrls,
  useCoordination,
  useLoaders,
  useViewMapping,
  useAnnotationStoryData,
  useViewConfigStore,
  useViewConfigStoreApi,
  useAnnotationEditingStore,
  useAnnotationEditingStoreApi,
  getAnnotationFrameUpdate,
  getViewCoordinationValuesForFrame,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
} from '@vitessce/constants-internal';
import { annotationShapeObj } from '@vitessce/schemas';
import { AnnotationController } from './AnnotationController.js';
import { isAnnotatableView } from './capture-utils.js';
import { addShape, createStory, drawingToShape } from './story-utils.js';

/**
 * A subscriber component for the annotation story controller.
 * This is the only view which modifies the annotation story:
 * each edit results in a new story object, which is set via setAnnotationStory.
 * @param {object} props
 * @param {string} props.uuid The unique identifier for this component, also used as its
 * view uid for looking up its coordination mapping via `useViewMapping`.
 * @param {string} props.theme The current theme name.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {boolean} props.areAnnotationsEditable Whether annotations can be edited,
 * passed down from the ancestor <Vitessce/> or <VitS/> component.
 * Editing also requires the annotationEditable coordination value to be true.
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
    areAnnotationsEditable,
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
    annotationOverlayVisible,
    annotationSemanticZoom,
    annotationEditable,
  }, {
    setAnnotationStory,
    setAnnotationFrameIndex,
    setAnnotationOverlayVisible,
    setAnnotationSemanticZoom,
    setAnnotationEditable,
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

  const canEdit = Boolean(areAnnotationsEditable);
  // Whether the story is currently being edited is stored in the coordination space
  // (rather than as local state), so that other views (e.g., for drawing shapes) can respond.
  const isEditing = canEdit && annotationEditable === true;

  // The controller reads the state of its sibling views from the full view config.
  const viewConfigStoreApi = useViewConfigStoreApi();
  const layout = useViewConfigStore(state => state.viewConfig?.layout);
  const applyAnnotationFrameCoordination = useViewConfigStore(
    state => state.applyAnnotationFrameCoordination,
  );
  const views = useMemo(
    () => (layout || [])
      .filter(isAnnotatableView)
      .map(view => ({ uid: view.uid, component: view.component })),
    [layout],
  );

  // Read the latest values at the time of capture (rather than subscribing to them),
  // since they change upon every zoom/pan interaction.
  const getViewCoordinationValues = useCallback(
    (viewUid, coordinationTypes) => getViewCoordinationValuesForFrame(
      viewConfigStoreApi.getState().viewConfig, viewUid, coordinationTypes,
    ),
    [viewConfigStoreApi],
  );

  // Commit shapes which the user has finished drawing (in a spatial or scatterplot view)
  // to the current frame of the story.
  const annotationEditingStoreApi = useAnnotationEditingStoreApi();
  const completedDrawing = useAnnotationEditingStore(state => state.completedDrawing);
  useEffect(() => {
    const {
      completedDrawing: drawing, clearCompletedDrawing, setSelectedShape,
    } = annotationEditingStoreApi.getState();
    // Read from the store (rather than the render value), so that the drawing
    // is only committed once, even if multiple controllers are present.
    if (!drawing) return;
    clearCompletedDrawing();
    if (!isEditing || !annotationStory || typeof annotationFrameIndex !== 'number') return;
    const shape = drawingToShape(drawing);
    if (!shape || !annotationShapeObj.safeParse(shape).success) return;
    setAnnotationStory(addShape(annotationStory, annotationFrameIndex, drawing.viewUid, shape));
    setSelectedShape({ viewUid: drawing.viewUid, shapeUid: shape.uid });
  // Only commit when a new drawing has been completed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedDrawing]);

  // Re-apply all values of the current frame to the views
  // (e.g., after the user has zoomed/panned away from the frame).
  const handleRecenter = useCallback(() => {
    const frame = annotationStory?.frames?.[annotationFrameIndex];
    (frame?.layout || []).forEach(({ uid: viewUid }) => {
      const update = getAnnotationFrameUpdate(
        annotationStory, undefined, annotationFrameIndex, viewUid,
      );
      if (update) {
        applyAnnotationFrameCoordination({ viewUid, ...update });
      }
    });
  }, [annotationStory, annotationFrameIndex, applyAnnotationFrameCoordination]);

  const handleCreateStory = useCallback(() => {
    setAnnotationStory(createStory());
    setAnnotationFrameIndex(null);
    setAnnotationEditable(true);
  }, [setAnnotationStory, setAnnotationFrameIndex, setAnnotationEditable]);

  // When the controller is removed, the story can no longer be navigated or edited,
  // so end the story before removing the view. Setting the frame index to null
  // clears the annotationShapes of each view (via useAnnotationFrameCoordination).
  const handleRemoveGridComponent = useCallback(() => {
    setAnnotationFrameIndex(null);
    setAnnotationOverlayVisible(false);
    setAnnotationEditable(false);
    annotationEditingStoreApi.getState().resetAnnotationEditing();
    removeGridComponent();
  }, [
    setAnnotationFrameIndex, setAnnotationOverlayVisible, setAnnotationEditable,
    annotationEditingStoreApi, removeGridComponent,
  ]);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      // In page mode, removeGridComponent is null (views cannot be removed).
      removeGridComponent={removeGridComponent ? handleRemoveGridComponent : null}
      isReady={isReady}
      urls={urls}
      errors={errors}
      helpText={helpText}
      withPadding={false}
    >
      <AnnotationController
        story={annotationStory}
        frameIndex={annotationFrameIndex}
        onFrameIndexChange={setAnnotationFrameIndex}
        onStoryChange={setAnnotationStory}
        canEdit={canEdit}
        isEditing={isEditing}
        onEditingChange={setAnnotationEditable}
        onCreateStory={handleCreateStory}
        isOverlayVisible={annotationOverlayVisible !== false}
        onOverlayVisibleChange={setAnnotationOverlayVisible}
        isSemanticZoomEnabled={annotationSemanticZoom !== false}
        onSemanticZoomChange={setAnnotationSemanticZoom}
        onRecenter={handleRecenter}
        views={views}
        getViewCoordinationValues={getViewCoordinationValues}
      />
    </TitleInfo>
  );
}
