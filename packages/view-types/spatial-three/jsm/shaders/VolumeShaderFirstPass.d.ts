import {
  Uniform
} from '../../node_modules/three/build/three.module.js';

export const VolumeShaderFirstPass: {
  uniforms: {
    u_vol_scale: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
