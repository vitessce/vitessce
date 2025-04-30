import React from 'react';

// TODO: Improve styling - see ./DebugWindow.js
// TODO: Display different info depending on the type of error

// Reference: https://github.com/bvaughn/react-error-boundary?tab=readme-ov-file#errorboundary-with-fallbackcomponent-prop
export function FallbackForVitS(props) {
  const {
    error,
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    // resetErrorBoundary,
  } = props;


  return (
    <div>
      <p>Error:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}
