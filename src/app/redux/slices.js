/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';

export const viewConfigSlice = createSlice({
    name: 'viewConfig',
    initialState: null,
    reducers: {
        setViewConfig: (state, action) => action.payload,
        updateCoordinationValue: (state, action) => {
            const { parameter, scope, value } = action.payload;
            return {
                ...state,
                coordinationSpace: {
                    ...state.coordinationSpace,
                    [parameter]: (scope === 'global' ? {
                        global: value,
                        local: state.coordinationSpace[parameter].local,
                    } : {
                        global: state.coordinationSpace[parameter].global,
                        local: {
                            ...state.coordinationSpace[parameter].local,
                            [scope]: value,
                        }
                    })
                }
            };
        },
        updateComponentCoordinationScope: (state, action) => {
            const { componentUid, parameter, scope } = action.payload;
            return {
                ...state,
                layout: {
                    ...state.layout,
                    // TODO
                }
            }
        }
    },
});