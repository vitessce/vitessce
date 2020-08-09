import { fromEntries, capitalize } from '../../utils';
import { viewConfigSlice } from './slices';

const { setCoordinationValue } = viewConfigSlice.actions;

export function createCoordinationMappers(stateParams, dispatchParams) {
  const mapStateToProps = (state, ownProps) => {
    const { coordinationSpace } = state.viewConfig || {};
    const { coordination } = ownProps;
    return fromEntries(stateParams.map((parameter) => {
      const value = coordinationSpace[parameter][coordination[parameter]];
      return [parameter, value];
    }));
  };
  const mapDispatchToProps = (dispatch, ownProps) => {
    const { coordination } = ownProps;

    return fromEntries(dispatchParams.map((parameter) => {
      const setterName = `set${capitalize(parameter)}`;
      const setterFunc = value => dispatch(setCoordinationValue({
        parameter,
        scope: coordination[parameter],
        value,
      }));
      return [setterName, setterFunc];
    }));
  };
  return [mapStateToProps, mapDispatchToProps];
}
