import { describe, it, expect } from 'vitest';
import {
  getVolumeSceneFrame,
  snapshotToVolumeCamera,
  volumeCameraToSnapshot,
  roundCameraSnapshot,
  DEFAULT_VOLUME_CAMERA,
} from './camera-snapshot.js';

const FOV = 50;

// A 200 x 100 x 50 µm volume, its corner at (10, 20, 30) µm.
const frame = getVolumeSceneFrame({
  physicalSize: [200, 100, 50],
  boxExtent: [1, 0.5, 0.25],
  origin: [10, 20, 30],
  metersPerUnit: 1e-6,
});

const expectCloseArray = (actual, expected) => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((value, i) => {
    expect(actual[i]).toBeCloseTo(value);
  });
};

describe('camera snapshot', () => {
  it('relates scene and world units', () => {
    expect(frame.worldPerScene).toBe(200);
    expect(getVolumeSceneFrame({ physicalSize: [0, 1, 1], boxExtent: [1, 1, 1] })).toBeNull();
    expect(getVolumeSceneFrame({ physicalSize: [1, 1], boxExtent: [1, 1, 1] })).toBeNull();
  });

  it('places the default camera at the volume center in world units', () => {
    const snapshot = volumeCameraToSnapshot({
      ...DEFAULT_VOLUME_CAMERA, quaternion: [0, 0, 0, 1], fovDegrees: FOV,
    }, frame);
    // The center of the volume.
    expectCloseArray(snapshot.position, [110, 70, 55]);
    expect(snapshot.quaternion).toEqual([0, 0, 0, 1]);
    expect(snapshot.projectionScale).toBeCloseTo(4 * 2 * Math.tan((FOV * Math.PI) / 360) * 200);
    expect(snapshot.fovDegrees).toBe(FOV);
    expect(snapshot.metersPerUnit).toBe(1e-6);
  });

  it('round-trips the camera, including roll', () => {
    // 90° about Z: the camera's up is world -X.
    const quaternion = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
    const snapshot = {
      position: [50, 60, 40], quaternion, projectionScale: 80, fovDegrees: 45,
    };
    const camera = snapshotToVolumeCamera(snapshot, frame, FOV);
    expectCloseArray(camera.target, [0.2 - 0.5, 0.2 - 0.25, 0.05 - 0.125]);
    expectCloseArray(camera.up, [-1, 0, 0]);
    // Same visible height at the pivot, with the volume view's field of view.
    expect(camera.distance).toBeCloseTo((80 / 200) / (2 * Math.tan((FOV * Math.PI) / 360)));
    expectCloseArray(
      camera.position,
      camera.target.map((value, axis) => value + [0, 0, camera.distance][axis]),
    );

    const result = volumeCameraToSnapshot({ ...camera, quaternion, fovDegrees: FOV }, frame);
    expectCloseArray(result.position, snapshot.position);
    expect(result.projectionScale).toBeCloseTo(80);
  });

  it('converts snapshots in other units', () => {
    // Neuroglancer in nm.
    const camera = snapshotToVolumeCamera({
      position: [110e3, 70e3, 55e3],
      quaternion: [0, 0, 0, 1],
      projectionScale: 200e3,
      fovDegrees: 45,
      metersPerUnit: 1e-9,
    }, frame, FOV);
    expectCloseArray(camera.target, [0, 0, 0]);
    expect(camera.distance).toBeCloseTo(1 / (2 * Math.tan((FOV * Math.PI) / 360)));
  });

  it('rejects unusable snapshots', () => {
    const valid = {
      position: [0, 0, 0], quaternion: [0, 0, 0, 1], projectionScale: 1, fovDegrees: 45,
    };
    expect(snapshotToVolumeCamera(null, frame, FOV)).toBeNull();
    expect(snapshotToVolumeCamera(valid, null, FOV)).toBeNull();
    expect(snapshotToVolumeCamera({ ...valid, position: [0, 0] }, frame, FOV)).toBeNull();
    expect(snapshotToVolumeCamera({ ...valid, quaternion: [0, 0, 0, 0] }, frame, FOV)).toBeNull();
    expect(snapshotToVolumeCamera({ ...valid, projectionScale: 0 }, frame, FOV)).toBeNull();
  });

  it('rounds the snapshot', () => {
    expect(roundCameraSnapshot({
      position: [1.23456, -0.0001, 2],
      quaternion: [0.1234567, 0, 0, -0.0000001],
      projectionScale: 3.14159,
      fovDegrees: 50,
      metersPerUnit: 1e-6,
    })).toEqual({
      position: [1.235, 0, 2],
      quaternion: [0.123457, 0, 0, 0],
      projectionScale: 3.142,
      fovDegrees: 50,
      metersPerUnit: 1e-6,
    });
  });
});
