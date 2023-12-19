import {
  Uniform
} from '../../node_modules/three/build/three.module.js';

export const VolumeShaderGeom: {
  uniforms: {
    u_color: Uniform;
    u_vol_scale: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
