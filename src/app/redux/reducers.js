import { combineReducers } from 'redux';
import { viewConfigSlice } from './slices';

export default combineReducers({
  viewConfig: viewConfigSlice.reducer,
});
