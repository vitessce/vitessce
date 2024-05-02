/* eslint-disable react/no-unknown-property */
import { useXR } from '@react-three/xr';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function HandBbox() {
  const { controllers } = useXR();
  const rightTipRef = useRef();
  const leftTipRef = useRef();

  useFrame(() => {
    if (controllers && controllers[0] && controllers[1]) {
      if (controllers[0].controller) {
        const rightTipPosition = controllers[0].hand.joints['index-finger-tip'].position;
        rightTipRef.current.position.copy(rightTipPosition);
      }
      if (controllers[1].controller) {
        const leftTipPosition = controllers[1].hand.joints['index-finger-tip'].position;
        leftTipRef.current.position.copy(leftTipPosition);
      }
    }
  });

  return (
    <>
      <mesh name="leftTipBbox" ref={leftTipRef}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="blue" transparent opacity={0} />
      </mesh>
      <mesh name="rightTipBbox" ref={rightTipRef}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="orange" transparent opacity={0} />
      </mesh>
    </>
  );
}
