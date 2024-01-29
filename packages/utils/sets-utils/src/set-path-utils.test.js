import { describe, it, expect } from 'vitest';
import { filterPathsByExpansionAndSelection, findChangedHierarchy } from './set-path-utils.js';

describe('Tests for findChangedHierarchy', () => {
  it('Computes correct new hierarchy after new selection', () => {
    const prevSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];
    const currSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
    ];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(['Cell Type Annotations', 'Vasculature']);
  });

  it('Computes correct hierarchy after unselecting', () => {
    const prevSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];
    const currSelectedPaths = [
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(['Louvain Clustering']);
  });

  it('Computes correct hierarchy after select only', () => {
    const prevSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Louvain Clustering', 'Cluster 3'],
      ['Louvain Clustering', 'Cluster 4'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];
    const currSelectedPaths = [
      ['Cell Type Annotations', 'Vasculature'],
    ];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(['Cell Type Annotations']);
  });

  it('Returns null when hierarchy was not changed', () => {
    const prevSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];
    const currSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(null);
  });

  it('Works when nothing was previously selected', () => {
    const prevSelectedPaths = [];
    const currSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
    ];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(['Louvain Clustering']);
  });

  it('Works when nothing is selected', () => {
    const prevSelectedPaths = [
      ['Louvain Clustering', 'Cluster 1'],
    ];
    const currSelectedPaths = [];

    const changedHierarchy = findChangedHierarchy(prevSelectedPaths, currSelectedPaths);
    expect(changedHierarchy).toEqual(['Louvain Clustering']);
  });
});

describe('Tests for filterPathsByExpansionAndSelection', () => {
  const tree = {
    version: '0.1.3',
    datatype: 'cell',
    tree: [
      {
        name: 'Louvain Clustering',
        children: [
          {
            name: 'Cluster 1',
            set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
          },
          {
            name: 'Cluster 2',
            set: [['cell_4', null], ['cell_5', null]],
          },
          {
            name: 'Cluster 3',
            set: [['cell_6', null], ['cell_7', null]],
          },
          {
            name: 'Cluster 4',
            set: [['cell_8', null], ['cell_9', null], ['cell_10', null]],
          },
        ],
      },
      {
        name: 'Cell Type Annotations',
        children: [
          {
            name: 'Vasculature',
            children: [
              {
                name: 'Pericytes',
                set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
              },
              {
                name: 'Endothelial',
                set: [['cell_3', null], ['cell_4', null], ['cell_5', null]],
              },
              {
                name: 'Epithelial',
                children: [
                  {
                    name: 'Squamous',
                    set: [['cell_5', null], ['cell_6', null], ['cell_7', null]],
                  },
                ],
              },
            ],
          },
          {
            name: 'Immune',
            set: [['cell_8', null], ['cell_9', null], ['cell_10', null]],
          },
        ],
      },
    ],
  };

  it('Generates correct cell set paths when expanded', () => {
    const hierarchy = ['Louvain Clustering'];
    const cellSetExpansion = [
      ['Louvain Clustering'],
    ];
    const cellSetSelection = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const cellSetPaths = filterPathsByExpansionAndSelection(
      tree,
      hierarchy,
      cellSetExpansion,
      cellSetSelection,
    );
    expect(cellSetPaths).toEqual([
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Louvain Clustering', 'Cluster 3'],
      ['Louvain Clustering', 'Cluster 4'],
    ]);
  });

  it('Generates correct cell set paths when not expanded and no nested hierarchy', () => {
    const hierarchy = ['Louvain Clustering'];
    const cellSetExpansion = [
    ];
    const cellSetSelection = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const cellSetPaths = filterPathsByExpansionAndSelection(
      tree,
      hierarchy,
      cellSetExpansion,
      cellSetSelection,
    );
    expect(cellSetPaths).toEqual([
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Louvain Clustering', 'Cluster 3'],
      ['Louvain Clustering', 'Cluster 4'],
    ]);
  });

  it('Generates correct cell set paths when expanded and nested hierarchy', () => {
    const hierarchy = ['Cell Type Annotations'];
    const cellSetExpansion = [
      ['Cell Type Annotations', 'Vasculature'],
    ];
    const cellSetSelection = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const cellSetPaths = filterPathsByExpansionAndSelection(tree,
      hierarchy,
      cellSetExpansion,
      cellSetSelection);
    expect(cellSetPaths).toEqual([
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
      ['Cell Type Annotations', 'Vasculature', 'Epithelial'],
    ]);
  });

  it('Generates correct cell set paths when not expanded and nested hierarchy', () => {
    const hierarchy = ['Cell Type Annotations'];
    const cellSetExpansion = [
      ['Cell Type Annotations'],
    ];
    const cellSetSelection = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
    ];

    const cellSetPaths = filterPathsByExpansionAndSelection(
      tree,
      hierarchy,
      cellSetExpansion,
      cellSetSelection,
    );
    expect(cellSetPaths).toEqual([
      ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
      ['Cell Type Annotations', 'Immune'],
    ]);
  });

  it('Uses paths in cellSetSelection when cellSetExpansion is null', () => {
    const hierarchy = ['Louvain Clustering'];
    const cellSetExpansion = null;
    const cellSetSelection = [
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Louvain Clustering', 'Cluster 3'],
      ['Louvain Clustering', 'Cluster 4'],
    ];

    const cellSetPaths = filterPathsByExpansionAndSelection(
      tree,
      hierarchy,
      cellSetExpansion,
      cellSetSelection,
    );
    expect(cellSetPaths).toEqual([
      ['Louvain Clustering', 'Cluster 1'],
      ['Louvain Clustering', 'Cluster 2'],
      ['Louvain Clustering', 'Cluster 3'],
      ['Louvain Clustering', 'Cluster 4'],
    ]);
  });
});
