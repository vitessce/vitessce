import { describe, it, expect } from 'vitest';
import {
  isPathFilterIncluded,
  isPathFilterPartiallyIncluded,
  normalizeFilterPaths,
  getSiblingPaths,
  addPathToFilter,
  removePathFromFilter,
  restrictSelectionToFilter,
} from './set-filter-utils.js';

const TREE = {
  version: '0.1.3',
  tree: [
    {
      name: 'Cell Type Annotations',
      children: [
        {
          name: 'Vasculature',
          children: [
            { name: 'Pericytes', set: [['cell_1', null]] },
            { name: 'Endothelial', set: [['cell_2', null]] },
          ],
        },
        { name: 'Immune', set: [['cell_3', null]] },
      ],
    },
    {
      name: 'Louvain Clustering',
      children: [
        { name: 'Cluster 1', set: [['cell_1', null]] },
        { name: 'Cluster 2', set: [['cell_2', null]] },
      ],
    },
  ],
};

describe('Tests for isPathFilterIncluded', () => {
  it('treats a null filter as including everything', () => {
    expect(isPathFilterIncluded(null, ['Cell Type Annotations', 'Immune'])).toBe(true);
  });

  it('treats an empty filter as including nothing', () => {
    expect(isPathFilterIncluded([], ['Cell Type Annotations', 'Immune'])).toBe(false);
  });

  it('includes the descendants of an included path', () => {
    const filterPaths = [['Cell Type Annotations']];
    expect(isPathFilterIncluded(filterPaths, ['Cell Type Annotations'])).toBe(true);
    expect(isPathFilterIncluded(filterPaths, ['Cell Type Annotations', 'Vasculature'])).toBe(true);
    expect(isPathFilterIncluded(
      filterPaths, ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    )).toBe(true);
  });

  it('does not include the ancestors of an included path', () => {
    const filterPaths = [['Cell Type Annotations', 'Vasculature']];
    expect(isPathFilterIncluded(filterPaths, ['Cell Type Annotations'])).toBe(false);
    expect(isPathFilterIncluded(filterPaths, ['Louvain Clustering', 'Cluster 1'])).toBe(false);
  });
});

describe('Tests for isPathFilterPartiallyIncluded', () => {
  it('is false for a null filter', () => {
    expect(isPathFilterPartiallyIncluded(null, ['Cell Type Annotations'])).toBe(false);
  });

  it('is true for the ancestor of an included path', () => {
    const filterPaths = [['Cell Type Annotations', 'Vasculature']];
    expect(isPathFilterPartiallyIncluded(filterPaths, ['Cell Type Annotations'])).toBe(true);
  });

  it('is false for an included path and for a fully excluded path', () => {
    const filterPaths = [['Cell Type Annotations', 'Vasculature']];
    expect(isPathFilterPartiallyIncluded(
      filterPaths, ['Cell Type Annotations', 'Vasculature'],
    )).toBe(false);
    expect(isPathFilterPartiallyIncluded(
      filterPaths, ['Louvain Clustering'],
    )).toBe(false);
  });
});

describe('Tests for normalizeFilterPaths', () => {
  it('returns null when every set is included', () => {
    expect(normalizeFilterPaths(TREE, [
      ['Cell Type Annotations', 'Vasculature'],
      ['Cell Type Annotations', 'Immune'],
      ['Louvain Clustering'],
    ])).toBeNull();
  });

  it('collapses a complete group of siblings into its parent', () => {
    expect(normalizeFilterPaths(TREE, [
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
      ['Louvain Clustering', 'Cluster 1'],
    ])).toEqual([
      ['Cell Type Annotations', 'Vasculature'],
      ['Louvain Clustering', 'Cluster 1'],
    ]);
  });

  it('drops a path which is already covered by an ancestor', () => {
    expect(normalizeFilterPaths(TREE, [
      ['Cell Type Annotations'],
      ['Cell Type Annotations', 'Immune'],
    ])).toEqual([
      ['Cell Type Annotations'],
    ]);
  });

  it('returns the paths as-is when the tree is unavailable', () => {
    const filterPaths = [['Cell Type Annotations', 'Immune']];
    expect(normalizeFilterPaths(null, filterPaths)).toEqual(filterPaths);
  });
});

describe('Tests for getSiblingPaths', () => {
  it('returns the level-zero paths for a level-zero node', () => {
    expect(getSiblingPaths(TREE, ['Cell Type Annotations'])).toEqual([
      ['Cell Type Annotations'],
      ['Louvain Clustering'],
    ]);
  });

  it('returns the parent\'s children, including the target', () => {
    expect(getSiblingPaths(TREE, ['Cell Type Annotations', 'Vasculature', 'Pericytes'])).toEqual([
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
    ]);
  });

  it('returns an empty array when the parent cannot be resolved', () => {
    expect(getSiblingPaths(TREE, ['Nonexistent', 'Child'])).toEqual([]);
    expect(getSiblingPaths(null, ['Cell Type Annotations'])).toEqual([]);
  });
});

describe('Tests for removePathFromFilter', () => {
  it('materializes a null filter before excluding a set', () => {
    expect(removePathFromFilter(TREE, null, ['Cell Type Annotations', 'Immune'])).toEqual([
      ['Cell Type Annotations', 'Vasculature'],
      ['Louvain Clustering'],
    ]);
  });

  it('breaks up ancestor paths at every level down to the excluded set', () => {
    expect(removePathFromFilter(
      TREE, null, ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    )).toEqual([
      ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
      ['Cell Type Annotations', 'Immune'],
      ['Louvain Clustering'],
    ]);
  });

  it('excludes the descendants of the excluded set', () => {
    const filterPaths = [
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Louvain Clustering', 'Cluster 1'],
    ];
    expect(removePathFromFilter(
      TREE, filterPaths, ['Cell Type Annotations', 'Vasculature'],
    )).toEqual([
      ['Louvain Clustering', 'Cluster 1'],
    ]);
  });

  it('leaves an excluded set excluded', () => {
    const filterPaths = [['Louvain Clustering']];
    expect(removePathFromFilter(
      TREE, filterPaths, ['Cell Type Annotations', 'Immune'],
    )).toEqual(filterPaths);
  });

  it('can exclude every set', () => {
    const filterPaths = [['Louvain Clustering', 'Cluster 1']];
    expect(removePathFromFilter(
      TREE, filterPaths, ['Louvain Clustering', 'Cluster 1'],
    )).toEqual([]);
  });
});

describe('Tests for addPathToFilter', () => {
  it('returns null for an already-unfiltered value', () => {
    expect(addPathToFilter(TREE, null, ['Cell Type Annotations', 'Immune'])).toBeNull();
  });

  it('returns null once every set has been included again', () => {
    const filterPaths = removePathFromFilter(
      TREE, null, ['Cell Type Annotations', 'Immune'],
    );
    expect(addPathToFilter(
      TREE, filterPaths, ['Cell Type Annotations', 'Immune'],
    )).toBeNull();
  });

  it('includes the descendants of the added set', () => {
    const filterPaths = [['Louvain Clustering', 'Cluster 1']];
    expect(addPathToFilter(
      TREE, filterPaths, ['Cell Type Annotations', 'Vasculature'],
    )).toEqual([
      ['Cell Type Annotations', 'Vasculature'],
      ['Louvain Clustering', 'Cluster 1'],
    ]);
  });

  it('drops paths which the added set now covers', () => {
    const filterPaths = [
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Louvain Clustering', 'Cluster 1'],
    ];
    expect(addPathToFilter(
      TREE, filterPaths, ['Cell Type Annotations', 'Vasculature'],
    )).toEqual([
      ['Cell Type Annotations', 'Vasculature'],
      ['Louvain Clustering', 'Cluster 1'],
    ]);
  });
});

describe('Tests for restrictSelectionToFilter', () => {
  it('leaves the selection alone when there is no filter', () => {
    const selectionPaths = [['Cell Type Annotations', 'Immune']];
    expect(restrictSelectionToFilter(null, selectionPaths)).toBe(selectionPaths);
  });

  it('returns the same array reference when nothing changed', () => {
    const selectionPaths = [['Louvain Clustering', 'Cluster 1']];
    expect(restrictSelectionToFilter(
      [['Louvain Clustering']], selectionPaths,
    )).toBe(selectionPaths);
  });

  it('drops the selected sets which do not meet the filtering criteria', () => {
    const selectionPaths = [
      ['Cell Type Annotations', 'Immune'],
      ['Louvain Clustering', 'Cluster 1'],
    ];
    expect(restrictSelectionToFilter([['Louvain Clustering']], selectionPaths)).toEqual([
      ['Louvain Clustering', 'Cluster 1'],
    ]);
  });

  it('drops a selected set which is only partially included', () => {
    const selectionPaths = [['Cell Type Annotations', 'Vasculature']];
    expect(restrictSelectionToFilter(
      [['Cell Type Annotations', 'Vasculature', 'Pericytes']], selectionPaths,
    )).toEqual([]);
  });
});
