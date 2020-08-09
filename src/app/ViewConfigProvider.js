import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import rootReducer from './redux/reducers';

const store = configureStore({
  reducer: rootReducer,
});

/**
 * Provider of the view config store,
 * containing reducer for dataset definitions, coordination space,
 * and layout.
 * @param {object} params
 * @param {React.Children} params.children Child component consumers of
 * the store.
 */
export default function ViewConfigProvider({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
