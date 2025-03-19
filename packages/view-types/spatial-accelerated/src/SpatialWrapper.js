import React, { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { SpatialAccelerated } from './SpatialAccelerated.js';


export const SpatialWrapper = forwardRef((props, canvasRef) => (
  <div style={{ width: '100%', height: '100%' }}>
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
        <SpatialAccelerated {...props} />
      </XR>
    </Canvas>
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      fontSize: '12px',
      color: 'white',
      background: 'rgba(0,0,0,0.5)',
      padding: '2px 6px',
      borderRadius: '4px',
      zIndex: 10,
      pointerEvents: 'none',
    }}
    >
      TODO: Add HUD
    </div>

  </div>
));
