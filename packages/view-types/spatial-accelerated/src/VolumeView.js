/**
 * VolumeView.js ‑ single‑pass MRT renderer
 *
 *  ▸ One geometry pass per frame               (gl.draw* called once)
 *  ▸ Writes three colour‑attachments in that pass
 *  ▸ Blits attachment 0 to the default FB
 *  ▸ Optionally reads attachment 1 & 2 on an interval
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WebGLMultipleRenderTargets } from 'three';

import { VolumeDataManager } from './VolumeDataManager.js';
import { VolumeRenderManager } from './VolumeRenderManager.js';

function log(msg) {
  /* console.warn(`V ${msg}`); */
}

export function VolumeView(props) {
  /* ---------- r3f handles ------------------------------------------------- */
  const { gl, scene, camera } = useThree(); // grab once – never changes

  /* ---------- refs / state ------------------------------------------------ */
  const orbitRef = useRef(null);
  const meshRef = useRef(null);
  const bufU32 = useRef(null);
  const bufU16 = useRef(null);
  const frameRef = useRef(0);
  const [processingRT, setRT] = useState(null);

  const [managers, setManagers] = useState(null); // {dataManager, renderManager}
  const [renderState, setRenderState] = useState({ uniforms: null,
    shader: null,
    meshScale: [1, 1, 1],
    geometrySize: [1, 1, 1] });
  const [lastRes, setLastRes] = useState(null);
  const [lastChannels, setLastChannels] = useState([]);
  const [is3D, setIs3D] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new refs for screen quad setup
  const screenSceneRef = useRef(null);
  const screenCameraRef = useRef(null);
  const screenQuadRef = useRef(null);

  /* ---------- helpers ----------------------------------------------------- */
  const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  /* ---------- initialise managers ---------------------------------------- */
  useEffect(() => {
    (async () => {
      const dm = new VolumeDataManager(
        'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/',
        gl.getContext?.() || gl,
        gl,
      );
      const rm = new VolumeRenderManager();
      await dm.init(); // device limits, zarr meta …

      setManagers({ dataManager: dm, renderManager: rm });
      if (props.onInitComplete) {
        props.onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      }
    })();

    return () => managers?.dataManager.clearCache();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => { gl.autoClear = false; }, [gl]);

  /* ---------- react to prop changes -------------------------------------- */
  const extractSettings = useCallback(() => {
    if (!managers) return null;
    const ok = managers.renderManager.updateFromProps(props);
    return ok ? managers.renderManager.extractRenderingSettingsFromProps(props) : null;
  }, [props, managers]);

  const loadIfNeeded = useCallback(async (settings) => {
    if (!settings || !managers) return;

    const resolutionChanged = settings.resolution !== lastRes;
    const channelsChanged = !sameArray(settings.channelTargetC, lastChannels);

    if (!resolutionChanged && !channelsChanged) {
      const s = managers.renderManager.updateRendering(managers.dataManager);
      if (s) setRenderState(s);
      return;
    }

    setLoading(true);
    try {
      await managers.dataManager.loadVolumeData(settings.channelTargetC, settings.resolution);
      const s = managers.renderManager.updateRendering(managers.dataManager);
      if (s) setRenderState(s);

      setLastRes(settings.resolution);
      setLastChannels([...settings.channelTargetC]);
    } finally { setLoading(false); }
  }, [managers, lastRes, lastChannels]);

  /* update for 3D‑mode or prop changes */
  useEffect(() => {
    const on3D = props.spatialRenderingMode === '3D';
    setIs3D(on3D);
    if (on3D) loadIfNeeded(extractSettings());
  }, [props, extractSettings, loadIfNeeded]);

  /* ---------- MRT target matching canvas --------------------------------- */
  useEffect(() => {
    const { width, height } = gl.domElement;
    const mrt = new WebGLMultipleRenderTargets(width, height, 3);
    mrt.texture.forEach((tex) => {
      tex.format = THREE.RGBAFormat;
      tex.type = THREE.UnsignedByteType;
      tex.minFilter = tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
    });

    // Create screen quad setup
    const screenScene = new THREE.Scene();
    const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    screenCamera.position.z = 1;

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: mrt.texture[0],
      transparent: true,
      // color: 0x00ff00,
    });
    const screenQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      screenMaterial,
    );

    screenScene.add(screenQuad);

    // Store refs
    screenSceneRef.current = screenScene;
    screenCameraRef.current = screenCamera;
    screenQuadRef.current = screenQuad;

    bufU32.current = new Uint8Array(width * height * 4);
    bufU16.current = new Uint8Array(width * height * 4);
    setRT(mrt);

    return () => {
      mrt.dispose();
      screenMaterial.dispose();
      screenQuad.geometry.dispose();
    };
  }, [gl]);

  useEffect(() => {
    if (!processingRT) return;
    const ctx = gl.getContext();

    const loop = () => {
      // 1. Render volume scene to MRT
      gl.setRenderTarget(processingRT);

      gl.clear(true, true, true);
      gl.render(scene, camera);

      // uncomment to test via spector js
      // ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(gl, processingRT));
      // ctx.readBuffer(ctx.COLOR_ATTACHMENT0);
      // ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
      // ctx.readBuffer(ctx.COLOR_ATTACHMENT2);

      // 2. Read back attachments 1 & 2 on interval
      const f = frameRef.current++;
      if (f % 100 === 0) { // attachment 1 every ~2s @60fps
        ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(gl, processingRT));
        ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
        ctx.readPixels(0, 0, processingRT.width, processingRT.height,
          ctx.RGBA, ctx.UNSIGNED_BYTE, bufU32.current);

        // const firstBytes = bufU32.current.slice(0, 16); // first 4 pixels (4 bytes each)
        // console.log('Attachment 1 sample:', firstBytes);

        managers?.dataManager.processRenderTargetData(bufU32.current, 1);
      }
      if (f % 100 === 50) { // attachment 2 offset by 1s
        ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(gl, processingRT));
        ctx.readBuffer(ctx.COLOR_ATTACHMENT2);
        ctx.readPixels(0, 0, processingRT.width, processingRT.height,
          ctx.RGBA, ctx.UNSIGNED_BYTE, bufU16.current);
        managers?.dataManager.processRenderTargetData(bufU16.current, 2);
      }

      // 3. Render screen quad with attachment 0
      gl.setRenderTarget(null);
      gl.clear(true, true, true);
      gl.render(screenSceneRef.current, screenCameraRef.current);

    };

    gl.setAnimationLoop(loop);
  }, [gl, scene, camera, processingRT, managers]);

  function framebufferFor(renderer, rt) {
    const p = renderer.properties?.get(rt);
    return p?.framebuffer || p?.__webglFramebuffer || rt.__webglFramebuffer;
  }

  /* ---------- let RenderManager know about the MRT ---------------------- */
  useEffect(() => {
    managers?.renderManager.setProcessingTargets(processingRT);
  }, [managers, processingRT]);

  /* ---------- JSX -------------------------------------------------------- */
  if (!is3D || !managers) return null;

  if (loading || !renderState.shader) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#444" wireframe />
        </mesh>
        <OrbitControls ref={orbitRef} />
      </group>
    );
  }

  return (
    <group>
      <OrbitControls ref={orbitRef} />
      <mesh ref={meshRef} scale={renderState.meshScale}>
        <boxGeometry args={renderState.geometrySize} />
        <shaderMaterial
          uniforms={renderState.uniforms}
          vertexShader={renderState.shader.vertexShader}
          fragmentShader={renderState.shader.fragmentShader}
          side={THREE.BackSide}
          transparent
          glslVersion={THREE.GLSL3}
        />
      </mesh>
    </group>
  );
}
