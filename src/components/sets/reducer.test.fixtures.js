/* eslint-disable import/no-extraneous-dependencies */
import expect from 'expect';

/**
 * The variables with the IgnoreKeys suffix are
 * matchers for the expect.toMatchObject() assertion.
 * https://jestjs.io/docs/en/expect.html#tomatchobjectobject
 */

export const levelTwoNodeLeafWithoutState = {
  name: 'Pericytes',
  color: [255, 0, 0],
  set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
};

export const levelTwoNodeLeaf = {
  name: 'Pericytes',
  set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
  _state: {
    nodeKey: 'pericytes',
    level: 2,
    color: [255, 0, 0],
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const levelTwoNodeLeafIgnoreKeys = {
  name: 'Pericytes',
  set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
  _state: {
    nodeKey: expect.anything(),
    color: [255, 0, 0],
    level: 2,
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const levelOneNodeWithoutState = {
  name: 'Vasculature',
  _state: {
    color: [0, 255, 0],
  },
  children: [
    {
      name: 'Pericytes',
      color: [255, 0, 0],
      set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
    },
    {
      name: 'Endothelial',
      color: [100, 0, 0],
      set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
    },
  ],
};

export const levelOneNode = {
  name: 'Vasculature',
  children: [
    {
      name: 'Pericytes',
      set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
      _state: {
        nodeKey: 'vasculature-pericytes',
        color: [255, 0, 0],
        level: 2,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
    {
      name: 'Endothelial',
      set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
      _state: {
        nodeKey: 'vasculature-endothelial',
        level: 2,
        color: [100, 0, 0],
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: 'vasculature',
    level: 1,
    color: [0, 255, 0],
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const levelOneNodeIgnoreKeys = {
  name: 'Vasculature',
  children: [
    {
      name: 'Pericytes',
      set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
      _state: {
        nodeKey: expect.anything(),
        level: 2,
        color: [255, 0, 0],
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
    {
      name: 'Endothelial',
      set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
      _state: {
        nodeKey: expect.anything(),
        level: 2,
        color: [100, 0, 0],
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: expect.anything(),
    color: [0, 255, 0],
    level: 1,
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const levelZeroNodeWithoutState = {
  name: 'Cell Type Annotations',
  children: [
    {
      name: 'Vasculature',
      _state: {
        color: [0, 255, 0],
      },
      children: [
        {
          name: 'Pericytes',
          color: [255, 0, 0],
          set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
        },
        {
          name: 'Endothelial',
          color: [100, 0, 0],
          set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
        },
      ],
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
          _state: {
            nodeKey: 'vasculature-pericytes',
            level: 2,
            color: [255, 0, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
        {
          name: 'Endothelial',
          set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
          _state: {
            nodeKey: 'vasculature-endothelial',
            level: 2,
            color: [100, 0, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
      ],
      _state: {
        nodeKey: 'vasculature',
        level: 1,
        color: [0, 255, 0],
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: 'cell-type-annotations',
    level: 0,
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const levelZeroNodeIgnoreKeys = {
  name: 'Cell Type Annotations',
  children: [
    {
      name: 'Vasculature',
      children: [
        {
          name: 'Pericytes',
          set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
          _state: {
            nodeKey: expect.anything(),
            level: 2,
            color: [255, 0, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
        {
          name: 'Endothelial',
          set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
          _state: {
            nodeKey: expect.anything(),
            level: 2,
            color: [100, 0, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
      ],
      _state: {
        nodeKey: expect.anything(),
        level: 1,
        color: [0, 255, 0],
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: expect.anything(),
    level: 0,
    isEditing: false,
    isCurrent: false,
    isForTools: false,
  },
};

export const treeWithoutState = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [
    {
      name: 'Cell Type Annotations',
      children: [
        {
          name: 'Vasculature',
          color: [0, 255, 0],
          children: [
            {
              name: 'Pericytes',
              color: [255, 0, 0],
              set: [['cell_1', null], ['cell_2', null], ['cell_3', null]],
            },
            {
              name: 'Endothelial',
              color: [100, 0, 0],
              set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
            },
          ],
        },
      ],
    },
  ],
};

export const treeWithoutStateOrColors = {
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
              set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
            },
          ],
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
              _state: {
                nodeKey: 'vasculature-pericytes',
                level: 2,
                color: [255, 0, 0],
                isEditing: false,
                isCurrent: false,
                isForTools: false,
              },
            },
            {
              name: 'Endothelial',
              set: [['cell_3', null], ['cell_4', null], ['cell_5', null]],
              _state: {
                nodeKey: 'vasculature-endothelial',
                level: 2,
                color: [100, 0, 0],
                isEditing: false,
                isCurrent: false,
                isForTools: false,
              },
            },
          ],
          _state: {
            nodeKey: 'vasculature',
            level: 1,
            color: [0, 255, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
      ],
      _state: {
        nodeKey: 'cell-type-annotations',
        level: 0,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: 'my-tree',
    items: ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5', 'cell_6'],
    checkedKeys: [],
    visibleKeys: [],
    checkedLevel: { levelZeroKey: null, levelIndex: null },
    expandedKeys: [],
    autoExpandParent: true,
    isChecking: false,
  },
};

export const treeIgnoreKeys = {
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
              _state: {
                nodeKey: expect.anything(),
                level: 2,
                color: [255, 0, 0],
                isEditing: false,
                isCurrent: false,
                isForTools: false,
              },
            },
            {
              name: 'Endothelial',
              set: [['cell_4', null], ['cell_5', null], ['cell_6', null]],
              _state: {
                nodeKey: expect.anything(),
                level: 2,
                color: [100, 0, 0],
                isEditing: false,
                isCurrent: false,
                isForTools: false,
              },
            },
          ],
          _state: {
            nodeKey: expect.anything(),
            level: 1,
            color: [0, 255, 0],
            isEditing: false,
            isCurrent: false,
            isForTools: false,
          },
        },
      ],
      _state: {
        nodeKey: expect.anything(),
        level: 0,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
      },
    },
  ],
  _state: {
    nodeKey: expect.anything(),
    items: [],
    checkedKeys: [],
    visibleKeys: [],
    checkedLevel: { levelZeroKey: null, levelIndex: null },
    expandedKeys: [],
    autoExpandParent: true,
    isChecking: false,
  },
};

export const emptyTreeWithoutState = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [],
};

export const emptyTree = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [],
  _state: {
    nodeKey: 'empty-tree',
    items: [],
    checkedKeys: [],
    visibleKeys: [],
    checkedLevel: { levelZeroKey: null, levelIndex: null },
    expandedKeys: [],
    autoExpandParent: true,
    isChecking: false,
  },
};
export const emptyTreeIgnoreKeys = {
  version: '0.1.3',
  datatype: 'cell',
  tree: [],
  _state: {
    nodeKey: expect.anything(),
    items: [],
    checkedKeys: [],
    visibleKeys: [],
    checkedLevel: { levelZeroKey: null, levelIndex: null },
    expandedKeys: [],
    autoExpandParent: true,
    isChecking: false,
  },
};
