import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';

// Modifies the auto-rendered hand model materials to make fingertips semi-transparent.
// In xr v6, hands are auto-rendered. We traverse the scene to find hand meshes.
export function HandDecorate() {
  const session = useXR(state => state.session);
  const { scene } = useThree();

  useFrame(() => {
    if (!session) return;
    // Traverse scene to find hand meshes and modify their material
    scene.traverse((child) => {
      if (child.isMesh && child.material && child.userData?.xpiHand) {
        // eslint-disable-next-line no-param-reassign
        child.material.transparent = true;
        // eslint-disable-next-line no-param-reassign
        child.material.opacity = 0.5;
      }
    });
  });

  return null;
}
