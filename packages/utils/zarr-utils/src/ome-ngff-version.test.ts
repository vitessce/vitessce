import { describe, it, expect } from 'vitest';
import { flattenOmeAttrs, getOmeNgffVersion } from './ome-ngff-version.js';

describe('flattenOmeAttrs', () => {
  it('hoists ome.* keys to the root for v0.5 attrs', () => {
    const v05 = {
      ome: {
        omero: { channels: [{ label: 'DAPI' }] },
        multiscales: [{ datasets: [{ path: '0' }], axes: [{ name: 'y', type: 'space' }] }],
        version: '0.5-dev-spatialdata',
      },
      spatialdata_attrs: { version: '0.3' },
    };
    const flat = flattenOmeAttrs(v05) as Record<string, unknown>;
    expect(flat.omero).toEqual(v05.ome.omero);
    expect(flat.multiscales).toEqual(v05.ome.multiscales);
    expect(flat.version).toBe('0.5-dev-spatialdata');
    expect(flat.spatialdata_attrs).toEqual({ version: '0.3' });
  });

  it('passes v0.4-style flat attrs through unchanged in shape', () => {
    const v04 = {
      multiscales: [{ datasets: [{ path: '0' }], version: '0.4' }],
      omero: { channels: [] },
    };
    const flat = flattenOmeAttrs(v04);
    expect(flat.multiscales).toBe(v04.multiscales);
    expect(flat.omero).toBe(v04.omero);
    expect('ome' in flat).toBe(false);
  });

  it('keeps root-level keys on conflict with ome.*', () => {
    const attrs = {
      ome: { version: 'from-ome' },
      version: 'from-root',
    };
    expect(flattenOmeAttrs(attrs).version).toBe('from-root');
  });

  it('returns input unchanged when ome is absent or non-object', () => {
    expect(flattenOmeAttrs({ foo: 1 })).toEqual({ foo: 1 });
    expect(flattenOmeAttrs({ ome: null, foo: 1 })).toEqual({ ome: null, foo: 1 });
  });
});

describe('getOmeNgffVersion', () => {
  it('reads ome.version (root-level after flattening) for v0.5', () => {
    const v05 = flattenOmeAttrs({
      ome: { version: '0.5-dev-spatialdata', multiscales: [{}] },
    });
    expect(getOmeNgffVersion(v05)).toBe('0.5-dev-spatialdata');
  });

  it('falls back to multiscales[0].version for v0.4', () => {
    const v04 = { multiscales: [{ version: '0.4' }] };
    expect(getOmeNgffVersion(v04)).toBe('0.4');
  });

  it('returns null when no version is declared', () => {
    expect(getOmeNgffVersion({ multiscales: [{}] })).toBeNull();
    expect(getOmeNgffVersion({})).toBeNull();
    expect(getOmeNgffVersion(null)).toBeNull();
  });
});
