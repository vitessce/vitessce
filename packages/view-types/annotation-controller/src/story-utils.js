// Pure functions for editing an annotation story.
// Each function returns a new story object (the input story is not modified),
// which the annotation controller sets via setAnnotationStory.
// Reference for the schema: packages/schemas/src/annotation-frames.ts
import { v4 as uuidv4 } from 'uuid';
import { CoordinationType } from '@vitessce/constants-internal';

const SHAPES = CoordinationType.ANNOTATION_SHAPES;

// Values of the descriptionType enum in the annotation story schema.
export const STORY_DESCRIPTION_TYPES = ['text', 'markdown'];

export const DEFAULT_SHAPE_STROKE_COLOR = [255, 255, 0];
export const DEFAULT_SHAPE_STROKE_WIDTH = 3;

/**
 * Create a new, empty annotation story.
 * @returns {object} The story.
 */
export function createStory() {
  return {
    uid: uuidv4(),
    title: 'Untitled story',
    frames: [],
  };
}

/**
 * Create a new, empty annotation frame.
 * @returns {object} The frame.
 */
export function createFrame() {
  return {
    uid: uuidv4(),
    title: 'New frame',
    layout: [],
  };
}

function omitUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

function replaceAt(arr, index, value) {
  return arr.map((item, i) => (i === index ? value : item));
}

/**
 * Update top-level story properties (title, description, descriptionType).
 * Properties with a value of undefined are removed.
 * @param {object} story The story.
 * @param {object} updates The properties to update.
 * @returns {object} The new story.
 */
export function updateStory(story, updates) {
  return omitUndefined({ ...story, ...updates });
}

/**
 * Insert a new frame into the story.
 * @param {object} story The story.
 * @param {number} index The index at which to insert the frame.
 * @returns {object} The new story.
 */
export function insertFrame(story, index) {
  const frames = [...story.frames];
  frames.splice(index, 0, createFrame());
  return { ...story, frames };
}

/**
 * Duplicate a frame, inserting the copy after the original.
 * The copy (and each of its shapes) is given a new uid.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame to duplicate.
 * @returns {object} The new story.
 */
export function duplicateFrame(story, frameIndex) {
  const source = story.frames[frameIndex];
  const copy = {
    ...source,
    uid: uuidv4(),
    title: source.title ? `${source.title} (copy)` : undefined,
    layout: (source.layout || []).map((view) => {
      const shapes = view.coordinationValues?.[SHAPES];
      if (!Array.isArray(shapes)) {
        return view;
      }
      return {
        ...view,
        coordinationValues: {
          ...view.coordinationValues,
          [SHAPES]: shapes.map(shape => ({ ...shape, uid: uuidv4() })),
        },
      };
    }),
  };
  const frames = [...story.frames];
  frames.splice(frameIndex + 1, 0, omitUndefined(copy));
  return { ...story, frames };
}

/**
 * Remove a frame from the story.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame to remove.
 * @returns {object} The new story.
 */
export function removeFrame(story, frameIndex) {
  return { ...story, frames: story.frames.filter((_, i) => i !== frameIndex) };
}

/**
 * Move a frame to a new position.
 * @param {object} story The story.
 * @param {number} fromIndex The current index of the frame.
 * @param {number} toIndex The new index of the frame.
 * @returns {object} The new story.
 */
export function moveFrame(story, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= story.frames.length) {
    return story;
  }
  const frames = [...story.frames];
  const [moved] = frames.splice(fromIndex, 1);
  frames.splice(toIndex, 0, moved);
  return { ...story, frames };
}

/**
 * Update frame properties (title, description, descriptionType).
 * Properties with a value of undefined are removed.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {object} updates The properties to update.
 * @returns {object} The new story.
 */
export function updateFrame(story, frameIndex, updates) {
  const frame = story.frames[frameIndex];
  return {
    ...story,
    frames: replaceAt(story.frames, frameIndex, omitUndefined({ ...frame, ...updates })),
  };
}

/**
 * Get the coordination values that a frame defines for a view.
 * @param {object} frame The frame.
 * @param {string} viewUid The view uid.
 * @returns {object} The coordination values (empty if none).
 */
export function getFrameViewCoordinationValues(frame, viewUid) {
  return frame?.layout?.find(view => view.uid === viewUid)?.coordinationValues || {};
}

/**
 * Get the annotation shapes that a frame defines for a view.
 * @param {object} frame The frame.
 * @param {string} viewUid The view uid.
 * @returns {object[]} The shapes (empty if none).
 */
export function getFrameViewShapes(frame, viewUid) {
  const shapes = getFrameViewCoordinationValues(frame, viewUid)[SHAPES];
  return Array.isArray(shapes) ? shapes : [];
}

/**
 * Count the annotation shapes that a frame defines across all views.
 * @param {object} frame The frame.
 * @returns {number} The number of shapes.
 */
export function countFrameShapes(frame) {
  return (frame.layout || []).reduce((sum, view) => {
    const shapes = view.coordinationValues?.[SHAPES];
    return sum + (Array.isArray(shapes) ? shapes.length : 0);
  }, 0);
}

/**
 * Update the coordination values that a frame defines for a view.
 * The frame.layout entry for the view is created if needed,
 * and removed if it no longer defines any coordination values.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {string} viewUid The view uid.
 * @param {function} updater Function which receives the current coordination values
 * and returns the new coordination values.
 * @returns {object} The new story.
 */
function updateFrameViewCoordinationValues(story, frameIndex, viewUid, updater) {
  const frame = story.frames[frameIndex];
  const layout = frame.layout || [];
  const prevValues = getFrameViewCoordinationValues(frame, viewUid);
  const nextValues = omitUndefined(updater(prevValues));
  const hasView = layout.some(view => view.uid === viewUid);
  let nextLayout;
  if (isEmpty(nextValues)) {
    nextLayout = layout.filter(view => view.uid !== viewUid);
  } else if (hasView) {
    nextLayout = layout.map(view => (
      view.uid === viewUid ? { ...view, coordinationValues: nextValues } : view
    ));
  } else {
    nextLayout = [...layout, { uid: viewUid, coordinationValues: nextValues }];
  }
  return {
    ...story,
    frames: replaceAt(story.frames, frameIndex, { ...frame, layout: nextLayout }),
  };
}

/**
 * Set the coordination values (e.g., captured from the current state of a view)
 * that a frame defines for a view. Previously-captured coordination values
 * are replaced, while the annotation shapes are kept.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {string} viewUid The view uid.
 * @param {object} values The coordination values to set.
 * @returns {object} The new story.
 */
export function setFrameViewCoordinationValues(story, frameIndex, viewUid, values) {
  return updateFrameViewCoordinationValues(
    story, frameIndex, viewUid, prevValues => ({ ...values, [SHAPES]: prevValues[SHAPES] }),
  );
}

function updateFrameViewShapes(story, frameIndex, viewUid, updater) {
  return updateFrameViewCoordinationValues(story, frameIndex, viewUid, (prevValues) => {
    const prevShapes = Array.isArray(prevValues[SHAPES]) ? prevValues[SHAPES] : [];
    const nextShapes = updater(prevShapes);
    return {
      ...prevValues,
      [SHAPES]: nextShapes.length > 0 ? nextShapes : undefined,
    };
  });
}

/**
 * Add a shape to a frame, for a view.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {string} viewUid The view uid.
 * @param {object} shape The shape.
 * @returns {object} The new story.
 */
export function addShape(story, frameIndex, viewUid, shape) {
  return updateFrameViewShapes(story, frameIndex, viewUid, shapes => [...shapes, shape]);
}

/**
 * Update the properties of a shape.
 * Properties with a value of undefined are removed.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {string} viewUid The view uid.
 * @param {string} shapeUid The shape uid.
 * @param {object} updates The properties to update.
 * @returns {object} The new story.
 */
export function updateShape(story, frameIndex, viewUid, shapeUid, updates) {
  return updateFrameViewShapes(story, frameIndex, viewUid, shapes => shapes.map(shape => (
    shape.uid === shapeUid ? omitUndefined({ ...shape, ...updates }) : shape
  )));
}

/**
 * Remove a shape.
 * @param {object} story The story.
 * @param {number} frameIndex The index of the frame.
 * @param {string} viewUid The view uid.
 * @param {string} shapeUid The shape uid.
 * @returns {object} The new story.
 */
export function removeShape(story, frameIndex, viewUid, shapeUid) {
  return updateFrameViewShapes(
    story, frameIndex, viewUid, shapes => shapes.filter(shape => shape.uid !== shapeUid),
  );
}

/**
 * Copy a shape (with a new uid) to another frame, for the same view.
 * @param {object} story The story.
 * @param {number} fromFrameIndex The index of the frame containing the shape.
 * @param {string} viewUid The view uid.
 * @param {string} shapeUid The shape uid.
 * @param {number} toFrameIndex The index of the frame to copy the shape to.
 * @returns {object} The new story.
 */
export function copyShapeToFrame(story, fromFrameIndex, viewUid, shapeUid, toFrameIndex) {
  const shape = getFrameViewShapes(story.frames[fromFrameIndex], viewUid)
    .find(s => s.uid === shapeUid);
  if (!shape) {
    return story;
  }
  return addShape(story, toFrameIndex, viewUid, { ...shape, uid: uuidv4() });
}

/**
 * Convert a drawing (the vertices that the user clicked in a view)
 * into an annotation shape.
 * @param {object} drawing The drawing, as { type, vertices }.
 * @returns {object|null} The shape (with a new uid and default style),
 * or null if the drawing does not have enough vertices.
 */
export function drawingToShape(drawing) {
  const { type, vertices = [] } = drawing || {};
  const style = {
    uid: uuidv4(),
    strokeColor: DEFAULT_SHAPE_STROKE_COLOR,
    strokeWidth: DEFAULT_SHAPE_STROKE_WIDTH,
  };
  if (['rectangle', 'line', 'ellipse'].includes(type) && vertices.length >= 2) {
    const [[ax, ay], [bx, by]] = vertices;
    if (type === 'rectangle') {
      // Upper-left origin.
      return {
        ...style,
        type,
        x: Math.min(ax, bx),
        y: Math.min(ay, by),
        width: Math.abs(bx - ax),
        height: Math.abs(by - ay),
      };
    }
    if (type === 'line') {
      return {
        ...style, type, x1: ax, y1: ay, x2: bx, y2: by,
      };
    }
    // The first vertex is the centre, the second defines the radii.
    return {
      ...style,
      type,
      x1: ax,
      y1: ay,
      radiusX: Math.abs(bx - ax),
      radiusY: Math.abs(by - ay),
    };
  }
  if (type === 'polygon' && vertices.length >= 3) {
    return { ...style, type, points: vertices };
  }
  if (type === 'polyline' && vertices.length >= 2) {
    return { ...style, type, points: vertices };
  }
  return null;
}

/**
 * Get the index of the frame which should be active after a frame is removed.
 * @param {number|null} frameIndex The active frame index.
 * @param {number} removedIndex The index of the removed frame.
 * @param {number} numFramesAfter The number of frames after the removal.
 * @returns {number|null} The new active frame index.
 */
export function getFrameIndexAfterRemove(frameIndex, removedIndex, numFramesAfter) {
  if (typeof frameIndex !== 'number' || numFramesAfter === 0) {
    return numFramesAfter === 0 ? null : frameIndex;
  }
  if (frameIndex === removedIndex) {
    return Math.min(removedIndex, numFramesAfter - 1);
  }
  return frameIndex > removedIndex ? frameIndex - 1 : frameIndex;
}

/**
 * Get the index of the frame which should be active after a frame is moved,
 * so that the same frame remains active.
 * @param {number|null} frameIndex The active frame index.
 * @param {number} fromIndex The previous index of the moved frame.
 * @param {number} toIndex The new index of the moved frame.
 * @returns {number|null} The new active frame index.
 */
export function getFrameIndexAfterMove(frameIndex, fromIndex, toIndex) {
  if (typeof frameIndex !== 'number') {
    return frameIndex;
  }
  if (frameIndex === fromIndex) {
    return toIndex;
  }
  if (fromIndex < frameIndex && toIndex >= frameIndex) {
    return frameIndex - 1;
  }
  if (fromIndex > frameIndex && toIndex <= frameIndex) {
    return frameIndex + 1;
  }
  return frameIndex;
}
