import React, { Suspense } from 'react';
// Note: need to be careful about versions of RTF, Three, React, and React DOM in package.json
// to avoid multiple copies of RTF, since the Canvas depends on a React Context.
// Otherwise you may see errors such as "useThree can only be used inside the Canvas component!".
import { Canvas } from '@react-three/fiber';
import { VolumeView } from './VolumeView.js';

export function SpatialWrapper(props) {
  // const [renderingStats, setRenderingStats] = useState({ fps: 0 });
  // const [zarrStoreInfo, setZarrStoreInfo] = useState(null);
  // const [deviceLimits, setDeviceLimits] = useState(null);
  // const volumeViewRef = useRef(null);

  // Handle initialization completion from VolumeView
  /*
  const handleInitComplete = (initData) => {
    if (initData.zarrStoreInfo) {
      setZarrStoreInfo(initData.zarrStoreInfo);
    }
    if (initData.deviceLimits) {
      setDeviceLimits(initData.deviceLimits);
    }
  };
  */

  return (
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
    >
      <Suspense fallback="Initializing Volume View...">
        <VolumeView
          {...props}
        />
      </Suspense>
    </Canvas>
  );
}
