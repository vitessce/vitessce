/* eslint-disable */
import expect from 'expect';

/**
 * The variables with the IgnoreKeys suffix are
 * matchers for the expect.toMatchObject() assertion.
 * https://jestjs.io/docs/en/expect.html#tomatchobjectobject
 */

export const levelTwoNodeLeafWithoutState = {
    name: 'Pericytes',
    color: [255, 0, 0],
    set: ["cell_1", "cell_2", "cell_3"]
};

export const levelTwoNodeLeaf = {
    name: 'Pericytes',
    color: [255, 0, 0],
    set: ["cell_1", "cell_2", "cell_3"],
    _state: {
        key: 'pericytes',
        level: 2,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const levelTwoNodeLeafIgnoreKeys = {
    name: 'Pericytes',
    color: [255, 0, 0],
    set: ["cell_1", "cell_2", "cell_3"],
    _state: {
        key: expect.anything(),
        level: 2,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const levelOneNodeWithoutState = {
    name: 'Vasculature',
    color: [0, 255, 0],
    children: [
        {
            name: 'Pericytes',
            color: [255, 0, 0],
            set: ["cell_1", "cell_2", "cell_3"],
        },
        {
            name: 'Endothelial',
            color: [100, 0, 0],
            set: ["cell_4", "cell_5", "cell_6"],
        }
    ],
};

export const levelOneNode = {
    name: 'Vasculature',
    color: [0, 255, 0],
    children: [
        {
            name: 'Pericytes',
            color: [255, 0, 0],
            set: ["cell_1", "cell_2", "cell_3"],
            _state: {
                key: 'vasculature-pericytes',
                level: 2,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        },
        {
            name: 'Endothelial',
            color: [100, 0, 0],
            set: ["cell_4", "cell_5", "cell_6"],
            _state: {
                key: 'vasculature-endothelial',
                level: 2,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: 'vasculature',
        level: 1,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const levelOneNodeIgnoreKeys = {
    name: 'Vasculature',
    color: [0, 255, 0],
    children: [
        {
            name: 'Pericytes',
            color: [255, 0, 0],
            set: ["cell_1", "cell_2", "cell_3"],
            _state: {
                key: expect.anything(),
                level: 2,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        },
        {
            name: 'Endothelial',
            color: [100, 0, 0],
            set: ["cell_4", "cell_5", "cell_6"],
            _state: {
                key: expect.anything(),
                level: 2,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: expect.anything(),
        level: 1,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const levelZeroNodeWithoutState = {
    name: 'Cell Type Annotations',
    children: [
        {
            name: 'Vasculature',
            color: [0, 255, 0],
            children: [
                {
                    name: 'Pericytes',
                    color: [255, 0, 0],
                    set: ["cell_1", "cell_2", "cell_3"],
                },
                {
                    name: 'Endothelial',
                    color: [100, 0, 0],
                    set: ["cell_4", "cell_5", "cell_6"],
                }
            ],
        }
    ],
};

export const levelZeroNode = {
    name: 'Cell Type Annotations',
    children: [
        {
            name: 'Vasculature',
            color: [0, 255, 0],
            children: [
                {
                    name: 'Pericytes',
                    color: [255, 0, 0],
                    set: ["cell_1", "cell_2", "cell_3"],
                    _state: {
                        key: 'vasculature-pericytes',
                        level: 2,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                },
                {
                    name: 'Endothelial',
                    color: [100, 0, 0],
                    set: ["cell_4", "cell_5", "cell_6"],
                    _state: {
                        key: 'vasculature-endothelial',
                        level: 2,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                }
            ],
            _state: {
                key: 'vasculature',
                level: 1,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: 'cell-type-annotations',
        level: 0,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const levelZeroNodeIgnoreKeys = {
    name: 'Cell Type Annotations',
    children: [
        {
            name: 'Vasculature',
            color: [0, 255, 0],
            children: [
                {
                    name: 'Pericytes',
                    color: [255, 0, 0],
                    set: ["cell_1", "cell_2", "cell_3"],
                    _state: {
                        key: expect.anything(),
                        level: 2,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                },
                {
                    name: 'Endothelial',
                    color: [100, 0, 0],
                    set: ["cell_4", "cell_5", "cell_6"],
                    _state: {
                        key: expect.anything(),
                        level: 2,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                }
            ],
            _state: {
                key: expect.anything(),
                level: 1,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: expect.anything(),
        level: 0,
        isEditing: false,
        isCurrent: false,
        isForTools: false,
    }
};

export const treeWithoutState = {
    version: "0.1.2",
    datatype: "cell",
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
                            set: ["cell_1", "cell_2", "cell_3"],
                        },
                        {
                            name: 'Endothelial',
                            color: [100, 0, 0],
                            set: ["cell_4", "cell_5", "cell_6"],
                        }
                    ],
                }
            ],
        }
    ]
};

export const treeWithoutStateOrColors = {
    version: "0.1.2",
    datatype: "cell",
    tree: [
        {
            name: 'Cell Type Annotations',
            children: [
                {
                    name: 'Vasculature',
                    children: [
                        {
                            name: 'Pericytes',
                            set: ["cell_1", "cell_2", "cell_3"],
                        },
                        {
                            name: 'Endothelial',
                            set: ["cell_4", "cell_5", "cell_6"],
                        }
                    ],
                }
            ],
        }
    ]
};

export const tree = {
    version: "0.1.2",
    datatype: "cell",
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
                            set: ["cell_1", "cell_2", "cell_3"],
                            _state: {
                                key: 'vasculature-pericytes',
                                level: 2,
                                isEditing: false,
                                isCurrent: false,
                                isForTools: false,
                            }
                        },
                        {
                            name: 'Endothelial',
                            color: [100, 0, 0],
                            set: ["cell_3", "cell_4", "cell_5"],
                            _state: {
                                key: 'vasculature-endothelial',
                                level: 2,
                                isEditing: false,
                                isCurrent: false,
                                isForTools: false,
                            }
                        }
                    ],
                    _state: {
                        key: 'vasculature',
                        level: 1,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                }
            ],
            _state: {
                key: 'cell-type-annotations',
                level: 0,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: 'my-tree',
        items: ["cell_1", "cell_2", "cell_3", "cell_4", "cell_5", "cell_6"],
        checkedKeys: [],
        visibleKeys: [],
        checkedLevel: { levelZeroKey: null, levelIndex: null },
        expandedKeys: [],
        autoExpandParent: true,
        isChecking: false,
    }
};

export const treeIgnoreKeys = {
    version: "0.1.2",
    datatype: "cell",
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
                            set: ["cell_1", "cell_2", "cell_3"],
                            _state: {
                                key: expect.anything(),
                                level: 2,
                                isEditing: false,
                                isCurrent: false,
                                isForTools: false,
                            }
                        },
                        {
                            name: 'Endothelial',
                            color: [100, 0, 0],
                            set: ["cell_4", "cell_5", "cell_6"],
                            _state: {
                                key: expect.anything(),
                                level: 2,
                                isEditing: false,
                                isCurrent: false,
                                isForTools: false,
                            }
                        }
                    ],
                    _state: {
                        key: expect.anything(),
                        level: 1,
                        isEditing: false,
                        isCurrent: false,
                        isForTools: false,
                    }
                }
            ],
            _state: {
                key: expect.anything(),
                level: 0,
                isEditing: false,
                isCurrent: false,
                isForTools: false,
            }
        }
    ],
    _state: {
        key: expect.anything(),
        items: [],
        checkedKeys: [],
        visibleKeys: [],
        checkedLevel: { levelZeroKey: null, levelIndex: null },
        expandedKeys: [],
        autoExpandParent: true,
        isChecking: false,
    }
};

export const emptyTreeWithoutState = {
    version: "0.1.2",
    datatype: "cell",
    tree: []
};

export const emptyTree = {
    version: "0.1.2",
    datatype: "cell",
    tree: [],
    _state: {
        key: 'empty-tree',
        items: [],
        checkedKeys: [],
        visibleKeys: [],
        checkedLevel: { levelZeroKey: null, levelIndex: null },
        expandedKeys: [],
        autoExpandParent: true,
        isChecking: false,
    }
};
export const emptyTreeIgnoreKeys = {
    version: "0.1.2",
    datatype: "cell",
    tree: [],
    _state: {
        key: expect.anything(),
        items: [],
        checkedKeys: [],
        visibleKeys: [],
        checkedLevel: { levelZeroKey: null, levelIndex: null },
        expandedKeys: [],
        autoExpandParent: true,
        isChecking: false,
    }
};