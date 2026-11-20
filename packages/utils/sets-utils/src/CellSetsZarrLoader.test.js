import { describe, it, expect } from 'vitest';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';
import { dataToCellSetsTree, codesToCellSetsTree } from './CellSetsZarrLoader.js';

describe('loaders/CellSetsZarrLoader', () => {
  it('dataToCellSetsTree constructs a hierarchy from an array of columns', async () => {
    const data = [
      [
        ['cell_1', 'cell_2', 'cell_3', 'cell_4'],
      ],
      [
        [
          ['Immune', 'Immune', 'Immune', 'Neuron'],
          ['B cell', 'B cell', 'B cell', 'Excitatory neuron'],
          ['CD19+', 'CD19-', 'CD19-', 'Retinal bipolar neuron'],
        ],
      ],
      [undefined],
    ];
    const options = [
      { name: 'Subclass Levels', path: ['obs/L1', 'obs/L2', 'obs/L3'] },
    ];

    const tree = dataToCellSetsTree(data, options);

    expect(tree).toEqual({
      version: '0.1.3',
      datatype: 'obs',
      tree: [
        {
          name: 'Subclass Levels',
          children: [
            {
              name: 'Immune',
              children: [
                {
                  name: 'B cell',
                  children: [
                    {
                      name: 'CD19-',
                      set: [
                        ['cell_2', null],
                        ['cell_3', null],
                      ],
                    },
                    {
                      name: 'CD19+',
                      set: [
                        ['cell_1', null],
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'Neuron',
              children: [
                {
                  name: 'Excitatory neuron',
                  children: [
                    {
                      name: 'Retinal bipolar neuron',
                      set: [
                        ['cell_4', null],
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('dataToCellSetsTree creates a flat tree from a single column', async () => {
    const data = [
      [
        ['cell_1', 'cell_2', 'cell_3', 'cell_4'],
      ],
      [
        ['Immune', 'Immune', 'Immune', 'Neuron'],
      ],
      [undefined],
    ];
    const options = [
      { name: 'Subclass Level 1', path: 'obs/L1' },
    ];

    const tree = dataToCellSetsTree(data, options);

    expect(tree).toEqual({
      version: '0.1.3',
      datatype: 'obs',
      tree: [
        {
          name: 'Subclass Level 1',
          children: [
            {
              name: 'Immune',
              set: [
                ['cell_1', null],
                ['cell_2', null],
                ['cell_3', null],
              ],
            },
            {
              name: 'Neuron',
              set: [
                ['cell_4', null],
              ],
            },
          ],
        },
      ],
    });
  });

  it('dataToCellSetsTree creates a flat tree from a single column with scores', async () => {
    const data = [
      [
        ['cell_1', 'cell_2', 'cell_3', 'cell_4'],
      ],
      [
        ['Immune', 'Immune', 'Immune', 'Neuron'],
      ],
      [
        [0.25, 0.5, 0.6, 0.1],
      ],
    ];
    const options = [
      { name: 'Subclass Level 1', path: 'obs/L1' },
    ];

    const tree = dataToCellSetsTree(data, options);

    expect(tree).toEqual({
      version: '0.1.3',
      datatype: 'obs',
      tree: [
        {
          name: 'Subclass Level 1',
          children: [
            {
              name: 'Immune',
              set: [
                ['cell_1', 0.25],
                ['cell_2', 0.5],
                ['cell_3', 0.6],
              ],
            },
            {
              name: 'Neuron',
              set: [
                ['cell_4', 0.1],
              ],
            },
          ],
        },
      ],
    });
  });
});

describe('loaders/codesToCellSetsTree', () => {
  // Decode codes to strings the way AnnDataSource._loadColumn does, so that the
  // string route (dataToCellSetsTree) can serve as the reference output.
  const decode = (codes, categories) => Array.from(codes).map(c => categories[c]);

  it('matches dataToCellSetsTree for unsorted categories with an unused one', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5'];
    // 'gamma' is unused: dataToCellSetsTree only creates sets for observed values.
    const categories = ['beta', 'alpha', 'gamma'];
    const codes = Int8Array.from([1, 0, 0, 1, 1]);
    const options = [{ name: 'Cell Type' }];
    const expected = dataToCellSetsTree(
      [[obsIndex], [decode(codes, categories)], [undefined]], options,
    );
    const actual = codesToCellSetsTree({ obsIndex, columns: [{ codes, categories }] }, options);
    expect(actual).toEqual(expected);
  });

  it('matches dataToCellSetsTree for negative (missing) codes', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3'];
    const categories = ['alpha', 'beta'];
    // categories[-1] is undefined in the string route; both routes place the
    // observation in a set named by the shared placeholder, ordered last.
    const codes = Int8Array.from([0, -1, 1]);
    const options = [{ name: 'Cell Type' }];
    const expected = dataToCellSetsTree(
      [[obsIndex], [decode(codes, categories)], [undefined]], options,
    );
    const actual = codesToCellSetsTree({ obsIndex, columns: [{ codes, categories }] }, options);
    expect(actual).toEqual(expected);
    expect(actual.tree[0].children.map(c => c.name))
      .toEqual(['alpha', 'beta', MISSING_VALUE_PLACEHOLDER]);
    expect(actual.tree[0].children[2].set).toEqual([['cell_2', null]]);
    // The name is a real string, so the tree (and any selection path into it)
    // survives serialization; an undefined name would be dropped by JSON.
    expect(JSON.parse(JSON.stringify(actual))).toEqual(actual);
  });

  it('dataToCellSetsTree names missing values consistently across levels', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3'];
    const options = [{ name: 'Subclass Levels' }];
    // A missing value at either level of a multi-level hierarchy.
    const tree = dataToCellSetsTree([
      [obsIndex],
      [[['Immune', undefined, 'Immune'], ['B cell', 'T cell', null]]],
      [undefined],
    ], options);
    const levelOne = tree.tree[0].children;
    expect(levelOne.map(n => n.name)).toEqual([MISSING_VALUE_PLACEHOLDER, 'Immune']);
    expect(levelOne[0].children.map(n => n.name)).toEqual(['T cell']);
    expect(levelOne[1].children.map(n => n.name)).toEqual([MISSING_VALUE_PLACEHOLDER, 'B cell']);
    expect(levelOne[1].children[0].set).toEqual([['cell_3', null]]);
    expect(JSON.parse(JSON.stringify(tree))).toEqual(tree);
  });

  it('matches dataToCellSetsTree for numeric-string categories (key-order quirk)', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4'];
    // Integer-like names: plain-object key ordering places them in ascending
    // numeric order regardless of the lexicographic sort. Both routes use the
    // same construction, so both exhibit the same order.
    const categories = ['10', '2', '1'];
    const codes = Int8Array.from([0, 1, 2, 0]);
    const options = [{ name: 'Leiden' }];
    const expected = dataToCellSetsTree(
      [[obsIndex], [decode(codes, categories)], [undefined]], options,
    );
    const actual = codesToCellSetsTree({ obsIndex, columns: [{ codes, categories }] }, options);
    expect(actual).toEqual(expected);
    expect(actual.tree[0].children.map(c => c.name)).toEqual(['1', '2', '10']);
  });

  it('matches dataToCellSetsTree across multiple hierarchies', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3'];
    const colA = { codes: Int8Array.from([0, 1, 0]), categories: ['T cell', 'B cell'] };
    const colB = { codes: Int8Array.from([1, 1, 0]), categories: ['0', '1'] };
    const options = [{ name: 'Cell Type' }, { name: 'Leiden' }];
    const expected = dataToCellSetsTree([
      [obsIndex, obsIndex],
      [decode(colA.codes, colA.categories), decode(colB.codes, colB.categories)],
      [undefined, undefined],
    ], options);
    const actual = codesToCellSetsTree({ obsIndex, columns: [colA, colB] }, options);
    expect(actual).toEqual(expected);
  });
});
