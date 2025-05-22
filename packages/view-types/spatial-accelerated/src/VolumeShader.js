/* eslint-disable import/no-unresolved */
import { Vector2, Vector3 } from 'three';
import vertexShader from '../shaders/VolumeVertexShader.glsl?raw';
import fragmentShader from '../shaders/VolumeFragmentShader.glsl?raw';

export const VolumeShader = {
  uniforms: {
    u_size: { value: new Vector3(1, 1, 1) },
    u_clim: { value: new Vector2(0.2, 0.8) },
    u_clim2: { value: new Vector2(0.2, 0.8) },
    u_clim3: { value: new Vector2(0.2, 0.8) },
    u_clim4: { value: new Vector2(0.2, 0.8) },
    u_clim5: { value: new Vector2(0.2, 0.8) },
    u_clim6: { value: new Vector2(0.2, 0.8) },
    u_xClip: { value: new Vector2(-1.0, 1000000.0) },
    u_yClip: { value: new Vector2(-1.0, 1000000.0) },
    u_zClip: { value: new Vector2(-1.0, 1000000.0) },
    u_window_size: { value: new Vector2(1, 1) },
    u_vol_scale: { value: new Vector2(1, 1, 1) },
    brickCacheTex: { type: 'sampler3D', value: null },
    pageTableTex: { type: 'usampler3D', value: null },
    u_color: { value: new Vector3(0, 0, 0) },
    u_color2: { value: new Vector3(0, 0, 0) },
    u_color3: { value: new Vector3(0, 0, 0) },
    u_color4: { value: new Vector3(0, 0, 0) },
    u_color5: { value: new Vector3(0, 0, 0) },
    u_color6: { value: new Vector3(0, 0, 0) },
    // u_cmdata: { value: null },
    near: { value: 0.1 },
    far: { value: 10000 },
    opacity: { value: 1 },
    volumeCount: { value: 0 },
    boxSize: { value: new Vector3(1, 1, 1) },
    renderRes: { value: 1000 },
  },
  vertexShader,
  fragmentShader,
};
