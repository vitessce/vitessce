import { describe, it, expect } from 'vitest';
import { dataToCellSetsTree } from './CellSetsZarrLoader.js';
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
