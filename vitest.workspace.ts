import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    // Top-level
    'packages/config',
    'packages/constants',
    'packages/constants-internal',
    'packages/gl',
    'packages/legend',
    'packages/plugins',
    'packages/schemas',
    'packages/tooltip',
    'packages/vega',
    'packages/vit-s',
    'packages/workers',
    // Second-level
    'packages/main/all',
    'packages/utils/*',
    'packages/file-types/*',
    'packages/view-types/*'
])