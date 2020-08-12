/* eslint-disable */
import create from 'zustand';

const [useStore] = create(set => ({
    viewConfig: null,
    setViewConfig: (viewConfig) => set({ viewConfig }),
    setCoordinationValue: ({ parameter, scope, value }) => set(state => ({
        viewConfig: {
            ...state.viewConfig,
            coordinationSpace: {
                ...state.viewConfig.coordinationSpace,
                [parameter]: {
                    ...state.viewConfig.coordinationSpace[parameter],
                    [scope]: value,
                }
            }
        }
    })),
    setComponentCoordinationScope: ({ componentUid, parameter, scope }) => set(state => ({
        viewConfig: {
            ...state.viewConfig,
            layout: [
                ...state.viewConfig.layout,
                // TODO
            ]
        },
    })),
}));

export default useStore;