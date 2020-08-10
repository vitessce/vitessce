import { fromEntries, capitalize } from '../../utils';
import { viewConfigSlice } from './slices';

const { setCoordinationValue } = viewConfigSlice.actions;

export function createCoordinationMappers(parameters) {
  const mapStateToProps = (state, ownProps) => {
    const { coordinationSpace } = state.viewConfig;
    const { coordinationScopes } = ownProps;
    return fromEntries(parameters.map((parameter) => {
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][coordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  };
  const mapDispatchToProps = (dispatch, ownProps) => {
    const { coordinationScopes } = ownProps;
    return fromEntries(parameters.map((parameter) => {
      const setterName = `set${capitalize(parameter)}`;
      const setterFunc = value => dispatch(setCoordinationValue({
        parameter,
        scope: coordinationScopes[parameter],
        value,
      }));
      return [setterName, setterFunc];
    }));
  };
  return [mapStateToProps, mapDispatchToProps];
}
