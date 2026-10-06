import { describe, it, expect } from 'vitest';
import {
  getNextDrawingState,
  getViewCoordinationValuesForFrame,
  createAnnotationEditingStore,
} from './annotation-editing.js';
import { applyAnnotationFrameToViewConfig } from './hooks.js';

describe('getNextDrawingState', () => {
  it('does nothing when no tool is active', () => {
    expect(getNextDrawingState({ activeTool: null, drawing: null }, { viewUid: 'v', coordinate: [1, 2] }))
      .toEqual({});
  });

  it('completes two-point shapes on the second click', () => {
    const first = getNextDrawingState(
      { activeTool: 'rectangle', drawing: null },
      { viewUid: 'v', coordinate: [1, 2, 0] },
    );
    expect(first).toEqual({ drawing: { viewUid: 'v', type: 'rectangle', vertices: [[1, 2]] } });
    const second = getNextDrawingState(
      { activeTool: 'rectangle', ...first },
      { viewUid: 'v', coordinate: [3, 4] },
    );
    expect(second).toEqual({
      drawing: null,
      completedDrawing: { viewUid: 'v', type: 'rectangle', vertices: [[1, 2], [3, 4]] },
    });
  });

  it('keeps adding vertices to multi-point shapes', () => {
    let state = { activeTool: 'polygon', drawing: null };
    [[0, 0], [1, 0], [1, 1]].forEach((coordinate) => {
      state = { ...state, ...getNextDrawingState(state, { viewUid: 'v', coordinate }) };
    });
    expect(state.drawing.vertices).toEqual([[0, 0], [1, 0], [1, 1]]);
    expect(state.completedDrawing).toBeUndefined();
  });

  it('restarts the drawing when a different view is clicked', () => {
    const state = { activeTool: 'polyline', drawing: { viewUid: 'a', type: 'polyline', vertices: [[0, 0]] } };
    expect(getNextDrawingState(state, { viewUid: 'b', coordinate: [5, 5] }))
      .toEqual({ drawing: { viewUid: 'b', type: 'polyline', vertices: [[5, 5]] } });
  });
});

describe('createAnnotationEditingStore', () => {
  it('moves the in-progress shape to completedDrawing when finished', () => {
    const store = createAnnotationEditingStore();
    store.getState().setActiveTool('polyline');
    store.getState().addDrawingVertex({ viewUid: 'v', coordinate: [0, 0] });
    store.getState().addDrawingVertex({ viewUid: 'v', coordinate: [1, 1] });
    store.getState().finishDrawing();
    expect(store.getState().drawing).toBeNull();
    expect(store.getState().completedDrawing).toEqual({ viewUid: 'v', type: 'polyline', vertices: [[0, 0], [1, 1]] });
  });

  it('clears the in-progress shape when the tool changes', () => {
    const store = createAnnotationEditingStore();
    store.getState().setActiveTool('polygon');
    store.getState().addDrawingVertex({ viewUid: 'v', coordinate: [0, 0] });
    store.getState().setActiveTool('line');
    expect(store.getState().drawing).toBeNull();
  });
});

function makeConfig() {
  return {
    coordinationSpace: {
      spatialZoom: { A: -5 },
      spatialTargetX: { A: 100 },
      imageLayer: { L0: '__dummy__' },
      fileUid: { L0: 'img' },
      spatialLayerVisible: { L0: true },
      imageChannel: { C0: '__dummy__', C1: '__dummy__' },
      spatialTargetC: { C0: 0, C1: 1 },
      spatialChannelColor: { C0: [255, 0, 0], C1: [0, 255, 0] },
      metaCoordinationScopes: {
        META: { imageLayer: ['L0'] },
      },
      metaCoordinationScopesBy: {
        META: {
          imageLayer: {
            fileUid: { L0: 'L0' },
            spatialLayerVisible: { L0: 'L0' },
            imageChannel: { L0: ['C0', 'C1'] },
          },
          imageChannel: {
            spatialTargetC: { C0: 'C0', C1: 'C1' },
            spatialChannelColor: { C0: 'C0', C1: 'C1' },
          },
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
          metaCoordinationScopes: ['META'],
          metaCoordinationScopesBy: ['META'],
        },
        coordinationValues: {
          spatialTargetY: 7,
        },
      },
    ],
  };
}

describe('getViewCoordinationValuesForFrame', () => {
  it('reads single-level values from scopes and from the view', () => {
    expect(getViewCoordinationValuesForFrame(makeConfig(), 'spatial', ['spatialZoom', 'spatialTargetX', 'spatialTargetY']))
      .toEqual({ spatialZoom: -5, spatialTargetX: 100, spatialTargetY: 7 });
  });

  it('omits types without a value, and unknown views', () => {
    expect(getViewCoordinationValuesForFrame(makeConfig(), 'spatial', ['spatialTargetZ'])).toEqual({});
    expect(getViewCoordinationValuesForFrame(makeConfig(), 'missing', ['spatialZoom'])).toEqual({});
  });

  it('serializes multi-level values as $CL', () => {
    expect(getViewCoordinationValuesForFrame(makeConfig(), 'spatial', ['imageLayer'])).toEqual({
      imageLayer: {
        $CL: [{
          fileUid: 'img',
          spatialLayerVisible: true,
          imageChannel: {
            $CL: [
              { spatialTargetC: 0, spatialChannelColor: [255, 0, 0] },
              { spatialTargetC: 1, spatialChannelColor: [0, 255, 0] },
            ],
          },
        }],
      },
    });
  });

  it('round-trips through applyAnnotationFrameToViewConfig', () => {
    const config = makeConfig();
    const captured = getViewCoordinationValuesForFrame(config, 'spatial', ['spatialZoom', 'imageLayer']);
    const applied = applyAnnotationFrameToViewConfig(config, 'spatial', captured, 'annotation_s_f_spatial_');
    expect(getViewCoordinationValuesForFrame(applied, 'spatial', ['spatialZoom', 'imageLayer']))
      .toEqual(captured);
  });
});
