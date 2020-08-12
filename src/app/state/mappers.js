import shallow from 'zustand/shallow';
import { fromEntries, capitalize } from '../../utils';
import useStore from './store';

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
