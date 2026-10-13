import React, { Suspense, useMemo } from 'react';
// Note: need to be careful about versions of RTF, Three, React, and React DOM in package.json
// to avoid multiple copies of RTF, since the Canvas depends on a React Context.
// Otherwise you may see errors such as "useThree can only be used inside the Canvas component!".
import { Canvas } from '@react-three/fiber';
import { VolumeView } from './VolumeView.js';
import { viewStateToCamera } from './camera-utils.js';

const DEFAULT_CAMERA_POSITION = [0, 0, 4];

export function SpatialWrapper(props) {
  const { theme, viewState, ...restProps } = props;
  // const [renderingStats, setRenderingStats] = useState({ fps: 0 });
  // const [zarrStoreInfo, setZarrStoreInfo] = useState(null);
  // const [deviceLimits, setDeviceLimits] = useState(null);
  // const volumeViewRef = useRef(null);

  const initialCameraPosition = useMemo(() => {
    if (viewState?.zoom != null) {
      const { position } = viewStateToCamera(viewState);
      return position;
    }
    return DEFAULT_CAMERA_POSITION;
  // Only compute once on mount; runtime updates are handled by VolumeView.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        backgroundColor: theme === 'dark' ? 'black' : 'white',
      }}
      camera={{
        fov: 50,
        up: [0, 1, 0],
        position: initialCameraPosition,
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
