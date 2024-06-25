/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

export const AsyncFunctionsContext = createContext({
  // This will be an object where keys are function types
  // (as strings) and values are the async functions.
});

export function useAsyncFunction(functionType) {
  const context = useContext(AsyncFunctionsContext);
  return context?.[functionType];
}

export const PageModeViewContext = createContext({
  // Keys are view UIDs and values are
  // the corresponding React components.
});

export function usePageModeView(uid) {
  const context = useContext(PageModeViewContext);
  return context?.[uid];
}
