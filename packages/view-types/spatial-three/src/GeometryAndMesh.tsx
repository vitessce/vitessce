/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState } from 'react';
import { Bvh } from '@react-three/drei';
import { FrontSide } from 'three';
import { MeasureLine } from './xr/MeasureLine.js';
import type { GeometryAndMeshProps, MeasureLineData, ClickEvent, PointerOverEvent } from './types.js';
import { stringifyLineData } from './three-utils.js';

// Non-XR rendering of a volume dataset and segmentations (meshes).
export function GeometryAndMesh(props: GeometryAndMeshProps) {
  const {
    segmentationGroup, segmentationSettings, segmentationSceneScale,
    renderingSettings, materialRef, highlightEntity, setObsHighlight,
  } = props;
  const model = useRef(null);
  const [lines] = useState<MeasureLineData[]>([]);

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
