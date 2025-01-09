import { describe, it, expect } from 'vitest';
import { square } from './spatial-constants.js';

describe('square()', () => {
  it('gives the right coordinates', () => {
    expect(square(0, 0, 50)).toEqual([[0, 50], [50, 0], [0, -50], [-50, 0]]);
  });
});
