import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';
import { annotationStoryObj, annotationShapeObj } from '@vitessce/schemas';
import {
  createStory,
  updateStory,
  insertFrame,
  duplicateFrame,
  removeFrame,
  moveFrame,
  updateFrame,
  getFrameViewShapes,
  setFrameViewCoordinationValues,
  addShape,
  updateShape,
  removeShape,
  copyShapeToFrame,
  drawingToShape,
  getFrameIndexAfterRemove,
  getFrameIndexAfterMove,
} from './story-utils.js';

const line = { uid: 's1', type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 };

function makeStory() {
  return {
    uid: 'story',
    title: 'Story',
    frames: [
      {
        uid: 'f0',
        title: 'Frame 0',
        layout: [
          { uid: 'spatial', coordinationValues: { spatialZoom: -2, annotationShapes: [line] } },
        ],
      },
      { uid: 'f1', title: 'Frame 1' },
      { uid: 'f2', title: 'Frame 2', layout: [] },
    ],
  };
}

describe('story-utils', () => {
  it('creates stories and frames which conform to the schema', () => {
    const story = insertFrame(createStory(), 0);
    expect(annotationStoryObj.safeParse(story).success).toBe(true);
    expect(story.frames).toHaveLength(1);
  });

  it('does not modify the input story', () => {
    const story = makeStory();
    const original = cloneDeep(story);
    updateStory(story, { title: 'New' });
    duplicateFrame(story, 0);
    moveFrame(story, 0, 2);
    removeFrame(story, 0);
    updateFrame(story, 0, { title: 'New' });
    addShape(story, 0, 'spatial', { ...line, uid: 's2' });
    updateShape(story, 0, 'spatial', 's1', { text: 'Hello' });
    removeShape(story, 0, 'spatial', 's1');
    setFrameViewCoordinationValues(story, 1, 'spatial', { spatialZoom: 1 });
    expect(story).toEqual(original);
  });

  it('removes properties which are updated to undefined', () => {
    const story = updateStory(makeStory(), { title: undefined, description: 'Hi' });
    expect(story).not.toHaveProperty('title');
    expect(story.description).toBe('Hi');
    const edited = updateShape(makeStory(), 0, 'spatial', 's1', { text: undefined, strokeWidth: 2 });
    expect(getFrameViewShapes(edited.frames[0], 'spatial')[0]).toEqual({ ...line, strokeWidth: 2 });
  });

  it('duplicates frames with new frame and shape uids', () => {
    const story = duplicateFrame(makeStory(), 0);
    expect(story.frames.map(f => f.title)).toEqual(['Frame 0', 'Frame 0 (copy)', 'Frame 1', 'Frame 2']);
    expect(story.frames[1].uid).not.toBe('f0');
    const [copiedShape] = getFrameViewShapes(story.frames[1], 'spatial');
    expect(copiedShape.uid).not.toBe('s1');
    expect(story.frames[1].layout[0].coordinationValues.spatialZoom).toBe(-2);
  });

  it('moves and removes frames', () => {
    expect(moveFrame(makeStory(), 0, 2).frames.map(f => f.uid)).toEqual(['f1', 'f2', 'f0']);
    expect(moveFrame(makeStory(), 0, 3).frames.map(f => f.uid)).toEqual(['f0', 'f1', 'f2']);
    expect(removeFrame(makeStory(), 1).frames.map(f => f.uid)).toEqual(['f0', 'f2']);
  });

  it('adds a layout entry for the view when needed, and removes it when empty', () => {
    const added = addShape(makeStory(), 1, 'spatial', line);
    expect(added.frames[1].layout).toEqual([{ uid: 'spatial', coordinationValues: { annotationShapes: [line] } }]);
    const removed = removeShape(added, 1, 'spatial', 's1');
    expect(removed.frames[1].layout).toEqual([]);
  });

  it('sets captured coordination values, replacing previous values and keeping the shapes', () => {
    const captured = setFrameViewCoordinationValues(makeStory(), 0, 'spatial', { spatialZoom: 3, spatialTargetX: 10 });
    expect(captured.frames[0].layout[0].coordinationValues)
      .toEqual({ spatialZoom: 3, spatialTargetX: 10, annotationShapes: [line] });
    const recaptured = setFrameViewCoordinationValues(captured, 0, 'spatial', { spatialTargetX: 20 });
    expect(recaptured.frames[0].layout[0].coordinationValues)
      .toEqual({ spatialTargetX: 20, annotationShapes: [line] });
    const cleared = setFrameViewCoordinationValues(makeStory(), 1, 'spatial', {});
    expect(cleared.frames[1].layout).toEqual([]);
  });

  it('copies shapes to other frames with a new uid', () => {
    const story = copyShapeToFrame(makeStory(), 0, 'spatial', 's1', 2);
    const [copied] = getFrameViewShapes(story.frames[2], 'spatial');
    expect(copied).toEqual({ ...line, uid: copied.uid });
    expect(copied.uid).not.toBe('s1');
    expect(copyShapeToFrame(makeStory(), 0, 'spatial', 'missing', 2)).toEqual(makeStory());
  });
});

describe('drawingToShape', () => {
  it('converts two-point drawings', () => {
    const rect = drawingToShape({ type: 'rectangle', vertices: [[10, 20], [4, 30]] });
    expect(rect).toMatchObject({ type: 'rectangle', x: 4, y: 20, width: 6, height: 10 });
    expect(drawingToShape({ type: 'line', vertices: [[0, 1], [2, 3]] }))
      .toMatchObject({ type: 'line', x1: 0, y1: 1, x2: 2, y2: 3 });
    expect(drawingToShape({ type: 'ellipse', vertices: [[5, 5], [8, 1]] }))
      .toMatchObject({ type: 'ellipse', x1: 5, y1: 5, radiusX: 3, radiusY: 4 });
  });

  it('converts multi-point drawings', () => {
    expect(drawingToShape({ type: 'polygon', vertices: [[0, 0], [1, 0], [1, 1]] }))
      .toMatchObject({ type: 'polygon', points: [[0, 0], [1, 0], [1, 1]] });
    expect(drawingToShape({ type: 'polyline', vertices: [[0, 0], [1, 0]] }))
      .toMatchObject({ type: 'polyline', points: [[0, 0], [1, 0]] });
  });

  it('returns null when there are not enough vertices', () => {
    expect(drawingToShape({ type: 'polygon', vertices: [[0, 0], [1, 0]] })).toBeNull();
    expect(drawingToShape({ type: 'polyline', vertices: [[0, 0]] })).toBeNull();
    expect(drawingToShape(null)).toBeNull();
  });

  it('creates shapes which conform to the schema', () => {
    [
      { type: 'rectangle', vertices: [[0, 0], [1, 1]] },
      { type: 'line', vertices: [[0, 0], [1, 1]] },
      { type: 'ellipse', vertices: [[0, 0], [1, 1]] },
      { type: 'polygon', vertices: [[0, 0], [1, 0], [1, 1]] },
      { type: 'polyline', vertices: [[0, 0], [1, 1]] },
    ].forEach((drawing) => {
      expect(annotationShapeObj.safeParse(drawingToShape(drawing)).success).toBe(true);
    });
  });
});

describe('frame index helpers', () => {
  it('keeps the same frame active after removing a frame', () => {
    expect(getFrameIndexAfterRemove(2, 0, 2)).toBe(1);
    expect(getFrameIndexAfterRemove(0, 2, 2)).toBe(0);
    expect(getFrameIndexAfterRemove(2, 2, 2)).toBe(1);
    expect(getFrameIndexAfterRemove(0, 0, 0)).toBeNull();
    expect(getFrameIndexAfterRemove(null, 0, 2)).toBeNull();
  });

  it('keeps the same frame active after moving a frame', () => {
    expect(getFrameIndexAfterMove(0, 0, 2)).toBe(2);
    expect(getFrameIndexAfterMove(1, 0, 2)).toBe(0);
    expect(getFrameIndexAfterMove(1, 2, 0)).toBe(2);
    expect(getFrameIndexAfterMove(0, 1, 2)).toBe(0);
    expect(getFrameIndexAfterMove(null, 1, 2)).toBeNull();
  });
});
