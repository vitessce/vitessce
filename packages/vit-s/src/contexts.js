/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

export const AsyncFunctionsContext = createContext({
  // {
  //   asyncFunctions: { [functionType: string]: asyncFunction },
  //   queryClient: QueryClient from react-query
  // }
  // asyncFunctions will be an object where keys are function types
  // (as strings) and values are the async functions.
});

export function useAsyncFunction(functionType) {
  const context = useContext(AsyncFunctionsContext);
  const origFunction = context?.asyncFunctions?.[functionType];
  const queryClient = context?.queryClient;
  // We use partial function application here, so that the caller
  // does not need to worry about passing in the queryClient.
  const partialFunction = (...args) => origFunction({ queryClient }, ...args);
  return partialFunction;
}

export const PageModeViewContext = createContext({
  // Keys are view UIDs and values are
  // the corresponding React components.
});

function ensureComponent(component) {
  if (!component) {
    return () => null;
  }
  return component;
}

export function usePageModeView(uid) {
  const context = useContext(PageModeViewContext);
  // TODO: Is there any case where we would want to
  // throw an error instead?
  return ensureComponent(context?.[uid]);
}
