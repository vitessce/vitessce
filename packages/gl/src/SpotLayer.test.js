import { describe, it, expect } from 'vitest';
import SpotLayer from './SpotLayer.js';

describe('SpotLayer', () => {
  it('modifies the ScatterplotLayer fragment shader to support square spots', () => {
    const layer = new SpotLayer({ id: 'spots', data: [] });
    const { fs } = layer.getShaders();
    expect(fs).toContain('uniform bool uIsSquare;');
    expect(fs).toContain('max(abs(unitPosition.x), abs(unitPosition.y))');
  });

  it('defaults to circle spots', () => {
    const layer = new SpotLayer({ id: 'spots', data: [] });
    expect(layer.props.spotShape).toBe('circle');
  });
});
