import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FallbackForVitS } from './FallbackForVitS.js';
import { VitS } from './VitS.js';

/**
 * This serves as a way to wrap VitS in a React ErrorBoundary.
 * Since there is a lot of logic within the VitS component,
 * we want the ErrorBoundary to be a parent (as opposed to a child)
 * of the VitS component.
 * @param {*} props All props will be passed down to VitS.
 */
export function VitSContainer(props) {
  return (
    <ErrorBoundary FallbackComponent={FallbackForVitS}>
      <VitS {...props} />
    </ErrorBoundary>
  );
}
