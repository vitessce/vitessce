import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';
import { applyAnnotationFrameToViewConfig, getAnnotationFrameUpdate } from './hooks.js';

function makeConfig() {
  return {
    coordinationSpace: {
      spatialZoom: { A: -5 },
      spatialTargetX: { A: 100 },
      annotationShapes: { A: null, B: null },
      imageLayer: { OLD_L: '__dummy__' },
      fileUid: { OLD_L: 'img' },
      metaCoordinationScopes: {
        META: { imageLayer: ['OLD_L'] },
      },
      metaCoordinationScopesBy: {
        META: {
          imageLayer: { fileUid: { OLD_L: 'OLD_L' } },
        },
      },
    },
    layout: [
      {
        uid: 'spatial',
        component: 'spatialBeta',
        coordinationScopes: {
          spatialZoom: 'A',
          spatialTargetX: 'A',
          annotationShapes: 'A',
          metaCoordinationScopes: ['META'],
          metaCoordinationScopesBy: ['META'],
        },
        coordinationValues: {
          spatialTargetY: 7,
        },
      },
      {
        uid: 'layer-controller',
        component: 'layerControllerBeta',
        coordinationScopes: {
          spatialZoom: 'A',
          metaCoordinationScopes: ['META'],
          metaCoordinationScopesBy: ['META'],
        },
      },
    ],
  };
}

describe('applyAnnotationFrameToViewConfig', () => {
  it('writes single-level values into the scopes of the view', () => {
    const shapes = [{ uid: 's1', type: 'rectangle', x: 0, y: 0, width: 1, height: 1 }];
    const result = applyAnnotationFrameToViewConfig(makeConfig(), 'spatial', {
      spatialZoom: -2,
      annotationShapes: shapes,
    }, 'prefix_');
    expect(result.coordinationSpace.spatialZoom).toEqual({ A: -2 });
    expect(result.coordinationSpace.spatialTargetX).toEqual({ A: 100 });
    expect(result.coordinationSpace.annotationShapes).toEqual({ A: shapes, B: null });
  });

  it('writes values in-place when the view defines them directly', () => {
    const result = applyAnnotationFrameToViewConfig(makeConfig(), 'spatial', {
      spatialTargetY: 50,
    }, 'prefix_');
    expect(result.layout[0].coordinationValues).toEqual({ spatialTargetY: 50 });
    expect(result.coordinationSpace.spatialTargetY).toBeUndefined();
  });

  it('writes values on the view when it is not mapped to a scope', () => {
    const result = applyAnnotationFrameToViewConfig(makeConfig(), 'spatial', {
      spatialRotationX: 30,
    }, 'prefix_');
    expect(result.layout[0].coordinationValues.spatialRotationX).toEqual(30);
  });

  it('expands multi-level values into new scopes and re-points the meta-coordination scopes', () => {
    const result = applyAnnotationFrameToViewConfig(makeConfig(), 'spatial', {
      imageLayer: {
        $CL: [{
          fileUid: 'img',
          spatialLayerOpacity: 0.5,
          imageChannel: {
            $CL: [
              { spatialTargetC: 0, spatialChannelColor: [255, 0, 0] },
              { spatialTargetC: 2 },
            ],
          },
        }],
      },
    }, 'prefix_');
    const { coordinationSpace } = result;
    // The meta scope shared with the layer controller now points to the new layer scopes.
    const newLayerScopes = coordinationSpace.metaCoordinationScopes.META.imageLayer;
    expect(newLayerScopes).toEqual(['prefix_0']);
    expect(coordinationSpace.spatialLayerOpacity.prefix_0).toEqual(0.5);
    const layerScopesBy = coordinationSpace.metaCoordinationScopesBy.META.imageLayer;
    expect(layerScopesBy.imageChannel.prefix_0).toEqual(['prefix_0', 'prefix_1']);
    const channelScopesBy = coordinationSpace.metaCoordinationScopesBy.META.imageChannel;
    expect(coordinationSpace.spatialTargetC[channelScopesBy.spatialTargetC.prefix_1]).toEqual(2);
    expect(coordinationSpace.spatialChannelColor[channelScopesBy.spatialChannelColor.prefix_0])
      .toEqual([255, 0, 0]);
    // The previous scopes remain in the coordination space, and the view mapping is unchanged.
    expect(coordinationSpace.fileUid.OLD_L).toEqual('img');
    expect(result.layout[0].coordinationScopes.metaCoordinationScopes).toEqual(['META']);
  });

  it('does not modify the input view config or frame values', () => {
    const config = makeConfig();
    const frameCoordinationValues = {
      spatialZoom: -2,
      imageLayer: { $CL: [{ fileUid: 'img' }] },
    };
    const configBefore = cloneDeep(config);
    const frameBefore = cloneDeep(frameCoordinationValues);
    applyAnnotationFrameToViewConfig(config, 'spatial', frameCoordinationValues, 'prefix_');
    expect(config).toEqual(configBefore);
    expect(frameCoordinationValues).toEqual(frameBefore);
  });

  it('returns the same view config when the view is not in the layout', () => {
    const config = makeConfig();
    expect(applyAnnotationFrameToViewConfig(config, 'other', { spatialZoom: 1 }, 'prefix_'))
      .toBe(config);
  });
});

describe('getAnnotationFrameUpdate', () => {
  const story = {
    uid: 'story',
    frames: [
      { uid: 'frame-0', layout: [{ uid: 'spatial', coordinationValues: { spatialZoom: -2 } }] },
      { uid: 'frame-1' },
    ],
  };

  it('returns the frame values for the view when a frame is active', () => {
    expect(getAnnotationFrameUpdate(story, undefined, 0, 'spatial')).toEqual({
      frameCoordinationValues: { annotationShapes: null, spatialZoom: -2 },
      scopePrefix: 'annotation_story_frame-0_spatial_',
    });
  });

  it('uses the annotationShapes of the frame when defined', () => {
    const shapes = [{ uid: 's1', type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }];
    const storyWithShapes = {
      uid: 'story',
      frames: [{ uid: 'frame-0', layout: [{ uid: 'spatial', coordinationValues: { annotationShapes: shapes } }] }],
    };
    expect(getAnnotationFrameUpdate(storyWithShapes, undefined, 0, 'spatial').frameCoordinationValues)
      .toEqual({ annotationShapes: shapes });
  });

  it('clears annotationShapes when the active frame does not define them for the view', () => {
    expect(getAnnotationFrameUpdate(story, 0, 1, 'spatial').frameCoordinationValues)
      .toEqual({ annotationShapes: null });
    expect(getAnnotationFrameUpdate(story, undefined, 0, 'scatterplot').frameCoordinationValues)
      .toEqual({ annotationShapes: null });
  });

  it('does nothing when the story is not (yet) loaded', () => {
    expect(getAnnotationFrameUpdate(null, undefined, 0, 'spatial')).toBeNull();
  });

  it('clears annotationShapes when the frame index becomes null', () => {
    expect(getAnnotationFrameUpdate(story, 1, null, 'spatial')).toEqual({
      frameCoordinationValues: { annotationShapes: null },
      scopePrefix: '',
    });
  });

  it('only merges annotationShapes when the same frame has been edited in-place', () => {
    const shapes = [{ uid: 's1', type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }];
    const editedStory = {
      uid: 'story',
      frames: [{
        uid: 'frame-0',
        layout: [{ uid: 'spatial', coordinationValues: { spatialZoom: -2, annotationShapes: shapes } }],
      }],
    };
    const prevAppliedFrame = { storyUid: 'story', frameUid: 'frame-0' };
    expect(getAnnotationFrameUpdate(editedStory, 0, 0, 'spatial', prevAppliedFrame)).toEqual({
      frameCoordinationValues: { annotationShapes: shapes },
      scopePrefix: '',
    });
    expect(getAnnotationFrameUpdate(story, 0, 0, 'spatial', prevAppliedFrame).frameCoordinationValues)
      .toEqual({ annotationShapes: null });
  });

  it('fully merges the frame when a different frame (or story) was previously applied', () => {
    // E.g., the frames were re-ordered, so the frame at the same index has a different uid.
    expect(getAnnotationFrameUpdate(story, 0, 0, 'spatial', { storyUid: 'story', frameUid: 'frame-1' }).frameCoordinationValues)
      .toEqual({ annotationShapes: null, spatialZoom: -2 });
    expect(getAnnotationFrameUpdate(story, 0, 0, 'spatial', { storyUid: 'other', frameUid: 'frame-0' }).frameCoordinationValues)
      .toEqual({ annotationShapes: null, spatialZoom: -2 });
  });

  it('does nothing when the frame index is (and was) null', () => {
    expect(getAnnotationFrameUpdate(story, undefined, null, 'spatial')).toBeNull();
    expect(getAnnotationFrameUpdate(story, null, null, 'spatial')).toBeNull();
  });

  it('clears the shapes in the scope of the view when applied', () => {
    const config = makeConfig();
    config.coordinationSpace.annotationShapes.A = [{ uid: 's1', type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }];
    const { frameCoordinationValues, scopePrefix } = getAnnotationFrameUpdate(story, 0, null, 'spatial');
    const result = applyAnnotationFrameToViewConfig(config, 'spatial', frameCoordinationValues, scopePrefix);
    expect(result.coordinationSpace.annotationShapes).toEqual({ A: null, B: null });
    expect(result.coordinationSpace.spatialZoom).toEqual({ A: -5 });
  });
});
