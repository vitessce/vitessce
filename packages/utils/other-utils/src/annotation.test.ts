import { describe, it, expect } from 'vitest';
import { getAnnotationFrameCoordinationValues } from './annotation.js';

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
