import React from 'react';
import { CircularProgress } from '@mui/material';
import { css } from '@mui/material-pigment-css';

const loadingIndicatorBackdrop = css({
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: '1040',
  width: '100%',
  height: '100%',
  borderRadius: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

const loadingIndicatorContainer = css({
  display: 'grid',
  placeItems: 'center',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const visuallyHidden = css({
  position: 'absolute',
  height: '1px',
  width: '1px',
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)',
  whiteSpace: 'nowrap',
});


export default function LoadingIndicator() {
  return (
    <div className={loadingIndicatorBackdrop}>
      <div className={loadingIndicatorContainer} role="status" aria-live="polite">
        <CircularProgress />
        <span className={visuallyHidden}>Loading...</span>
      </div>
    </div>
  );
}
