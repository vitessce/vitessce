// Attribution: Originally written by @alexandrairger
// Moved from .glsl file to .js file in this commit: https://github.com/vitessce/vitessce/pull/2264/commits/7f17fc003674a4ed1a8de6140db802781871cf88
/*
This is a simple vertex shader used for post-processing effects, specifically
Gaussian blur filtering applied to the final rendered image. It's part of a
two-pass rendering pipeline in the spatial-accelerated volume viewer.

USAGE CONTEXT:
- Used in VolumeView.js for the "blit pass" (screen-space post-processing)
- Applied to a full-screen quad (2x2 plane) that covers the entire viewport
- Works with GaussianFragmentShader to apply blur effects for performance optimization

COMPARISON WITH VolumeVertexShader:

VolumeVertexShader (Complex 3D Volume Rendering):
┌─────────────────────────────────────────────────────────────────┐
│ • Handles 3D volume data with complex coordinate transformations│
│ • Calculates ray directions for GPU-accelerated ray casting     │
│ • Transforms camera positions and volume coordinates            │
│ • Supports multiple volume channels and LOD systems             │
│ • Used for the main volume rendering pass                       │
└─────────────────────────────────────────────────────────────────┘

GaussianVertexShader (Simple 2D Post-Processing):
┌─────────────────────────────────────────────────────────────────┐
│ • Handles simple 2D screen-space coordinates                    │
│ • No complex transformations - just passes through UV coords    │
│ • Used for post-processing effects on the final rendered image  │
│ • Part of adaptive quality system (blur for performance)        │
└─────────────────────────────────────────────────────────────────┘

RENDERING PIPELINE:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Volume Rendering│───▶│ Gaussian Blur   │───▶│ Final Display   │
│ (VolumeShader)  │    │ (This Shader)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
    │ 3D volume data        │ 2D texture         │ Blurred result
    │ ray casting           │ screen quad        │ for performance

ADAPTIVE QUALITY SYSTEM:
- When user is interacting: Apply strong blur (gaussian=7) for performance
- When user is still: No blur (gaussian=0) for best quality
- Automatic quality adjustment based on frame rate */

// lang: glsl
export const gaussianVertexShader = `//
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;
