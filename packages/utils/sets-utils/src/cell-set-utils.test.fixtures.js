export const levelTwoNodeLeaf = {
  name: 'Pericytes',
  set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
};

export const levelOneNode = {
  name: 'Vasculature',
  children: [
    {
      name: 'Pericytes',
      set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
    },
    {
      name: 'Endothelial',
      set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
    },
  ],
};

export const levelZeroNode = {
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
          set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
        },
      ],
    },
  ],
};

export const tree = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [
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
      ],
    },
  ],
};

// A tree whose sets carry per-observation confidence scores, as produced by the
// `scorePath` obsSets option. Used to exercise the uncertainty-mixing branch of
// treeToCellColorsBySetNames.
export const treeWithScores = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [
    {
      name: 'Cell Type Annotations',
      children: [
        {
          name: 'Pericytes',
          set: [['cell_1', 1.0], ['cell_2', 0.5], ['cell_3', 0.0]],
        },
      ],
    },
  ],
};
