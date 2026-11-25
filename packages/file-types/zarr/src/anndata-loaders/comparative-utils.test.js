import { describe, it, expect } from 'vitest';
import { isEqualPathPair, isMatchingSampleSetFilter } from './comparative-utils.js';

const healthy = ['EnrollmentCategory', 'Healthy Reference'];
const ckd = ['EnrollmentCategory', 'CKD'];
const aki = ['EnrollmentCategory', 'AKI'];

describe('comparative-utils', () => {
  describe('isEqualPathPair', () => {
    it('matches pairs regardless of order', () => {
      expect(isEqualPathPair([healthy, ckd], [healthy, ckd])).toBe(true);
      expect(isEqualPathPair([healthy, ckd], [ckd, healthy])).toBe(true);
      expect(isEqualPathPair([healthy, ckd], [healthy, aki])).toBe(false);
    });
  });

  describe('isMatchingSampleSetFilter', () => {
    it('only matches unfiltered results when no sample sets are selected', () => {
      expect(isMatchingSampleSetFilter(null, undefined)).toBe(true);
      expect(isMatchingSampleSetFilter(null, null)).toBe(true);
      expect(isMatchingSampleSetFilter(null, [])).toBe(true);
      // Results restricted to a single sample group (e.g., DCT vs. rest within CKD samples).
      expect(isMatchingSampleSetFilter(null, [ckd])).toBe(false);
      // Results comparing two sample groups.
      expect(isMatchingSampleSetFilter(null, [healthy, ckd])).toBe(false);
    });

    it('only matches results filtered to the single selected sample set', () => {
      expect(isMatchingSampleSetFilter([ckd], [ckd])).toBe(true);
      expect(isMatchingSampleSetFilter([ckd], [aki])).toBe(false);
      // Unfiltered results (across all samples).
      expect(isMatchingSampleSetFilter([ckd], undefined)).toBe(false);
      expect(isMatchingSampleSetFilter([ckd], [])).toBe(false);
      // Results comparing two sample groups, even when one of them is the selected group.
      expect(isMatchingSampleSetFilter([ckd], [healthy, ckd])).toBe(false);
    });

    it('treats an empty selection like no selection', () => {
      expect(isMatchingSampleSetFilter([], undefined)).toBe(true);
      expect(isMatchingSampleSetFilter([], [ckd])).toBe(false);
    });

    it('matches the selected pair of sample sets in either order', () => {
      expect(isMatchingSampleSetFilter([healthy, ckd], [healthy, ckd])).toBe(true);
      expect(isMatchingSampleSetFilter([healthy, ckd], [ckd, healthy])).toBe(true);
      expect(isMatchingSampleSetFilter([healthy, ckd], [healthy, aki])).toBe(false);
    });

    it('does not match filters that are missing or not a pair when sample sets are selected', () => {
      expect(isMatchingSampleSetFilter([healthy, ckd], undefined)).toBe(false);
      expect(isMatchingSampleSetFilter([healthy, ckd], [])).toBe(false);
      expect(isMatchingSampleSetFilter([healthy, ckd], [ckd])).toBe(false);
      expect(isMatchingSampleSetFilter([healthy, ckd], [healthy, ckd, aki])).toBe(false);
    });
  });
});
