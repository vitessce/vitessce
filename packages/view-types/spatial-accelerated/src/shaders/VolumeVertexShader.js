/*

============================================================================
VOLUME RENDERING PIPELINE OVERVIEW
============================================================================

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vertex Shader │───▶│ Fragment Shader │───▶│   Final Image   │
│  (this shader)  │    │ (ray marching)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
    │ rayDirUnnorm           │ sample volume
    │ cameraCorrected        │ blend voxels
    │ worldSpaceCoords       │ apply lighting

============================================================================
COORDINATE TRANSFORMATIONS
============================================================================

1. Volume Space Normalization:
Original: [-0.5, 0.5]     Normalized: [0, 1]
┌─────────────┐           ┌─────────────┐
│   -0.5      │           │     0       │
│             │           │             │
│      0      │──────────▶│    0.5      │
│             │           │             │
│    0.5      │           │     1       │
└─────────────┘           └─────────────┘

2. Camera Position Transformation:
World Space:     Volume Space:
┌─────────────┐   ┌─────────────┐
│   Camera    │   │   Camera    │
│  Position   │──▶│  Position   │
└─────────────┘   └─────────────┘
     (x,y,z)         (x',y',z')

3. Ray Direction Calculation:
    Camera (cameraCorrected)
       │
       │ rayDirUnnorm = position - cameraCorrected
       ▼
   Vertex (position)

4. MVP Transformation Pipeline:
Model Space → View Space → Projection Space → Clip Space
   (x,y,z)  →   (x',y',z')  →    (x",y",z")   →  (x"',y"',z"')
 */

// lang: glsl
export const volumeVertexShader = `//
// Output: Unnormalized ray direction from camera to each vertex
// Used by fragment shader for ray marching through the volume
out vec3 rayDirUnnorm;

// Output: Camera position transformed into volume's local coordinate system
// Used to calculate ray origins in the fragment shader
out vec3 cameraCorrected;

// Volume scale uniform (likely for anisotropic voxels)
uniform vec3 u_vol_scale;

// Volume size uniform
uniform vec3 u_size;

// Output: Vertex positions normalized to [0,1] range within volume bounds
// Standard coordinate system for volume sampling
varying vec3 worldSpaceCoords;

// Output: Texture coordinates for sampling volume data
varying vec2 vUv;

// Output: Final clip-space position (stored for fragment shader access)
varying vec4 glPosition;

// Volume bounding box size uniform
uniform highp vec3 boxSize;

void main()
{
   // Transform vertex positions from [-0.5, 0.5] range to [0, 1] range
   // This is the standard coordinate system for volume sampling
   //
   // Mathematical transformation:
   // worldSpaceCoords = (position / boxSize) + 0.5
   // 
   // Example:
   // position = (-0.5, -0.5, -0.5) → worldSpaceCoords = (0, 0, 0)
   // position = ( 0.0,  0.0,  0.0) → worldSpaceCoords = (0.5, 0.5, 0.5)
   // position = ( 0.5,  0.5,  0.5) → worldSpaceCoords = (1, 1, 1)
   worldSpaceCoords = position / boxSize + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]
   
   // Transform camera position into volume's local coordinate system
   // This gives us the ray origin in volume space
   cameraCorrected = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;
   
   // Calculate unnormalized ray direction from camera to each vertex
   // Used by fragment shader for ray marching through the volume
   rayDirUnnorm = position - cameraCorrected;
   
   // Apply standard MVP transformation to get clip-space coordinates
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   
   // Store clip-space position for fragment shader access
   glPosition = gl_Position;
   
   // Pass through texture coordinates for volume sampling
   vUv = uv;
}
`;
