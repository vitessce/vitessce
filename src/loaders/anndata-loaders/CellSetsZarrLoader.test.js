import expect from 'expect';
import { dataToCellSetsTree } from './CellSetsZarrLoader';

describe('loaders/CellSetsZarrLoader', () => {
  it('dataToCellSetsTree constructs a hierarchy from an array of columns', async () => {
    const data = [
      ['cell_1', 'cell_2', 'cell_3', 'cell_4'],
      [
        [
          ['Immune', 'Immune', 'Immune', 'Neuron'],
          ['B cell', 'B cell', 'B cell', 'Excitatory neuron'],
          ['CD19+', 'CD19-', 'CD19-', 'Retinal bipolar neuron'],
        ],
      ],
    ];
    const options = [
      { groupName: 'Subclass Levels', setName: ['obs/L1', 'obs/L2', 'obs/L3'] },
    ];

    const tree = dataToCellSetsTree(data, options);

    expect(tree).toEqual({
      version: '0.1.3',
      datatype: 'cell',
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
                      name: 'CD19+',
                      set: [
                        ['cell_1', null],
                      ],
                    },
                    {
                      name: 'CD19-',
                      set: [
                        ['cell_2', null],
                        ['cell_3', null],
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
      ['cell_1', 'cell_2', 'cell_3', 'cell_4'],
      [
        ['Immune', 'Immune', 'Immune', 'Neuron'],
      ],
    ];
    const options = [
      { groupName: 'Subclass Level 1', setName: 'obs/L1' },
    ];

    const tree = dataToCellSetsTree(data, options);

    expect(tree).toEqual({
      version: '0.1.3',
      datatype: 'cell',
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
});
