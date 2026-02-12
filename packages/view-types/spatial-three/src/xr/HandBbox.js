/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useXRInputSourceState } from '@react-three/xr';
import { useFrame, useThree } from '@react-three/fiber';

export function HandBbox() {
  const rightHand = useXRInputSourceState('hand', 'right');
  const leftHand = useXRInputSourceState('hand', 'left');
  const rightTipRef = useRef();
  const leftTipRef = useRef();
  const { gl } = useThree();

  useFrame((state, delta, frame) => {
    if (!frame || !gl.xr.isPresenting) return;
    const refSpace = gl.xr.getReferenceSpace();
    if (!refSpace) return;

    if (rightHand?.inputSource?.hand && rightTipRef.current) {
      const jointSpace = rightHand.inputSource.hand.get('index-finger-tip');
      if (jointSpace) {
        const pose = frame.getJointPose(jointSpace, refSpace);
        if (pose) {
          rightTipRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z,
          );
        }
      }
    }

    if (leftHand?.inputSource?.hand && leftTipRef.current) {
      const jointSpace = leftHand.inputSource.hand.get('index-finger-tip');
      if (jointSpace) {
        const pose = frame.getJointPose(jointSpace, refSpace);
        if (pose) {
          leftTipRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z,
          );
        }
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
