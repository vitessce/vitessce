import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { VolumeView } from './VolumeView.js';

export const SpatialWrapper = forwardRef((props, canvasRef) => {
  // const [renderingStats, setRenderingStats] = useState({ fps: 0 });
  const [zarrStoreInfo, setZarrStoreInfo] = useState(null);
  const [deviceLimits, setDeviceLimits] = useState(null);
  const volumeViewRef = useRef(null);

  // Handle initialization completion from VolumeView
  const handleInitComplete = (initData) => {
    if (initData.zarrStoreInfo) {
      setZarrStoreInfo(initData.zarrStoreInfo);
    }
    if (initData.deviceLimits) {
      setDeviceLimits(initData.deviceLimits);
    }
  };

  return (
    <>
      <Canvas
        frameloop="always"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: 0,
          margin: 0,
          // backgroundColor: 'white',
        }}
        camera={{
          fov: 50,
          up: [0, 1, 0],
          position: [0, 0, 4],
          near: 0.01,
          far: 15,
        }}
        gl={{
          antialias: true,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: false,
          autoClear: false,
        }}
        ref={canvasRef}
      >
        <VolumeView
          {...props}
          forwardRef={volumeViewRef}
          onInitComplete={handleInitComplete}
        />
      </Canvas>
    </>
  );
});
