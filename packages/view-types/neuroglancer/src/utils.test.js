import {
  multiplyQuat,
  conjQuat,
  eulerToQuaternion,
  quaternionToEuler,
  Q_Y_UP,
} from './utils.js';


test('multiplyQuat identity', () => {
  const I = [0, 0, 0, 1];
  const q = eulerToQuaternion(0.2, -0.5, 0.1);
  expect(multiplyQuat(I, q)).toEqual(expect.arrayContaining(q));
  expect(multiplyQuat(q, I)).toEqual(expect.arrayContaining(q));
});

//  To normalize/map the angels between [-π, π]
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const close = (a, b, eps = 1e-6) => Math.abs(wrap(a - b)) < eps;

// Tests the expected angle after Q_Y_UP
test('Y-up flip maps (x, y, z) -> (x, -y, -z)', () => {
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
test('Q_Y_UP round trip', () => {
  const qVit = eulerToQuaternion(0.25, -0.7, 0);
  const qNg = multiplyQuat(Q_Y_UP, qVit);
  const qBack = multiplyQuat(conjQuat(Q_Y_UP), qNg);
  // equal up to sign
  const sameOrNeg = qBack.map((x, i) => Math.abs(x) - Math.abs(qVit[i]));
  sameOrNeg.forEach(d => expect(Math.abs(d)).toBeLessThan(1e-6));
});
