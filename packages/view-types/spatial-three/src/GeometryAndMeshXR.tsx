/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { useRef, useState } from 'react';
import type { Group, Scene } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Bvh } from '@react-three/drei';
import { useXR, useXRInputSourceState } from '@react-three/xr';
import { FrontSide, Vector3, Box3 } from 'three';
import { MeasureLine } from './xr/MeasureLine.js';
import type { GeometryAndMeshProps, MeasureLineData, ClickEvent, PointerOverEvent } from './types.js';
import { isValidGeometrySize, stringifyLineData } from './three-utils.js';

// XRHand is typed as Map<number, XRJointSpace> in TS lib, but the WebXR spec
// and runtime use string joint names. This helper casts for string-keyed access.
function getHandJoint(hand: XRHand, jointName: string): XRJointSpace | undefined {
  return (hand as unknown as ReadonlyMap<string, XRJointSpace>).get(jointName);
}

/**
 * Helper to get a hand joint's world position from an XRFrame.
 * Returns null if position is not available.
 */
function getJointPosition(hand: { inputSource: { hand: XRHand } } | null | undefined, jointName: string, frame: XRFrame, refSpace: XRReferenceSpace): Vector3 | null {
  if (!hand?.inputSource?.hand) return null;
  const jointSpace = getHandJoint(hand.inputSource.hand, jointName);
  if (!jointSpace) return null;
  const pose = frame.getJointPose?.(jointSpace, refSpace);
  if (!pose) return null;
  return new Vector3(
    pose.transform.position.x,
    pose.transform.position.y,
    pose.transform.position.z,
  );
}

/**
 * Detect pinch by measuring distance between thumb-tip and index-finger-tip.
 */
function isPinching(hand: { inputSource: { hand: XRHand } } | null | undefined, frame: XRFrame, refSpace: XRReferenceSpace, threshold = 0.02): boolean {
  const thumbPos = getJointPosition(hand, 'thumb-tip', frame, refSpace);
  const indexPos = getJointPosition(hand, 'index-finger-tip', frame, refSpace);
  if (!thumbPos || !indexPos) return false;
  return thumbPos.distanceTo(indexPos) < threshold;
}

// XR-aware version of GeometryAndMesh.
// Handles both XR and non-XR rendering based on session state.
export default function GeometryAndMeshXR(props: GeometryAndMeshProps) {
  const {
    segmentationGroup, segmentationSettings, segmentationSceneScale,
    renderingSettings, materialRef, highlightEntity, setObsHighlight,
  } = props;
  const model = useRef<Scene>(null);
  const distanceRef = useRef<Group>(null);
  const rayGrabGroup = useRef<Group>(null);
  const grabControllerRef = useRef<number | null>(null);
  const previousTransform = useRef<unknown>(null);

  // XR state via v6 API
  const session = useXR(state => state.session);
  const isPresenting = session != null;

  const { scene, gl } = useThree();
  const rightHand = useXRInputSourceState('hand', 'right');
  const leftHand = useXRInputSourceState('hand', 'left');

  const [measureState, setMeasureState] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [currentLine, setCurrentLine] = useState<MeasureLineData>({
    startPoint: new Vector3(),
    midPoint: new Vector3(),
    endPoint: new Vector3(),
    setStartPoint: false,
    setEndPoint: false,
  });
  const [lines, setLines] = useState<MeasureLineData[]>([]);
  const [debounce, setDebounce] = useState(0);

  // XR per-frame hand interaction logic
  useFrame((_state, _delta, frame) => {
    if (!isPresenting || !frame) return;
    const refSpace = gl.xr.getReferenceSpace();
    if (!refSpace) return;

    const rightTipBbox = scene.getObjectByName('rightTipBbox');
    const leftTipBbox = scene.getObjectByName('leftTipBbox');
    if (!rightTipBbox || !leftTipBbox) return;

    const leftTipBB = new Box3().setFromObject(leftTipBbox);
    const rightTipBB = new Box3().setFromObject(rightTipBbox);
    let intersected = false;
    setDebounce(debounce - 1.0);

    if (leftTipBB.intersectsBox(rightTipBB) && leftTipBB.max.x !== -rightTipBB.min.x) {
      setMeasureState(true);
      setShowLine(true);
      setCurrentLine({
        startPoint: new Vector3(),
        midPoint: new Vector3(),
        endPoint: new Vector3(),
        setStartPoint: false,
        setEndPoint: false,
      });
    }

    if (measureState) {
      let leftFingerPosition = getJointPosition(leftHand, 'index-finger-tip', frame, refSpace);
      let rightFingerPosition = getJointPosition(rightHand, 'index-finger-tip', frame, refSpace);
      if (!leftFingerPosition || !rightFingerPosition) return;

      if (rayGrabGroup.current) {
        leftFingerPosition = leftFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
        rightFingerPosition = rightFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
      }

      let currentStart = leftFingerPosition.clone();
      let currentEnd = rightFingerPosition.clone();
      if (currentLine.setStartPoint) {
        currentStart = currentLine.startPoint;
      }
      if (currentLine.setEndPoint) {
        currentEnd = currentLine.endPoint;
      }

      setCurrentLine({
        startPoint: currentStart,
        midPoint: new Vector3().addVectors(currentStart, currentEnd).multiplyScalar(0.5),
        endPoint: currentEnd,
        setStartPoint: currentLine.setStartPoint,
        setEndPoint: currentLine.setEndPoint,
      });

      // Right hand pinch sets end point
      if (isPinching(rightHand, frame, refSpace)) {
        setCurrentLine({
          startPoint: currentLine.startPoint,
          midPoint: currentLine.midPoint,
          endPoint: currentLine.endPoint,
          setStartPoint: currentLine.setStartPoint,
          setEndPoint: true,
        });
      }
      // Left hand pinch sets start point
      if (isPinching(leftHand, frame, refSpace)) {
        setCurrentLine({
          startPoint: currentLine.startPoint,
          midPoint: currentLine.midPoint,
          endPoint: currentLine.endPoint,
          setStartPoint: true,
          setEndPoint: currentLine.setEndPoint,
        });
      }

      if (currentLine.setStartPoint && currentLine.setEndPoint) {
        lines.push(currentLine);
        setLines(lines);
        setShowLine(false);
        setMeasureState(false);
        setDebounce(8);
      }
    } else if (debounce <= 0 && model.current && isPresenting) {
      const modelScene = model.current;
      modelScene.children[0].children.forEach((_childVal, childID) => {
        const child = modelScene.children[0].children[childID];
        const currentObjectBB = new Box3().setFromObject(child);
        const intersectsLeftTip = leftTipBB.intersectsBox(currentObjectBB);
        const intersectsRightTip = rightTipBB.intersectsBox(currentObjectBB);
        if (intersectsLeftTip || intersectsRightTip) {
          intersected = true;
          setObsHighlight(child.name);
          setHighlighted(true);
          if (intersectsLeftTip && isPinching(leftHand, frame, refSpace)) {
            setDebounce(10);
            intersected = false;
          }
          if (intersectsRightTip && isPinching(rightHand, frame, refSpace)) {
            setDebounce(10);
            intersected = false;
          }
        }
      });
      if (!intersected && highlighted) {
        setObsHighlight(null);
        setHighlighted(false);
      }
    }
  });

  // Native v6 grab interaction: track pointer capture on the group
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isPresenting) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    grabControllerRef.current = e.pointerId;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (grabControllerRef.current === e.pointerId) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      grabControllerRef.current = null;
      previousTransform.current = null;
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (grabControllerRef.current !== e.pointerId || !rayGrabGroup.current) return;
    // Move the group to follow the pointer
    if (e.point) {
      rayGrabGroup.current.position.copy(e.point);
    }
  };

  // XR path
  if (isPresenting) {
    return (
      <group>
        <group
          ref={rayGrabGroup}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        >
          {segmentationGroup?.visible ? (
            <group>
              <hemisphereLight color={0x808080} groundColor={0x606060} />
              <directionalLight color={0xFFFFFF} position={[0, -800, 0]} />
              <primitive
                ref={model}
                object={segmentationGroup}
                position={[-0.18, 1.13, -1]}
                scale={[0.002 * segmentationSceneScale[0],
                  0.002 * segmentationSceneScale[1],
                  0.002 * segmentationSceneScale[2]]}
              />
            </group>
          ) : null}
          {renderingSettings.uniforms && renderingSettings.shader && renderingSettings.meshScale ? (
            <group>
              <mesh
                name="cube"
                position={[-0.18, 1.13, -1]}
                rotation={[0, 0, 0]}
                scale={[0.002 * renderingSettings.meshScale[0],
                  0.002 * renderingSettings.meshScale[1],
                  0.002 * renderingSettings.meshScale[2]]}
                ref={materialRef}
              >
                {isValidGeometrySize(renderingSettings.geometrySize) && <boxGeometry args={renderingSettings.geometrySize} />}
                <shaderMaterial
                  customProgramCacheKey={() => '1'}
                  side={FrontSide}
                  uniforms={renderingSettings.uniforms}
                  needsUpdate
                  transparent
                  vertexShader={renderingSettings.shader.vertexShader}
                  fragmentShader={renderingSettings.shader.fragmentShader}
                />
              </mesh>
            </group>
          ) : null}
        </group>
        <group name="currentLine" ref={distanceRef}>
          {showLine ? (
            <MeasureLine currentLine={currentLine} scale={(1 / 0.002) * 0.4} />
          ) : null}
        </group>
        <group name="lines">
          {lines.map(object => <MeasureLine key={stringifyLineData(object)} currentLine={object} scale={(1 / 0.002) * 0.4} />)}
        </group>
      </group>
    );
  }

  // Non-XR path (same as GeometryAndMesh)
  return (
    <group>
      <group>
        {segmentationGroup?.visible ? (
          <group>
            <hemisphereLight color={0x808080} groundColor={0x606060} />
            <directionalLight color={0xFFFFFF} position={[0, -800, 0]} />
            <directionalLight color={0xFFFFFF} position={[0, 800, 0]} />
            <Bvh firstHitOnly>
              <primitive
                ref={model}
                object={segmentationGroup}
                position={[0, 0, 0]}
                onClick={(e: ClickEvent) => {
                  if (e.object.parent?.userData.name === 'finalPass') {
                    highlightEntity(e.object.name, e.object.userData.layerScope, e.object.userData.channelScope);
                  }
                }}
                onPointerOver={(e: PointerOverEvent) => {
                  setObsHighlight(e.object.name);
                }}
                onPointerOut={() => setObsHighlight(null)}
              />
            </Bvh>
          </group>
        ) : null}
        {(renderingSettings.uniforms && renderingSettings.shader && renderingSettings.meshScale && renderingSettings.geometrySize) ? (
          <group>
            <mesh scale={renderingSettings.meshScale} ref={materialRef}>
              <boxGeometry args={renderingSettings.geometrySize} />
              <shaderMaterial
                customProgramCacheKey={() => '1'}
                side={FrontSide}
                uniforms={renderingSettings.uniforms}
                needsUpdate
                transparent
                vertexShader={renderingSettings.shader.vertexShader}
                fragmentShader={renderingSettings.shader.fragmentShader}
              />
            </mesh>
          </group>
        ) : null}
      </group>
      <group name="lines">
        {lines.map(object => <MeasureLine key={stringifyLineData(object)} currentLine={object} scale={1} />)}
      </group>
    </group>
  );
}
