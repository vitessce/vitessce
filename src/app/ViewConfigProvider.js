/* eslint-disable */
import React from 'react'
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import rootReducer from './redux/reducers';

const store = configureStore({
  reducer: rootReducer,
});

export default function ViewConfigProvider({ children }) {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}