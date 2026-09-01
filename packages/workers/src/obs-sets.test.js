import { describe, it, expect } from 'vitest';
import {
  packStrings, unpackStrings, buildMembershipCsr, buildMembershipFromBuffers,
} from './obs-sets.js';

describe('obs sets membership encoding', () => {
  const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4'];
  // Two leaf sets: {cell_1, cell_2, cell_3} and {cell_3, cell_4}.
  const setObsIds = ['cell_1', 'cell_2', 'cell_3', 'cell_3', 'cell_4'];
  const setSizes = new Uint32Array([3, 2]);

  const membershipOf = (csr, i) => Array.from(csr.setIds.slice(csr.offsets[i], csr.offsets[i + 1]));

  it('packs and unpacks strings', () => {
    expect(unpackStrings(packStrings(obsIndex))).toEqual(obsIndex);
    expect(unpackStrings(packStrings([]))).toEqual([]);
    expect(unpackStrings(packStrings(['only']))).toEqual(['only']);
    // The packed form is a single view over one buffer, which is what makes it
    // transferable rather than structured-cloned.
    const packed = packStrings(obsIndex);
    expect(ArrayBuffer.isView(packed)).toEqual(true);
    expect(packed.buffer.byteLength).toBeGreaterThan(0);
  });

  it('builds a CSR encoding aligned to obsIndex', () => {
    const csr = buildMembershipCsr(obsIndex, setObsIds, setSizes);
    expect(Array.from(csr.offsets)).toEqual([0, 1, 2, 4, 5]);
    expect(membershipOf(csr, 0)).toEqual([0]);
    expect(membershipOf(csr, 1)).toEqual([0]);
    // cell_3 is in both sets.
    expect(membershipOf(csr, 2)).toEqual([0, 1]);
    expect(membershipOf(csr, 3)).toEqual([1]);
  });

  it('skips set members that are absent from obsIndex', () => {
    const csr = buildMembershipCsr(['cell_2'], setObsIds, setSizes);
    expect(Array.from(csr.offsets)).toEqual([0, 1]);
    expect(membershipOf(csr, 0)).toEqual([0]);
    // The shortfall is detectable, so callers can decline the encoding.
    expect(csr.setIds.length).toBeLessThan(setObsIds.length);
  });

  it('handles observations in no set', () => {
    const csr = buildMembershipCsr(obsIndex, ['cell_2'], new Uint32Array([1]));
    expect(membershipOf(csr, 0)).toEqual([]);
    expect(membershipOf(csr, 1)).toEqual([0]);
  });

  it('round-trips through packed buffers', () => {
    const csr = buildMembershipFromBuffers({
      obsIndexBuffer: packStrings(obsIndex),
      setObsIdsBuffer: packStrings(setObsIds),
      setSizes,
    });
    expect(Array.from(csr.offsets)).toEqual([0, 1, 2, 4, 5]);
    expect(membershipOf(csr, 2)).toEqual([0, 1]);
  });

  it('refuses to answer when packed IDs do not round-trip', () => {
    // A separator inside an observation ID would misalign every later membership.
    expect(() => buildMembershipFromBuffers({
      obsIndexBuffer: packStrings(obsIndex),
      setObsIdsBuffer: packStrings(['cell_1', 'cell_2\nsneaky', 'cell_3', 'cell_3', 'cell_4']),
      setSizes,
    })).toThrow(/did not round-trip/);
  });
});
