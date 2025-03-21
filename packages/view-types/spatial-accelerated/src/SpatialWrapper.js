import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { VolumeView } from './VolumeView.js';
import { VolumeHUD } from './VolumeHUD.js';

export const SpatialWrapper = forwardRef((props, canvasRef) => {
  const [renderingStats, setRenderingStats] = useState({ fps: 0 });
  const [zarrStoreInfo, setZarrStoreInfo] = useState(null);
  const [deviceLimits, setDeviceLimits] = useState(null);
  const volumeViewRef = useRef(null);

  // Example of updating stats - in a real app, you might get this from
  // a performance monitor or pass it up from the VolumeRenderer
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderingStats({
        fps: Math.round(Math.random() * 30) + 30, // Fake FPS data
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      <VolumeHUD
        volumeInfo={{ dimensions: [0, 0, 0] }}
        renderingMode="PLACEHOLDER"
        renderingStats={renderingStats}
        zarrStoreInfo={zarrStoreInfo}
        deviceLimits={deviceLimits}
      />
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: 0,
          margin: 0,
        }}
        camera={{
          fov: 50,
          up: [0, 1, 0],
          position: [0, 0, 800],
          near: 0.1,
          far: 3000,
        }}
        gl={{
          antialias: true,
          logarithmicDepthBuffer: false,
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
