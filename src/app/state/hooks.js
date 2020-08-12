/* eslint-disable */
import create from 'zustand';
import shallow from 'zustand/shallow';
import { fromEntries, capitalize } from '../../utils';

export const useStore = create(set => ({
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
}))[0];

export function useCoordination(parameters, coordinationScopes) {
    const setCoordinationValue = useStore(state => state.setCoordinationValue);
  
    const values = useStore((state) => {
      const { coordinationSpace } = state.viewConfig;
      return fromEntries(parameters.map((parameter) => {
        if (coordinationSpace && coordinationSpace[parameter]) {
          const value = coordinationSpace[parameter][coordinationScopes[parameter]];
          return [parameter, value];
        }
        return [parameter, undefined];
      }));
    }, shallow);
  
    const setters = fromEntries(parameters.map((parameter) => {
      const setterName = `set${capitalize(parameter)}`;
      const setterFunc = value => setCoordinationValue({
        parameter,
        scope: coordinationScopes[parameter],
        value,
      });
      return [setterName, setterFunc];
    }));
  
    return [values, setters];
}