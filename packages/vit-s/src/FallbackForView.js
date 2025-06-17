import React from 'react';
import { getDebugMode } from '@vitessce/globals';

// TODO: Improve styling - perhaps style similar to ./TitleInfo.js
// TODO: Display different info depending on the type of error

// Reference: https://github.com/bvaughn/react-error-boundary?tab=readme-ov-file#errorboundary-with-fallbackcomponent-prop
export function FallbackForView(props) {
  const {
    error,
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    // resetErrorBoundary,
  } = props;

  const styles = {
    color: 'red',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    overflowX: 'auto',
  };

  return (
    <div>
      <p>A view-level error occurred.</p>
      {getDebugMode() ? (
        <pre style={styles}>{error.message}</pre>
      ) : null}
    </div>
  );
}
