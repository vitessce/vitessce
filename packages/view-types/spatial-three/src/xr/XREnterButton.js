import React, { useState, useEffect } from 'react';
import { xrStore } from './xrStore.js';

export default function XREnterButton() {
  const [supported, setSupported] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setSupported);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = xrStore.subscribe((state) => {
      setEntered(state.session != null);
    });
    return unsubscribe;
  }, []);

  if (!supported) return null;

  const handleClick = () => {
    if (entered) {
      const { session } = xrStore.getState();
      if (session) session.end();
    } else {
      xrStore.enterAR({ optionalFeatures: ['hand-tracking'] });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        border: '1px solid white',
        padding: '12px 24px',
        borderRadius: '4px',
        background: 'rgba(0, 0, 0, 0.1)',
        color: 'white',
        font: 'normal 0.8125rem sans-serif',
        outline: 'none',
        cursor: 'pointer',
        zIndex: 1,
        position: 'absolute',
      }}
    >
      {entered ? 'Exit AR' : 'Enter AR'}
    </button>
  );
}
