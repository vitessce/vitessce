/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';

export const viewConfigSlice = createSlice({
    name: 'viewConfig',
    initialState: null,
    reducers: {
        setViewConfig: (state, action) => action.payload,
        setCoordinationValue: (state, action) => {
            const { parameter, scope, value } = action.payload;
            return {
                ...state,
                coordinationSpace: {
                    ...state.coordinationSpace,
                    [parameter]: {
                        ...state.coordinationSpace[parameter],
                        [scope]: value,
                    }
                }
            };
        },
        setComponentCoordinationScope: (state, action) => {
            const { componentUid, parameter, scope } = action.payload;
            return {
                ...state,
                layout: [
                    ...state.layout,
                    // TODO
                ]
            }
        }
    },
});