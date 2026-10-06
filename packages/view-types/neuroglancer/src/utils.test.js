import { describe, expect, it } from 'vitest';
import {
  multiplyQuat,
  conjQuat,
  eulerToQuaternion,
  quaternionToEuler,
  Q_Y_UP,
  diffCameraState,
  valueGreaterThanEpsilon,
  EPSILON_KEYS_MAPPING_NG,
} from './utils.js';

//  To normalize/map the angels between [-π, π]
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const close = (a, b, eps = 1e-6) => Math.abs(wrap(a - b)) < eps;

describe('Quaternion utilities', () => {
  it('multiplyQuat identity', () => {
    const I = [0, 0, 0, 1];
    const q = eulerToQuaternion(0.2, -0.5, 0.1);
    expect(multiplyQuat(I, q)).toEqual(expect.arrayContaining(q));
    expect(multiplyQuat(q, I)).toEqual(expect.arrayContaining(q));
  });

  // Tests the expected angle after Q_Y_UP
  it('Y-up flip maps (x, y, z) -> (x, -y, -z)', () => {
    const v = [0.3, 0.4, 0.0];
    const qVit = eulerToQuaternion(...v);
    const qNg = multiplyQuat(Q_Y_UP, qVit);
    const [pitch, yaw] = quaternionToEuler(qNg); // radians
    const ok = (close(pitch, -v[0]) && close(yaw, -v[1]))
    || (close(pitch, -v[0]) && close(yaw, Math.PI - v[1]));
    // Euler angles can give both yaw’ ≈ −yaw and yaw’ ≈ π − yaw
    // Alternative is to compare only Quaternion
    expect(ok).toBe(true);
  });

  //  Tests that applying and reversing Q_Y_UP gives back original orientation
  it('Q_Y_UP round trip', () => {
    const qVit = eulerToQuaternion(0.25, -0.7, 0);
    const qNg = multiplyQuat(Q_Y_UP, qVit);
    const qBack = multiplyQuat(conjQuat(Q_Y_UP), qNg);
    // equal up to sign
    const sameOrNeg = qBack.map((x, i) => Math.abs(x) - Math.abs(qVit[i]));
    sameOrNeg.forEach(d => expect(Math.abs(d)).toBeLessThan(1e-6));
  });
});

describe('diffCameraState', () => {
  const baseState = {
    projectionScale: 100,
    position: [0, 0, 0],
    projectionOrientation: [0, 0, 0, 1],
  };

  it('detects a single change past the projectionScale epsilon', () => {
    const next = {
      ...baseState,
      projectionScale: 100 + EPSILON_KEYS_MAPPING_NG.projectionScale + 1,
    };
    const result = diffCameraState(baseState, next);
    expect(result).toEqual({ changed: true, scale: true, pos: false, rot: false });
  });

  it('does not flag a change under the projectionScale epsilon', () => {
    const next = {
      ...baseState,
      projectionScale: 100 + EPSILON_KEYS_MAPPING_NG.projectionScale - 1,
    };
    const result = diffCameraState(baseState, next);
    expect(result.changed).toBe(false);
  });

  it('regression: chained per-render diffs miss cumulative drift that a single diff against the original baseline catches', () => {
    // This bug was fixed in ReactNeuroglancer.js's componentDidUpdate:
    // diffCameraState was being called against prevProps.viewerState (which
    // advances every render) instead of the last state actually *applied* to
    // NG. A sequence of small changes, each individually under epsilon, then
    // silently never got pushed to NG at all -- the camera visibly drifted
    // out of sync over a drag, one sub-epsilon step at a time.
    const stepA = baseState;
    const stepB = { ...baseState, projectionScale: 103 }; // delta from A: 3, under epsilon (5)
    const stepC = { ...baseState, projectionScale: 106 }; // delta from B: 3, under epsilon (5)

    // Diffing each step against only the immediately preceding one (the buggy
    // behavior): neither hop looks like a real change.
    expect(diffCameraState(stepA, stepB).changed).toBe(false);
    expect(diffCameraState(stepB, stepC).changed).toBe(false);

    // But diffing the final state against the original baseline (the fixed
    // behavior -- comparing against the last *applied* state) correctly
    // reveals the true, cumulative delta: 6, over epsilon.
    expect(diffCameraState(stepA, stepC).changed).toBe(true);
    expect(diffCameraState(stepA, stepC).scale).toBe(true);
  });

  it('couples position to a softer threshold when zoom also changed', () => {
    // A position delta of 0.5 is under the hard position epsilon (1), but
    // over SOFT_POS_FACTOR (0.15) -- and projectionScale changed at the same
    // time, so the soft-coupling path should still flag position as changed
    // (zoom and pan travel together during a real drag/scroll gesture).
    const next = {
      ...baseState,
      projectionScale: 100 + EPSILON_KEYS_MAPPING_NG.projectionScale + 1, // real scale change
      position: [0.5, 0, 0],
    };
    const result = diffCameraState(baseState, next);
    expect(result.scale).toBe(true);
    expect(result.pos).toBe(true); // via the soft-position coupling, not the hard epsilon
  });

  it('does not apply the soft position coupling when zoom did not change', () => {
    // Same small position delta (0.5) as above, but with no accompanying
    // projectionScale change -- the soft-coupling path only exists to let
    // zoom and pan travel together, so it must stay off when zoom is stable.
    const next = { ...baseState, position: [0.5, 0, 0] };
    const result = diffCameraState(baseState, next);
    expect(result.pos).toBe(false);
    expect(result.changed).toBe(false);
  });

  it('detects a rotation change past the projectionOrientation epsilon', () => {
    const rotated = multiplyQuat(Q_Y_UP, eulerToQuaternion(0.1, 0, 0));
    const next = { ...baseState, projectionOrientation: rotated };
    const result = diffCameraState(baseState, next);
    expect(result.rot).toBe(true);
    expect(result.changed).toBe(true);
  });
});

describe('valueGreaterThanEpsilon', () => {
  it('compares arrays element-wise', () => {
    expect(valueGreaterThanEpsilon([0, 0, 0, 1], [0, 0, 0, 1.1], 0.01)).toBe(true);
    expect(valueGreaterThanEpsilon([0, 0, 0, 1], [0, 0, 0, 1.001], 0.01)).toBe(false);
  });

  it('compares plain numbers', () => {
    expect(valueGreaterThanEpsilon(10, 16, 5)).toBe(true);
    expect(valueGreaterThanEpsilon(10, 13, 5)).toBe(false);
  });

  it('returns undefined for mismatched types rather than throwing', () => {
    // This was found silently corrupting camState logging
    // when a and b were of different shapes/types.
    expect(valueGreaterThanEpsilon(undefined, [0, 0, 0, 1], 0.01)).toBeUndefined();
    expect(valueGreaterThanEpsilon(5, [0, 0, 0], 0.01)).toBeUndefined();
  });
});
