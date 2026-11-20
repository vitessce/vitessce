/* eslint-disable react-refresh/only-export-components */
import React, {
  useCallback,
  useRef,
  createContext,
  useContext,
} from 'react';
import { create, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { subscribeWithSelector } from 'zustand/middleware';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  getScopes,
  getScopesBy,
  hasCoordinationValue,
  COORDINATION_LEVEL_SENTINEL,
} from './hooks.js';

// The annotation editing store holds ephemeral (non-config) state related to
// authoring annotation shapes: the active drawing tool, the shape currently
// being drawn (and in which view), and the currently-selected shape.
// Views may write in-progress drawn shapes here, but only the annotation controller
// commits completed shapes to the annotation story.

// Shape types which are completed after two clicks.
const TWO_POINT_SHAPE_TYPES = ['rectangle', 'line', 'ellipse'];

/**
 * Compute the next drawing state after the user has clicked
 * on a view while a drawing tool is active.
 * Two-point shapes (rectangle, line, ellipse) are completed on the second click.
 * Multi-point shapes (polygon, polyline) are completed via finishDrawing.
 * Clicking in a different view than the in-progress shape restarts the drawing.
 * @param {object} state The current store state.
 * @param {object} params
 * @param {string} params.viewUid The uid of the view that was clicked.
 * @param {number[]} params.coordinate The [x, y] clicked position, in view coordinates.
 * @returns {object} The partial state update.
 */
export function getNextDrawingState(state, { viewUid, coordinate }) {
  const { activeTool, drawing } = state;
  if (!activeTool || !Array.isArray(coordinate)) {
    return {};
  }
  const vertex = [coordinate[0], coordinate[1]];
  const isContinuing = drawing?.viewUid === viewUid && drawing?.type === activeTool;
  const nextDrawing = {
    viewUid,
    type: activeTool,
    vertices: isContinuing ? [...drawing.vertices, vertex] : [vertex],
  };
  if (TWO_POINT_SHAPE_TYPES.includes(activeTool) && nextDrawing.vertices.length === 2) {
    return { drawing: null, completedDrawing: nextDrawing };
  }
  return { drawing: nextDrawing };
}

export const createAnnotationEditingStore = () => create(subscribeWithSelector(set => ({
  // The shape type of the active drawing tool, or null.
  activeTool: null,
  // The in-progress shape, as { viewUid, type, vertices }, or null.
  drawing: null,
  // A shape which the user has finished drawing, as { viewUid, type, vertices },
  // which has not yet been committed to the story by the annotation controller.
  completedDrawing: null,
  // The selected shape, as { viewUid, shapeUid }, or null.
  selectedShape: null,
  setActiveTool: activeTool => set({ activeTool, drawing: null }),
  addDrawingVertex: params => set(state => getNextDrawingState(state, params)),
  finishDrawing: () => set(state => ({ drawing: null, completedDrawing: state.drawing })),
  cancelDrawing: () => set({ drawing: null }),
  clearCompletedDrawing: () => set({ completedDrawing: null }),
  setSelectedShape: selectedShape => set({ selectedShape }),
  resetAnnotationEditing: () => set({
    activeTool: null, drawing: null, completedDrawing: null, selectedShape: null,
  }),
})));

const AnnotationEditingStoreContext = createContext(null);

export function AnnotationEditingProvider(props) {
  const {
    createStore,
    children,
  } = props;

  // Reference: https://github.com/pmndrs/zustand/discussions/1180
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return (
    <AnnotationEditingStoreContext.Provider value={storeRef.current}>
      {children}
    </AnnotationEditingStoreContext.Provider>
  );
}

export function useAnnotationEditingStoreApi() {
  const store = useContext(AnnotationEditingStoreContext);
  if (!store) {
    throw new Error('Missing AnnotationEditingProvider');
  }
  return store;
}

export function useAnnotationEditingStore(selector) {
  const store = useAnnotationEditingStoreApi();
  return useStore(store, selector);
}

export function useAnnotationEditingStoreShallow(selector) {
  return useAnnotationEditingStore(useShallow(selector));
}

/**
 * Get the annotation editing props for a view which renders annotation shapes
 * (i.e., an AnnotationLayer) and supports drawing new shapes.
 * @param {string} viewUid The uid of the view.
 * @param {boolean} isEditable Whether shapes can currently be drawn in this view,
 * i.e., annotation editing is enabled and an annotation frame is active.
 * @returns {object} The props to pass to the view's DeckGL component.
 */
export function useAnnotationEditingForView(viewUid, isEditable) {
  const {
    activeTool, drawing, selectedShape, addDrawingVertex,
  } = useAnnotationEditingStoreShallow(state => ({
    activeTool: state.activeTool,
    drawing: state.drawing,
    selectedShape: state.selectedShape,
    addDrawingVertex: state.addDrawingVertex,
  }));
  const onAnnotationVertexAdd = useCallback(
    coordinate => addDrawingVertex({ viewUid, coordinate }),
    [addDrawingVertex, viewUid],
  );
  const annotationSelectedShapeUid = selectedShape?.viewUid === viewUid
    ? selectedShape.shapeUid
    : null;
  if (!isEditable) {
    return {
      annotationActiveTool: null,
      annotationInProgressShape: null,
      annotationSelectedShapeUid,
      onAnnotationVertexAdd: undefined,
    };
  }
  return {
    annotationActiveTool: activeTool,
    annotationInProgressShape: drawing?.viewUid === viewUid ? drawing : null,
    annotationSelectedShapeUid,
    onAnnotationVertexAdd,
  };
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Serialize a (multi-level) coordination level into its JSON
 * `{ "$CL": [...] }` representation, which is the inverse of the
 * expansion performed when a frame is applied.
 * @param {string} levelType The coordination type of the level (e.g., imageLayer).
 * @param {string[]} levelScopes The scopes of the level.
 * @param {object} coordinationSpace The coordination space.
 * @param {object} scopesBy The view's coordinationScopesBy, after meta-coordination.
 * @returns {object} The `{ "$CL": [...] }` value.
 */
function getMultiLevelValue(levelType, levelScopes, coordinationSpace, scopesBy) {
  const secondaryTypes = Object.entries(scopesBy[levelType] || {});
  return {
    [COORDINATION_LEVEL_SENTINEL]: levelScopes.map(levelScope => Object.fromEntries(
      secondaryTypes
        .filter(([, byScope]) => byScope?.[levelScope] !== undefined)
        .map(([secondaryType, byScope]) => {
          const secondaryScope = byScope[levelScope];
          if (Array.isArray(secondaryScope)) {
            return [secondaryType, getMultiLevelValue(
              secondaryType, secondaryScope, coordinationSpace, scopesBy,
            )];
          }
          return [secondaryType, coordinationSpace[secondaryType]?.[secondaryScope]];
        }),
    )),
  };
}

/**
 * Get the current coordination values of a view, for the given coordination types,
 * in the form that an annotation frame stores them
 * (i.e., `frame.layout[].coordinationValues`).
 * Single-level values are read from the view (if defined directly)
 * or from the scope that the view is mapped to (after meta-coordination).
 * Multi-level values are serialized as `{ "$CL": [...] }`, including all
 * of the values in the level tree, since applying a multi-level value
 * replaces the view's mapping for that coordination type.
 * @param {object} viewConfig The current view config.
 * @param {string} viewUid The view of interest.
 * @param {string[]} coordinationTypes The coordination types of interest.
 * @returns {object} Mapping from coordination type to value,
 * omitting types for which the view has no value.
 */
export function getViewCoordinationValuesForFrame(viewConfig, viewUid, coordinationTypes) {
  const { coordinationSpace = {}, layout = [] } = viewConfig || {};
  const viewObj = layout.find(l => l.uid === viewUid);
  if (!viewObj) {
    return {};
  }
  const viewScopes = viewObj.coordinationScopes || {};
  const scopes = getScopes(
    viewScopes, coordinationSpace[CoordinationType.META_COORDINATION_SCOPES],
  );
  const scopesBy = getScopesBy(
    viewScopes,
    viewObj.coordinationScopesBy || {},
    coordinationSpace[CoordinationType.META_COORDINATION_SCOPES_BY],
  );
  return Object.fromEntries(
    coordinationTypes
      .map((coordinationType) => {
        if (hasCoordinationValue(viewObj.coordinationValues, coordinationType)) {
          return [coordinationType, viewObj.coordinationValues[coordinationType]];
        }
        const scope = scopes[coordinationType];
        if (Array.isArray(scope)) {
          // Only arrays of scopes which define a level tree are multi-level values.
          return scopesBy[coordinationType]
            ? [coordinationType, getMultiLevelValue(
              coordinationType, toArray(scope), coordinationSpace, scopesBy,
            )]
            : [coordinationType, undefined];
        }
        return [coordinationType, coordinationSpace[coordinationType]?.[scope]];
      })
      .filter(([, value]) => value !== undefined),
  );
}
