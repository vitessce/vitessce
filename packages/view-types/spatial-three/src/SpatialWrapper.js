import React, { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XRButton, XR } from '@react-three/xr';
import { SpatialThree } from './SpatialThree.js';


export const SpatialWrapper = forwardRef((props, canvasRef) => (
  <div style={{ width: '100%', height: '100%' }}>
    <XRButton
      mode="AR"
      sessionInit={{ optionalFeatures: ['hand-tracking'] }}
      style={{
        border: 'none',
        background: 'rgba(0, 0, 0, 0.0)',
        zIndex: 1,
        position: 'absolute',
      }}
    >
      {status => (status !== 'unsupported' ? (
        <div style={{
          border: '1px solid white',
          padding: '12px 24px',
          borderRadius: '4px',
          background: 'rgba(0, 0, 0, 0.1)',
          color: 'white',
          font: 'normal 0.8125rem sans-serif',
          outline: 'none',
          cursor: 'pointer',
        }}
        >{(status === 'entered' ? 'Exit AR' : 'Enter AR')}
        </div>
      ) : null)}
    </XRButton>
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0 }}
      camera={{
        fov: 50,
        up: [0, 1, 0],
        position: [0, 0, 800],
        near: 0.1,
        far: 3000,
      }}
      gl={{ antialias: true, logarithmicDepthBuffer: false }}
      ref={canvasRef}
    >
      <XR>
        <SpatialThree {...props} />
      </XR>
    </Canvas>
  </div>
));
