import { describe, it, expect } from 'vitest';
import {
  getAnnotationFrameCoordinationValues,
  isAnnotationFrameViewStateChange,
} from './annotation.js';

const story = {
  uid: 'story',
  frames: [
    {
      uid: 'frame-0',
      layout: [
        { uid: 'spatial', coordinationValues: { spatialZoom: -2 } },
      ],
    },
    { uid: 'frame-1' },
  ],
};

describe('getAnnotationFrameCoordinationValues', () => {
  it('returns the coordination values for the view in the current frame', () => {
    expect(getAnnotationFrameCoordinationValues(story, 0, 'spatial'))
      .toEqual({ spatialZoom: -2 });
  });

  it('returns undefined when the frame does not include the view', () => {
    expect(getAnnotationFrameCoordinationValues(story, 0, 'scatterplot')).toBeUndefined();
    expect(getAnnotationFrameCoordinationValues(story, 1, 'spatial')).toBeUndefined();
  });

  it('returns undefined when no frame is active or no story is loaded', () => {
    expect(getAnnotationFrameCoordinationValues(story, null, 'spatial')).toBeUndefined();
    expect(getAnnotationFrameCoordinationValues(null, 0, 'spatial')).toBeUndefined();
  });
});

describe('isAnnotationFrameViewStateChange', () => {
  const prev = { zoom: 0, targetX: 10, targetY: 20 };

  it('returns true when the changed values match the frame values', () => {
    expect(isAnnotationFrameViewStateChange(
      prev,
      { zoom: -2, targetX: 5, targetY: 20 },
      { zoom: -2, targetX: 5, targetY: undefined },
    )).toBe(true);
  });

  it('returns false when a changed value is not defined by the frame', () => {
    // E.g., the user panned while a frame which only defines zoom is active.
    expect(isAnnotationFrameViewStateChange(
      prev,
      { zoom: 0, targetX: 11, targetY: 20 },
      { zoom: 0, targetX: undefined, targetY: undefined },
    )).toBe(false);
  });

  it('returns false when a changed value does not match the frame value', () => {
    expect(isAnnotationFrameViewStateChange(
      prev,
      { zoom: -1, targetX: 10, targetY: 20 },
      { zoom: -2, targetX: undefined, targetY: undefined },
    )).toBe(false);
  });

  it('returns false when nothing changed or no frame is active', () => {
    expect(isAnnotationFrameViewStateChange(prev, { ...prev }, { zoom: 0 })).toBe(false);
    expect(isAnnotationFrameViewStateChange(prev, { ...prev, zoom: -2 }, null)).toBe(false);
  });

  it('returns false when the previous value was not initialized', () => {
    expect(isAnnotationFrameViewStateChange(
      { zoom: null, targetX: null, targetY: null },
      { zoom: -2, targetX: 5, targetY: 6 },
      { zoom: -2, targetX: 5, targetY: 6 },
    )).toBe(false);
  });
});
