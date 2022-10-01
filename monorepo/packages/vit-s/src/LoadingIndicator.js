import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function LoadingIndicator() {
  return (
    <div className="loading-indicator-backdrop">
      <div className="loading-indicator-container">
        <CircularProgress />
      </div>
    </div>
  );
}
