import { mergeConfig } from 'vite';
import configShared from '../../../vite.config.mjs';

// Codec tests import .wasm files as data URLs.
export default mergeConfig(configShared, { assetsInclude: ['**/*.wasm'] });
