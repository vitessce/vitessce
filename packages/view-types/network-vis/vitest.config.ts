import { defineConfig, mergeConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import configShared from '../../../vite.config.js';

export default mergeConfig(configShared, defineConfig({
    plugins: [wasm()],
  }));
  
