/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import type { Mesh } from 'three';
import { useXRInputSourceState } from '@react-three/xr';
import { useFrame, useThree } from '@react-three/fiber';

// XRHand is typed as Map<number, XRJointSpace> in TS lib, but the WebXR spec
// and runtime use string joint names. This helper casts for string-keyed access.
function getHandJoint(hand: XRHand, jointName: string): XRJointSpace | undefined {
  return (hand as unknown as ReadonlyMap<string, XRJointSpace>).get(jointName);
}

export function HandBbox() {
  const rightHand = useXRInputSourceState('hand', 'right');
  const leftHand = useXRInputSourceState('hand', 'left');
  const rightTipRef = useRef<Mesh>(null);
  const leftTipRef = useRef<Mesh>(null);
  const { gl } = useThree();

  useFrame((_state, _delta, frame) => {
    if (!frame || !gl.xr.isPresenting) return;
    const refSpace = gl.xr.getReferenceSpace();
    if (!refSpace) return;

    if (rightHand?.inputSource?.hand && rightTipRef.current) {
      const jointSpace = getHandJoint(rightHand.inputSource.hand, 'index-finger-tip');
      if (jointSpace) {
        const pose = (frame as XRFrame).getJointPose?.(jointSpace, refSpace);
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
      const jointSpace = getHandJoint(leftHand.inputSource.hand, 'index-finger-tip');
      if (jointSpace) {
        const pose = (frame as XRFrame).getJointPose?.(jointSpace, refSpace);
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
