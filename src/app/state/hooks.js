import create from 'zustand';
import shallow from 'zustand/shallow';
import { fromEntries, capitalize } from '../../utils';

/**
 * The useStore hook here is initialized via the zustand
 * create() function, which sets up both the state variables
 * and the reducer-type functions.
 * Reference: https://github.com/react-spring/zustand
 * @returns {function} The useStore hook.
 */
export const useStore = create(set => ({
  // State:
  // The viewConfig is an object which must conform to the schema
  // found in src/schemas/config.schema.json.
  viewConfig: null,
  // The loaders object is a mapping from dataset ID to
  // data type to loader object instance.
  loaders: null,
  // Components may need to know if they are the "hover source"
  // for tooltip interactions. This value should be a unique
  // component ID, such as its index in the view config layout.
  componentHover: null,
  // Reducer functions which update the state
  // (although technically also part of state):
  setViewConfig: viewConfig => set({ viewConfig }),
  setLoaders: loaders => set({ loaders }),
  setComponentHover: componentHover => set({ componentHover }),
  setCoordinationValue: ({ parameter, scope, value }) => set(state => ({
    viewConfig: {
      ...state.viewConfig,
      coordinationSpace: {
        ...state.viewConfig.coordinationSpace,
        [parameter]: {
          ...state.viewConfig.coordinationSpace[parameter],
          [scope]: value,
        },
      },
    },
  })),
}));

/**
 * The useCoordination hook returns both the
 * values and setter functions for the coordination objects
 * in a particular coordination scope mapping.
 * This hook is intended to be used within the ___Subscriber
 * components to allow them to "hook into" only those coordination
 * objects and setter functions of relevance.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
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

/**
 * Obtain the loaders object from
 * the global app state.
 * @returns {object} The loaders object.
 * in the `useStore` store.
 */
export function useLoaders() {
  return useStore(state => state.loaders);
}


export function useComponentHover() {
  return useStore(state => state.componentHover);
}


export function useSetComponentHover() {
  return useStore(state => state.setComponentHover);
}
