/*
 * Volume Rendering Fragment Shader for Scientific Visualization
 * 
 * This shader implements ray-marching volume rendering with:
 * - Multi-resolution level-of-detail (LOD) support
 * - Brick-based caching system for large datasets
 * - Multi-channel rendering with independent color/opacity
 * - Adaptive sampling based on distance and resolution
 * - Support for different rendering styles (MIP, MinIP, standard)
 * 
 * ========================================
 * BRICK CACHE AND PAGE TABLE EXPLANATION
 * ========================================
 * 
 * For developers unfamiliar with computer graphics concepts:
 * 
 * PROBLEM: Large 3D datasets (like medical scans or scientific volumes) can be 
 * gigabytes in size, but GPU memory is limited. We need a way to efficiently 
 * render these datasets without loading everything into memory at once.
 * 
 * SOLUTION: A two-tier caching system using "Bricks" and a "Page Table":
 * 
 * 1. BRICK CACHE (The Data Storage):
 *    - Think of the 3D dataset as a large cube divided into smaller 32x32x32 
 *      voxel "bricks" (like LEGO blocks)
 *    - The Brick Cache is a 3D texture (2048x2048x128) that acts as a "cache" 
 *      or "working memory" for these bricks
 *    - Only the most recently used bricks are kept in this cache
 *    - When you need data from a brick that's not in the cache, it gets loaded 
 *      from disk and stored in the cache (replacing the least recently used brick)
 *    - This is similar to how a web browser caches web pages - you don't load 
 *      the entire internet, just the pages you're currently viewing
 * 
 * 2. PAGE TABLE (The Index/Map):
 *    - The Page Table is like a "phone book" or "index" that tells us where 
 *      each brick is stored in the Brick Cache
 *    - Each entry in the Page Table corresponds to one brick in the 3D dataset
 *    - The Page Table entry contains:
 *      * Whether the brick is currently loaded in the cache (resident flag)
 *          In other words, the brick is in the cache and available for immediate use.
 *      * Whether the brick has been initialized with data (initialized flag)
 *          In other words, the data is known to be available in the CPU, but
 *          we still need to request this data to be loaded into the brick cache.
 *      * The minimum and maximum values in the brick (for optimization)
 *      * The exact coordinates where the brick is stored in the Brick Cache
 *    - This is similar to how a library's card catalog tells you which shelf 
 *      and position a book is located
 * 
 * HOW IT WORKS TOGETHER:
 * 1. When rendering a pixel, the shader needs to sample data from a specific 
 *    location in the 3D dataset
 * 2. It calculates which brick contains that location
 * 3. It looks up that brick in the Page Table to see if it's loaded in the cache
 * 4. If loaded: it uses the coordinates from the Page Table to sample from the 
 *    Brick Cache
 * 5. If not loaded: it requests the brick to be loaded (and continues with 
 *    lower resolution data until the brick arrives)
 *      The request is performed by modifying the gRequest value to append the coordinate of the brick being requested.
 * 
 * MULTI-RESOLUTION ADAPTATION:
 * The system supports multiple levels of detail (LOD) to handle different viewing 
 * distances and performance requirements:
 * 
 * RESOLUTION LEVELS:
 * - Level 0: Highest detail (1:1 scale) - every voxel is represented
 * - Level 1: 2:1 scale - every 2x2x2 block of voxels becomes 1 voxel
 * - Level 2: 4:1 scale - every 4x4x4 block of voxels becomes 1 voxel
 * - Level 3: 8:1 scale - every 8x8x8 block of voxels becomes 1 voxel
 * - ...and so on up to Level 9 (512:1 scale)
 * 
 * HOW BRICK CACHE HANDLES MULTIPLE RESOLUTIONS:
 * - Each resolution level has its own set of bricks in the same cache
 * - Higher resolution levels use more bricks (more detail)
 * - Lower resolution levels use fewer bricks (less detail)
 * - The cache can store bricks from different resolution levels simultaneously
 * - When you zoom in, the system loads higher resolution bricks
 * - When you zoom out, it can use lower resolution bricks (faster rendering)
 * 
 * HOW PAGE TABLE HANDLES MULTIPLE RESOLUTIONS:
 * - Each resolution level has its own "anchor point" in the page table
 * - The anchor point defines where that resolution's brick entries start
 * - Different channels can have different resolution ranges available
 * - The system automatically selects the best available resolution for each channel
 * - If a high-resolution brick isn't loaded, it falls back to lower resolution
 * 
 * ADAPTIVE RESOLUTION SELECTION:
 * - Distance-based: Objects far from the camera use lower resolution
 * - Performance-based: When rendering is slow, it uses lower resolution
 * - Quality-based: When high quality is needed, it requests higher resolution
 * - Channel-specific: Each channel can have different resolution requirements
 * 
 * EXAMPLE SCENARIO:
 * 1. User is viewing a large dataset from far away → Uses Level 5-7 bricks
 * 2. User zooms in on a specific region → System requests Level 2-3 bricks
 * 3. User continues zooming → System loads Level 0-1 bricks for maximum detail
 * 4. If Level 0 bricks aren't loaded yet → Temporarily shows Level 1 bricks
 * 5. Once Level 0 bricks arrive → Smoothly transitions to highest detail
 * 
 * BENEFITS:
 * - Memory efficient: Only loads what you need
 * - Fast rendering: Frequently accessed data stays in cache
 * - Scalable: Can handle datasets much larger than GPU memory
 * - Adaptive: Automatically loads higher resolution data for areas you're 
 *   looking at closely
 * 
 * ASCII Art Diagrams:
 * 
 * 1. Ray-Marching Through Volume:
 *    Camera
 *      |
 *      v
 *    ┌─────────────────────────────────────┐
 *    │                                     │
 *    │  ┌───┐  ┌───┐  ┌───┐  ┌───┐         │
 *    │  │B0 │  │B1 │  │B2 │  │B3 │  ...    │  <- Bricks (32x32x32 voxels)
 *    │  └───┘  └───┘  └───┘  └───┘         │
 *    │                                     │
 *    │  Ray marches through volume         │
 *    │  sampling at regular intervals      │
 *    │                                     │
 *    └─────────────────────────────────────┘
 * 
 * 2. Multi-Resolution LOD System:
 *    Resolution Levels (0 = highest, 9 = lowest):
 *    
 *    Level 0: ████████████████████████████  (1:1 scale)
 *    Level 1: ████████░░░░░░░░████████░░░░  (2:1 scale)
 *    Level 2: ████░░░░░░░░░░░░████░░░░░░░░  (4:1 scale)
 *    Level 3: ██░░░░░░░░░░░░░░██░░░░░░░░░░  (8:1 scale)
 *    ...
 *    Level 9: █░░░░░░░░░░░░░░░░░░░░░░░░░░░  (512:1 scale)
 * 
 * 3. Brick Cache Layout:
 *    ┌─────────────────────────────────────┐
 *    │ 2048 x 2048 x 128 texture           │
 *    │                                     │
 *    │  ┌───┐  ┌───┐  ┌───┐  ┌───┐         │
 *    │  │B0 │  │B1 │  │B2 │  │B3 │  ...    │  <- Brick cache entries
 *    │  └───┘  └───┘  └───┘  └───┘         │
 *    │                                     │
 *    │  Each brick = 32x32x32 voxels       │
 *    │  Total: 64x64x16 = 65,536 bricks    │
 *    └─────────────────────────────────────┘
 * 
 * 4. Page Table Structure:
 *    ┌─────────────────────────────────────┐
 *    │ 32-bit entry per brick:             │
 *    │                                     │
 *    │ [31] Resident flag (1=loaded)       │
 *    │ [30] Initialized flag (1=ready)     │
 *    │ [29:23] Min value (7 bits)          │
 *    │ [22:16] Max value (7 bits)          │
 *    │ [15:10] X offset in cache (6 bits)  │
 *    │ [9:4]  Y offset in cache (6 bits)   │
 *    │ [3:0]  Z offset in cache (4 bits)   │
 *    └─────────────────────────────────────┘
 * 
 * 5. Multi-Channel Rendering:
 *    Channel 0: ████████████████████████████
 *    Channel 1: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 *    Channel 2: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
 *    Channel 3: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 *    Channel 4: ████████████████████████████
 *    Channel 5: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 *    Channel 6: ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
 *    
 *    Each channel has independent:
 *    - Color mapping
 *    - Opacity
 *    - Resolution range
 *    - Contrast limits
 * 
 * 6. Adaptive Sampling:
 *    Distance-based LOD selection:
 *    
 *    Near:   ████████████████████████████  (High res, small steps)
 *    Medium: ████████░░░░░░░░████████░░░░  (Medium res, medium steps)
 *    Far:    ██░░░░░░░░░░░░░░██░░░░░░░░░░  (Low res, large steps)
 * 
 * Key Features:
 * - Ray-box intersection for volume bounds
 * - Adaptive step size based on LOD
 * - Trilinear interpolation for smooth sampling
 * - Early termination for opaque regions
 * - Request/usage tracking for brick loading
 * - Support for clipping planes
 * - Jittered sampling for noise reduction
 */

// #include <packing>
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler3D;

// ========================================
// INPUT VARIABLES (from vertex shader)
// ========================================
// Unnormalized ray direction from camera
in vec3 rayDirUnnorm;
// Camera position in world space
in vec3 cameraCorrected;

// ========================================
// TEXTURE SAMPLERS
// ========================================
// 3D texture containing cached brick data (2048x2048x128)
// (2048*2048*128)/(32*32*32) = 16,384 bricks can be stored?
uniform sampler3D brickCacheTex;
// 3D texture containing page table entries (brick metadata)
uniform usampler3D pageTableTex;

// ========================================
// RENDERING PARAMETERS
// ========================================
// Rendering style: 0=MIP, 1=MinIP, 2=standard volume rendering
uniform int u_renderstyle;
// Global opacity multiplier for volume rendering
uniform float opacity;

// ========================================
// CONTRAST LIMITS (per channel)
// ========================================
// Each channel has independent min/max values for value normalization
// Channel 0: (min_value, max_value)
uniform vec2 clim0;
// Channel 1: (min_value, max_value)
uniform vec2 clim1;
// Channel 2: (min_value, max_value)
uniform vec2 clim2;
// Channel 3: (min_value, max_value)
uniform vec2 clim3;
// Channel 4: (min_value, max_value)
uniform vec2 clim4;
// Channel 5: (min_value, max_value)
uniform vec2 clim5;
// Channel 6: (min_value, max_value)
uniform vec2 clim6;

// ========================================
// CLIPPING PLANES
// ========================================
// X-axis clipping: (min_x, max_x) or (-1, -1) if disabled
uniform vec2 xClip;
// Y-axis clipping: (min_y, max_y) or (-1, -1) if disabled
uniform vec2 yClip;
// Z-axis clipping: (min_z, max_z) or (-1, -1) if disabled
uniform vec2 zClip;

// ========================================
// CHANNEL COLORS AND OPACITIES
// ========================================
// Each channel has independent color (RGB) and opacity (A)
// Channel 0: (r, g, b, opacity)
uniform vec4 color0;
// Channel 1: (r, g, b, opacity)
uniform vec4 color1;
// Channel 2: (r, g, b, opacity)
uniform vec4 color2;
// Channel 3: (r, g, b, opacity)
uniform vec4 color3;
// Channel 4: (r, g, b, opacity)
uniform vec4 color4;
// Channel 5: (r, g, b, opacity)
uniform vec4 color5;
// Channel 6: (r, g, b, opacity)
uniform vec4 color6;

uniform int channelMapping[7];

// ========================================
// VOLUME AND RESOLUTION PARAMETERS
// ========================================
// Volume bounding box size in world space
uniform highp vec3 boxSize;
// Rendering resolution level (affects step size)
uniform int renderRes;
// Volume dimensions in voxels (x, y, z)
uniform uvec3 voxelExtents;
// Global resolution range: (min_res, max_res)
uniform ivec2 resGlobal;
// Maximum number of active channels
uniform int maxChannels;

// ========================================
// PER-CHANNEL RESOLUTION RANGES
// ========================================
// Each channel can have different available resolution levels
// Channel 0: (min_res, max_res)
uniform ivec2 res0;
// Channel 1: (min_res, max_res)
uniform ivec2 res1;
// Channel 2: (min_res, max_res)
uniform ivec2 res2;
// Channel 3: (min_res, max_res)
uniform ivec2 res3;
// Channel 4: (min_res, max_res)
uniform ivec2 res4;
// Channel 5: (min_res, max_res)
uniform ivec2 res5;
// Channel 6: (min_res, max_res)
uniform ivec2 res6;
// Channel 7: (min_res, max_res) - unused
uniform ivec2 res7;

// ========================================
// LEVEL-OF-DETAIL PARAMETERS
// ========================================
// LOD factor for distance-based resolution selection
uniform float lodFactor;

// ========================================
// ANCHOR POINTS (per resolution level)
// ========================================
// Anchor points define the origin of page table for each resolution level
// Resolution 0 anchor point (highest detail)
uniform uvec3 anchor0;
// Resolution 1 anchor point
uniform uvec3 anchor1;
// Resolution 2 anchor point
uniform uvec3 anchor2;
// Resolution 3 anchor point
uniform uvec3 anchor3;
// Resolution 4 anchor point
uniform uvec3 anchor4;
// Resolution 5 anchor point
uniform uvec3 anchor5;
// Resolution 6 anchor point
uniform uvec3 anchor6;
// Resolution 7 anchor point
uniform uvec3 anchor7;
// Resolution 8 anchor point
uniform uvec3 anchor8;
// Resolution 9 anchor point (lowest detail)
uniform uvec3 anchor9;

// ========================================
// SCALE FACTORS (per resolution level)
// ========================================
// Scale factors determine voxel size at each resolution level
// Resolution 0 scale factors (should be 1,1,1)
uniform vec3 scale0;
// Resolution 1 scale factors
uniform vec3 scale1;
// Resolution 2 scale factors
uniform vec3 scale2;
// Resolution 3 scale factors
uniform vec3 scale3;
// Resolution 4 scale factors
uniform vec3 scale4;
// Resolution 5 scale factors
uniform vec3 scale5;
// Resolution 6 scale factors
uniform vec3 scale6;
// Resolution 7 scale factors
uniform vec3 scale7;
// Resolution 8 scale factors
uniform vec3 scale8;
// Resolution 9 scale factors
uniform vec3 scale9;

// ========================================
// VARYING VARIABLES (unused but required)
// ========================================
// Fragment position (unused)
varying vec4 glPosition;
// World space coordinates (used for depth only)
varying vec3 worldSpaceCoords;

// ========================================
// OUTPUT VARIABLES (multiple render targets)
// ========================================
// Final rendered color (sRGB)
layout(location = 0) out vec4 gColor;
// Brick loading requests (packed coordinates)
layout(location = 1) out vec4 gRequest;
// Brick usage tracking (for cache management)
layout(location = 2) out vec4 gUsage;

// ========================================
// CONSTANTS
// ========================================
// Size of each brick in voxels (32x32x32)
const float BRICK_SIZE = 32.0;
// Brick cache texture width
const float BRICK_CACHE_SIZE_X = 2048.0;
// Brick cache texture height
const float BRICK_CACHE_SIZE_Y = 2048.0;
// Brick cache texture depth
const float BRICK_CACHE_SIZE_Z = 128.0;
// Number of bricks in X (64)
const float BRICK_CACHE_BRICKS_X = BRICK_CACHE_SIZE_X / BRICK_SIZE;
// Number of bricks in Y (64)
const float BRICK_CACHE_BRICKS_Y = BRICK_CACHE_SIZE_Y / BRICK_SIZE;
// Number of bricks in Z (4)
const float BRICK_CACHE_BRICKS_Z = BRICK_CACHE_SIZE_Z / BRICK_SIZE;

// ========================================
// RAY-VOLUME INTERSECTION
// ========================================
// Calculates the intersection of a ray with the volume's bounding box
// Returns (entry_time, exit_time) for the ray-box intersection
// Handles clipping planes by adjusting the bounding box
//
// Parameters:
//   orig - vec3: Ray origin point in world space
//   dir - vec3: Ray direction vector (should be normalized)
//
// Returns:
//   vec2: (entry_time, exit_time) where:
//     - entry_time: Distance along ray to enter the volume
//     - exit_time: Distance along ray to exit the volume
//     - If no intersection: entry_time > exit_time
vec2 intersect_hit(vec3 orig, vec3 dir) {
    // Start with full volume bounds
    vec3 boxMin = vec3(-0.5) * boxSize;
    vec3 boxMax = vec3(0.5) * boxSize;
    
    // Apply clipping planes if they're active (xClip.x > -1.0 means active)
    if (xClip.x > -1.0) {
        boxMin.x = xClip.x - (boxSize.x / 2.0);
        if (xClip.y < boxSize.x)
        boxMax.x = xClip.y - (boxSize.x / 2.0);
    }
    if (yClip.x > -1.0) {
        boxMin.y = yClip.x - (boxSize.y / 2.0);
        if (yClip.y < boxSize.y)
        boxMax.y = yClip.y - (boxSize.y / 2.0);
    }
    if (zClip.x > -1.0) {
        boxMin.z = zClip.x - (boxSize.z / 2.0);
        if (zClip.y < boxSize.z)
        boxMax.z = zClip.y - (boxSize.z / 2.0);
    }
    
    // Standard ray-box intersection algorithm
    vec3 invDir = 1.0 / dir;
    vec3 tmin0 = (boxMin - orig) * invDir;
    vec3 tmax0 = (boxMax - orig) * invDir;
    vec3 tmin = min(tmin0, tmax0);
    vec3 tmax = max(tmin0, tmax0);
    float t0 = max(tmin.x, max(tmin.y, tmin.z));  // Entry time
    float t1 = min(tmax.x, min(tmax.y, tmax.z));  // Exit time
    return vec2(t0, t1);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Pseudo-random number generator for jittered sampling
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com
//
// Parameters:
//   None (uses gl_FragCoord.xy as input)
//
// Returns:
//   float: Random value between 0.0 and 1.0 based on fragment coordinates
float random() {
    return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

// Convert from linear RGB to sRGB color space
// Implements the standard sRGB transfer function for gamma correction
//
// Parameters:
//   x - float: Linear RGB value between 0.0 and 1.0
//
// Returns:
//   float: sRGB value between 0.0 and 1.0
float linear_to_srgb(float x) {
    if (x <= 0.0031308f) {
        return 12.92f * x;
    }
    return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;
}

// Convert from linear RGB to sRGB color space (vector version)
// Applies sRGB conversion to each RGB component while preserving alpha
//
// Parameters:
//   x - vec4: Linear RGBA color with components between 0.0 and 1.0
//
// Returns:
//   vec4: sRGB RGBA color with components between 0.0 and 1.0
vec4 linear_to_srgb(vec4 x) {
    return vec4(linear_to_srgb(x.r), linear_to_srgb(x.g), linear_to_srgb(x.b), x.a);
}

// ========================================
// PAGE TABLE COORDINATE PACKING
// ========================================
// Packs 3D page table coordinates into RGBA8 texture format
// Uses 10 bits for X, 10 bits for Y, 12 bits for Z
//
// Parameters:
//   coord - uvec3: 3D coordinates to pack (X, Y, Z components)
//     - X coordinate: 10-bit unsigned integer (0-1023)
//     - Y coordinate: 10-bit unsigned integer (0-1023) 
//     - Z coordinate: 12-bit unsigned integer (0-4095)
//
// Returns:
//   vec4: RGBA8 encoded coordinates with components between 0.0 and 1.0
//     - R: Upper 8 bits of packed 32-bit value
//     - G: Middle-upper 8 bits of packed 32-bit value
//     - B: Middle-lower 8 bits of packed 32-bit value
//     - A: Lower 8 bits of packed 32-bit value
vec4 packPTCoordToRGBA8(uvec3 coord) {

    uint x = coord.x & 0x3FFu; // 10 bits for X coordinate
    uint y = coord.y & 0x3FFu; // 10 bits for Y coordinate
    uint z = coord.z & 0xFFFu; // 12 bits for Z coordinate

    // Pack into 32-bit integer
    uint packed =
        (x << 22u) |
        (y << 12u) |
        (z);

    // Decompose into RGBA8 format
    return vec4(
        float((packed >> 24u) & 0xFFu) / 255.0,
        float((packed >> 16u) & 0xFFu) / 255.0,
        float((packed >> 8u) & 0xFFu) / 255.0,
        float(packed & 0xFFu) / 255.0
    );
}

// ========================================
// RESOLUTION AND ANCHOR POINT ACCESSORS
// ========================================

// Get anchor point for a specific resolution level
// Anchor points define the origin of the page table for each resolution
//
// Parameters:
//   index - int: Resolution level index (0-9, where 0 is highest resolution)
//
// Returns:
//   uvec3: 3D anchor point coordinates in the page table, or (-1, -1, -1) if invalid
uvec3 getAnchorPoint(int index) {
    if (index == 0) return anchor0;
    if (index == 1) return anchor1;
    if (index == 2) return anchor2;
    if (index == 3) return anchor3;
    if (index == 4) return anchor4;
    if (index == 5) return anchor5;
    if (index == 6) return anchor6;
    if (index == 7) return anchor7;
    if (index == 8) return anchor8;
    if (index == 9) return anchor9;
    return uvec3(-1, -1, -1);
}

// Find the lowest available resolution level
// Returns the highest resolution index that has valid data
//
// Parameters:
//   None
//
// Returns:
//   int: Highest resolution level index (0-9) that has valid anchor point data
//        Returns 9 if no valid resolution levels are found
int getLowestRes() {
    for (int i = 0; i < 10; i++) {
        if (getAnchorPoint(i) == uvec3(0,0,0)) {
            return i - 1;
        }
    }
    return 9;
}

// Get scale factors for a resolution level
// Scale factors determine the voxel size at each resolution
//
// Parameters:
//   index - int: Resolution level index (0-9, where 0 is highest resolution)
//
// Returns:
//   vec3: Scale factors (x, y, z) for the resolution level, or (-1, -1, -1) if invalid
//         Higher scale factors indicate larger voxels (lower resolution)
vec3 getScale(int index) {
    if (index == 0) return scale0;
    if (index == 1) return scale1;
    if (index == 2) return scale2;
    if (index == 3) return scale3;
    if (index == 4) return scale4;
    if (index == 5) return scale5;
    if (index == 6) return scale6;
    if (index == 7) return scale7;
    if (index == 8) return scale8;
    if (index == 9) return scale9;
    return vec3(-1.0, -1.0, -1.0);
}

// Get resolution range for a channel
// Returns (min_res, max_res) for the channel
//
// Parameters:
//   index - int: Channel index (0-6)
//
// Returns:
//   ivec2: Resolution range as (min_resolution_level, max_resolution_level)
//          Returns (-1, -1) if channel index is invalid
ivec2 getRes(int index) {
    if (index == 0) return res0;
    if (index == 1) return res1;
    if (index == 2) return res2;
    if (index == 3) return res3;
    if (index == 4) return res4;
    if (index == 5) return res5;
    if (index == 6) return res6;
    return ivec2(-1, -1);
}

// Get contrast limits for a channel
// Returns (min_value, max_value) for normalization
//
// Parameters:
//   index - int: Channel index (0-6)
//
// Returns:
//   vec2: Contrast limits as (min_value, max_value) for data normalization
//         Returns (-1.0, -1.0) if channel index is invalid
vec2 getClim(int index) {
    if (index == 0) return clim0;
    if (index == 1) return clim1;
    if (index == 2) return clim2;
    if (index == 3) return clim3;
    if (index == 4) return clim4;
    if (index == 5) return clim5;
    if (index == 6) return clim6;
    return vec2(-1.0, -1.0);
}

// ========================================
// COORDINATE TRANSFORMATIONS
// ========================================

// Convert normalized coordinates (0-1) to voxel coordinates
//
// Parameters:
//   normalized - vec3: Normalized coordinates in range [0,1] for each axis
//   res - int: Resolution level (0=highest detail, 9=lowest detail)
//
// Returns:
//   vec3: Voxel coordinates in the volume space at the specified resolution
vec3 getVoxelFromNormalized(vec3 normalized, int res) {
    vec3 extents = (vec3(voxelExtents) / getScale(res)); // Voxel extents at this resolution
    vec3 voxel = normalized * extents;
    return voxel;
}

// Convert voxel coordinates to normalized coordinates (0-1)
//
// Parameters:
//   voxel - vec3: Voxel coordinates in the volume space
//   res - int: Resolution level (0=highest detail, 9=lowest detail)
//
// Returns:
//   vec3: Normalized coordinates in range [0,1] for each axis
vec3 getNormalizedFromVoxel(vec3 voxel, int res) {
    vec3 extents = (vec3(voxelExtents) / getScale(res)); // Voxel extents at this resolution
    vec3 normalized = voxel / extents;
    return normalized;
}

// Convert normalized coordinates to brick coordinates
//
// Parameters:
//   normalized - vec3: Normalized coordinates in range [0,1] for each axis
//   res - int: Resolution level (0=highest detail, 9=lowest detail)
//
// Returns:
//   vec3: Brick coordinates (each brick is 32x32x32 voxels)
vec3 getBrickFromNormalized(vec3 normalized, int res) {
    vec3 voxel = getVoxelFromNormalized(normalized, res);
    vec3 brick = floor(voxel / 32.0);  // Each brick is 32x32x32 voxels
    return brick;
}

// Convert voxel coordinates to brick coordinates
//
// Parameters:
//   voxel - vec3: Voxel coordinates in the volume space
//   res - int: Resolution level (0=highest detail, 9=lowest detail)
//
// Returns:
//   vec3: Brick coordinates (each brick is 32x32x32 voxels)
vec3 getBrickFromVoxel(vec3 voxel, int res) {
    vec3 brick = floor(voxel / 32.0);  // Each brick is 32x32x32 voxels
    return brick;
}

// ========================================
// CHANNEL-SPECIFIC ACCESSORS
// ========================================

// Get channel offset in page table
// Different channels are stored at different Z-offsets in the page table
//
// Parameters:
//   index - int: Channel index (0-6)
//
// Returns:
//   uvec3: 3D offset coordinates for the channel in the page table
uvec3 getChannelOffset(int index) {
    if (index == 0) return uvec3(0, 0, 1);
    if (index == 1) return uvec3(0, 1, 0);
    if (index == 2) return uvec3(0, 1, 1);
    if (index == 3) return uvec3(1, 0, 0);
    if (index == 4) return uvec3(1, 0, 1);
    if (index == 5) return uvec3(1, 1, 0);
    if (index == 6) return uvec3(1, 1, 1);
    return uvec3(0, 0, 0);
}

// Get color for a channel
//
// Parameters:
//   index - int: Channel index (0-6)
//
// Returns:
//   vec3: RGB color values for the specified channel
vec3 getChannelColor(int index) {
    if (index == 0) return color0.xyz;
    if (index == 1) return color1.xyz;
    if (index == 2) return color2.xyz;
    if (index == 3) return color3.xyz;
    if (index == 4) return color4.xyz;
    if (index == 5) return color5.xyz;
    if (index == 6) return color6.xyz;
    return vec3(0.0, 0.0, 0.0);
}

// Get opacity for a channel
//
// Parameters:
//   index - int: Channel index (0-6)
//
// Returns:
//   float: Opacity value (0.0-1.0) for the specified channel
float getChannelOpacity(int index) {
    if (index == 0) return color0.w;
    if (index == 1) return color1.w;
    if (index == 2) return color2.w;
    if (index == 3) return color3.w;
    if (index == 4) return color4.w;
    if (index == 5) return color5.w;
    if (index == 6) return color6.w;
    return 0.0;
}

// ========================================
// PAGE TABLE DECODING
// ========================================
/*
Page table entry format (32 bits):
[31]    | 0 — flag resident (1=loaded in cache)
[30]    | 1 — flag init (1=initialized)
[29:23] | 2…8 — min value (7 bits) → 128 levels
[22:16] | 9…15 — max value (7 bits) → 128 levels  
[15:10] | 16…21 — x offset in brick cache (6 bits) → 64 bricks
[9:4]   | 22…27 — y offset in brick cache (6 bits) → 64 bricks
[3:0]   | 28…31 — z offset in brick cache (4 bits) → 16 bricks
*/

// Query page table to find brick location and status
// Searches for a brick at the specified location across multiple resolution levels
// and returns its cache coordinates and status information
//
// Parameters:
//   location - vec3: Normalized coordinates (0-1) within the volume
//   targetRes - int: Target resolution level to start searching from
//   channel - int: Channel index (0-6) to query
//   rnd - float: Random value (0-1) used for brick loading request selection
//   query - bool: Whether to allow brick loading requests (true) or just query (false)
//   colorIndex - int
//
// Returns:
//   ivec4: (x_offset, y_offset, z_offset, status) where:
//     - x_offset, y_offset, z_offset: Brick cache coordinates if found
//     - status: Resolution level (>=0) if found, or status code:
//       * -1: Not found at any resolution level
//       * -2: Empty brick (all values below threshold)
//       * -3: Constant full brick (all values above threshold)
//       * -4: Constant value brick (uniform value)
// add maxres here
ivec4 getBrickLocation(vec3 location, int targetRes, int channel, float rnd, bool query, int colorIndex) {

    vec2 clim = getClim(channel);
    int channelMin = getRes(channel).x;
    int channelMax = getRes(channel).y;

    // Clamp resolution to channel's available range
    int currentRes = clamp(targetRes, channelMin, channelMax);
    currentRes = clamp(currentRes, resGlobal.x, resGlobal.y);
    int lowestRes = clamp(resGlobal.y, channelMin, channelMax);

    // Determine if this channel should request brick loading
    bool requestChannel = false;
    if (int(floor(rnd * float(maxChannels))) == channel) {
        requestChannel = true;
    }

    // Try progressively lower resolutions until we find data
    while (currentRes <= lowestRes) {

        // Calculate page table coordinates for this brick
        uvec3 anchorPoint = getAnchorPoint(currentRes);
        vec3 brickLocation = getBrickFromNormalized(location, currentRes);
        uvec3 channelOffset = getChannelOffset(channel);
        vec3 coordinate = floor(vec3(anchorPoint * channelOffset)) + brickLocation;
        
        // Special handling for resolution 0 (highest detail)
        if (currentRes == 0) {
            int zExtent = int(ceil(float(voxelExtents.z) / 32.0));
            coordinate = vec3(anchorPoint) + vec3(0.0, 0.0, zExtent * channel) + brickLocation;
        }

        // Query the page table
        uint ptEntry = texelFetch(pageTableTex, ivec3(coordinate), 0).r;
        vec2 clim = getClim(colorIndex);

        // Check if brick is initialized
        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            // Request brick loading if needed
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) && query == true) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            continue;
        }
        
        // Extract min/max values from page table entry
        uint umin = ((ptEntry >> 23u) & 0x7Fu);
        uint umax = ((ptEntry >> 16u) & 0x7Fu);
        float min = float(int(umin)) / 127.0;
        float max = float(int(umax)) / 127.0;
        
        // Check if brick is empty (all values below threshold)
        if (float(max) <= clim.x) {
            return ivec4(0,0,0,-2);
            // EMPTY
        } else if (float(min) >= clim.y) {
            return ivec4(0,0,0,-3);  // CONSTANT FULL
        } else if ((umax - umin) < 2u) {
            return ivec4(min,0,0,-4);  // CONSTANT OTHER VALUE
        }
        
        // Check if brick is resident in cache
        uint isResident = (ptEntry >> 31u) & 1u;
        if (isResident == 0u) {
            currentRes++;
            // Request brick loading if needed
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) && query == true) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            continue;
        } else {
            // Extract brick cache coordinates
            uint xBrickCache = (ptEntry >> 10u) & 0x3Fu;
            uint yBrickCache = (ptEntry >> 4u) & 0x3Fu;
            uint zBrickCache = ptEntry & 0xFu;
            uvec3 brickCacheCoord = uvec3(xBrickCache, yBrickCache, zBrickCache);

            return ivec4(brickCacheCoord, currentRes);
        }
    }

    return ivec4(0,0,0,-1);  // Not found
}

// Request brick loading for a specific location and resolution
// Initiates a request to load a brick from disk into the brick cache
//
// Parameters:
//   location - vec3: Normalized world space coordinates (0.0 to 1.0) where the brick is needed
//   targetRes - int: Target resolution level (0-9, where 0 is highest resolution)
//   channel - int: Channel index (0-6) for multi-channel datasets
//   rnd - float: Random value between 0.0 and 1.0 used for load balancing across channels
//
// Returns:
//   void: No return value, but sets gRequest output variable if conditions are met
void setBrickRequest(vec3 location, int targetRes, int channel, float rnd) {
    uvec3 anchorPoint = getAnchorPoint(targetRes);
    vec3 brickLocation = getBrickFromNormalized(location, targetRes);
    uvec3 channelOffset = getChannelOffset(channel);
    vec3 coordinate = floor(vec3(anchorPoint * channelOffset)) + brickLocation;
    
    // Special handling for resolution 0
    if (targetRes == 0) {
        int zExtent = int(ceil(float(voxelExtents.z) / 32.0));
        coordinate = vec3(anchorPoint) + vec3(0.0, 0.0, zExtent * channel) + brickLocation;
    }
    
    // Pack coordinates and set request
    if (int(floor(rnd * float(maxChannels))) == channel) {
        gRequest = packPTCoordToRGBA8(uvec3(coordinate));
    }
}

// Track brick usage for cache management
// Records which brick in the cache is being accessed for LRU (Least Recently Used) eviction
//
// Parameters:
//   brickCacheOffset - ivec3: 3D coordinates of the brick within the brick cache texture
//   t_hit_min_os - float: Ray entry time in object space (start of ray-volume intersection)
//   t_hit_max_os - float: Ray exit time in object space (end of ray-volume intersection)
//   t_os - float: Current sampling position along the ray in object space
//   rnd - float: Random value between 0.0 and 1.0 used for probabilistic usage tracking
//
// Returns:
//   void: No return value, but sets gUsage output variable to track cache access patterns
void setUsage(ivec3 brickCacheOffset, float t_hit_min_os, float t_hit_max_os, float t_os, float rnd) {
    float normalized_t_os = (t_os - t_hit_min_os) / (t_hit_max_os - t_hit_min_os); // Normalize to 0-1
    if (normalized_t_os <= rnd || gUsage == vec4(0.0, 0.0, 0.0, 0.0)) {
        gUsage = vec4(vec3(brickCacheOffset) / 255.0, 1.0);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get maximum component of a 3D vector
//
// Parameters:
//   v - vec3: Input 3D vector
//
// Returns:
//   float: The maximum value among the x, y, and z components
float vec3_max(vec3 v) {
    return max(v.x, max(v.y, v.z));
}

// Get minimum component of a 3D vector
//
// Parameters:
//   v - vec3: Input 3D vector
//
// Returns:
//   float: The minimum value among the x, y, and z components
float vec3_min(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

// Calculate level-of-detail based on distance
// Uses logarithmic scaling to determine appropriate resolution level
//
// Parameters:
//   distance - float: Distance from camera to sampling point
//   highestRes - int: Highest available resolution level (typically 0)
//   lowestRes - int: Lowest available resolution level (typically 9)
//   lodFactor - float: Scaling factor that controls LOD sensitivity
//
// Returns:
//   int: Resolution level index (0-9) where 0 is highest resolution
int getLOD(float distance, int highestRes, int lowestRes, float lodFactor) {
    int lod = int(log2(distance * lodFactor));
    return clamp(lod, highestRes, lowestRes);
}

// Calculate step size for ray marching at a given resolution
// Determines optimal sampling step size based on voxel dimensions and ray direction
//
// Parameters:
//   res - int: Resolution level index (0-9, where 0 is highest resolution)
//   osDir - vec3: Ray direction vector in object space (should be normalized)
//
// Returns:
//   float: Optimal step size in object space units for stable ray marching
float voxelStepOS(int res, vec3 osDir) {
    vec3 voxelSize = getScale(res) / vec3(voxelExtents);
    vec3 dt_vec = voxelSize / abs(osDir);
    return min(dt_vec.x, min(dt_vec.y, dt_vec.z));
}

// ========================================
// INTERPOLATION FUNCTIONS
// ========================================

// Linear interpolation between two values
// Performs smooth interpolation between two scalar values
//
// Parameters:
//   v0 - float: First value to interpolate from
//   v1 - float: Second value to interpolate to
//   fx - float: Interpolation factor between 0.0 and 1.0
//
// Returns:
//   float: Interpolated value between v0 and v1 based on fx
float lerp(float v0, float v1, float fx) {
    return mix(v0, v1, fx); // (1-fx)·v0 + fx·v1
}

// Bilinear interpolation between four values
// Performs 2D interpolation using four corner values arranged in a square
//
// Parameters:
//   v00 - float: Bottom-left corner value
//   v10 - float: Bottom-right corner value
//   v01 - float: Top-left corner value
//   v11 - float: Top-right corner value
//   f - vec2: 2D interpolation factors (x, y) between 0.0 and 1.0
//
// Returns:
//   float: Interpolated value from the four corner values
float bilerp(float v00, float v10, float v01, float v11, vec2 f) {
    float c0 = mix(v00, v10, f.x); // Interpolate in X on bottom row
    float c1 = mix(v01, v11, f.x); // Interpolate in X on top row
    return mix(c0, c1, f.y); // Now interpolate those in Y
}

// Trilinear interpolation between eight values
// Performs 3D interpolation using eight corner values arranged in a cube
//
// Parameters:
//   v000 - float: Bottom-left-back corner value
//   v100 - float: Bottom-right-back corner value
//   v010 - float: Bottom-left-front corner value
//   v110 - float: Bottom-right-front corner value
//   v001 - float: Top-left-back corner value
//   v101 - float: Top-right-back corner value
//   v011 - float: Top-left-front corner value
//   v111 - float: Top-right-front corner value
//   f - vec3: 3D interpolation factors (x, y, z) between 0.0 and 1.0
//
// Returns:
//   float: Interpolated value from the eight corner values
float trilerp(
    float v000, float v100, float v010, float v110,
    float v001, float v101, float v011, float v111,
    vec3 f) { // f = fract(coord)
    // Interpolate along X for each of the four bottom-face voxels
    float c00 = mix(v000, v100, f.x);
    float c10 = mix(v010, v110, f.x);
    float c01 = mix(v001, v101, f.x);
    float c11 = mix(v011, v111, f.x);

    // Interpolate those along Y
    float c0 = mix(c00, c10, f.y);
    float c1 = mix(c01, c11, f.y);

    // Final interpolation along Z
    return mix(c0, c1, f.z);
}

// ========================================
// BRICK CACHE SAMPLING
// ========================================

// Sample a value from the brick cache texture
// Converts brick coordinates and voxel position to texture coordinates for sampling
//
// Parameters:
//   brickCacheCoord - vec3: 3D coordinates of the brick within the brick cache
//   voxelInBrick - vec3: 3D coordinates of the voxel within the brick (0-31 in each dimension)
//
// Returns:
//   float: Sampled voxel value from the brick cache texture (typically normalized 0.0-1.0)
float sampleBrick(vec3 brickCacheCoord, vec3 voxelInBrick) {
    vec3 brickCacheCoordNormalized = vec3(
        (float(brickCacheCoord.x) * BRICK_SIZE + float(voxelInBrick.x)) / BRICK_CACHE_SIZE_X,
        (float(brickCacheCoord.y) * BRICK_SIZE + float(voxelInBrick.y)) / BRICK_CACHE_SIZE_Y,
        (float(brickCacheCoord.z) * BRICK_SIZE + float(voxelInBrick.z)) / BRICK_CACHE_SIZE_Z
    );
    return texture(brickCacheTex, brickCacheCoordNormalized).r;
}

void main(void) {

    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Initialize all render targets (multiple output textures)
    gRequest = vec4(0,0,0,0);  // Brick loading requests
    gUsage = vec4(0,0,0,0);    // Brick usage tracking
    gColor = vec4(0.0, 0.0, 0.0, 0.0);  // Final color output
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);  // Accumulated color

    // Generate random number for jittered sampling (reduces artifacts)
    float rnd = random();

    // Get the lowest available resolution level
    int lowestDataRes = getLowestRes();

    // ========================================
    // RAY-VOLUME INTERSECTION
    // ========================================
    
    // Normalize the view ray direction
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    
    // Calculate intersection with volume bounding box
    // Returns (entry_time, exit_time) for the ray-box intersection
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir);
    if (t_hit.x >= t_hit.y) { discard; }  // Ray misses volume entirely
    
    t_hit.x = max(t_hit.x, 0.0); // Clamp entry to 0 (no negative distances)
    float t = t_hit.x;
    
    // Calculate distance from camera for LOD selection
    float distance = abs((cameraCorrected / boxSize).z + (ws_rayDir / boxSize).z * t );

    // ========================================
    // COORDINATE SPACE CONVERSION
    // ========================================
    
    // Convert from world space to object space (normalized 0-1 coordinates)
    float ws2os = length(ws_rayDir / boxSize);  // Scale factor for conversion
    float t_hit_min_os = t_hit.x * ws2os;       // Entry point in object space
    float t_hit_max_os = t_hit.y * ws2os;       // Exit point in object space
    float t_os = t_hit_min_os;                  // Current position in object space

    // Calculate effective LOD factor based on volume size
    float voxelEdge = float(max(voxelExtents.x, max(voxelExtents.y, voxelExtents.z)));
    float lodFactorEffective = lodFactor * voxelEdge / 256.0;

    // ========================================
    // RESOLUTION AND SAMPLING SETUP
    // ========================================
    
    // Determine target resolution based on distance (LOD)
    int targetRes = getLOD(t, 0, 9, lodFactorEffective);
    
    // Set adaptive stepping resolution
    int stepResAdaptive = renderRes;
    int stepResEffective = clamp(stepResAdaptive, 0, lowestDataRes);

    // Convert ray to object space coordinates
    vec3 os_rayDir = normalize(ws_rayDir / boxSize);
    vec3 os_rayOrigin = cameraCorrected / boxSize + vec3(0.5);
    
    // Calculate step size based on current resolution
    float dt = voxelStepOS(stepResEffective, os_rayDir);

    // ========================================
    // SAMPLING POSITION INITIALIZATION
    // ========================================
    
    // Convert to normalized sampling coordinates (0-1 range)
    vec3 p = cameraCorrected + t_hit.x * ws_rayDir;
    p = p / boxSize + vec3(0.5); // Transform to 0-1 range
    
    // Calculate step vector in normalized space
    vec3 dp = (os_rayDir * dt);
    
    // Apply jittered sampling to reduce artifacts
    p += dp * (rnd);
    p = clamp(p, 0.0 + 0.0000028, 1.0 - 0.0000028);  // Avoid boundary issues

    // ========================================
    // RENDERING VARIABLES
    // ========================================
    
    // Color accumulation for front-to-back compositing
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;
    float alphaMultiplicator = 1.0;  // For alpha blending

    // Request tracking (for brick loading)
    bool overWrittenRequest = false;

    // Current state tracking
    vec3 currentTargetResPTCoord = vec3(0,0,0);
    int currentLOD = targetRes;

    // ========================================
    // CHANNEL-SPECIFIC CONSTANTS
    // ========================================
    
    // Pre-compute channel properties for efficiency
    vec3 [] c_color = vec3[7](getChannelColor(0), getChannelColor(1), getChannelColor(2), getChannelColor(3), getChannelColor(4), getChannelColor(5), getChannelColor(6));
    float [] c_opacity = float[7](getChannelOpacity(0), getChannelOpacity(1), getChannelOpacity(2), getChannelOpacity(3), getChannelOpacity(4), getChannelOpacity(5), getChannelOpacity(6));
    int [] c_res_min = int[7](getRes(0).x, getRes(1).x, getRes(2).x, getRes(3).x, getRes(4).x, getRes(5).x, getRes(6).x);
    int [] c_res_max = int[7](getRes(0).y, getRes(1).y, getRes(2).y, getRes(3).y, getRes(4).y, getRes(5).y, getRes(6).y);
    
    // ========================================
    // PER-CHANNEL STATE ARRAYS
    // ========================================
    
    // Current state for each channel
    int []   c_res_current =             int[7](0,0,0,0,0,0,0);
    float [] c_val_current =             float[7](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    vec3 []  c_brickCacheCoord_current = vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 []  c_voxel_current =           vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 []  c_ptCoord_current =         vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    int []   c_renderMode_current =      int[7](-1, -1, -1, -1, -1, -1, -1);
    int []   c_res_prev =                int[7](-1,-1,-1,-1,-1,-1,-1);
    
    // Adjacent brick caching for interpolation
    vec3 []  c_PT_X_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_Y_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_Z_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_XYZ_adjacent =         vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec4 []  c_brick_X_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_Y_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_Z_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_XYZ_adjacent =      vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));

    // Min/max tracking for MIP/MinIP rendering
    float [] c_minVal = float[7](-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0);
    float [] c_maxVal = float[7](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

    // Per-resolution coordinate tracking
    vec3 [] r_ptCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_voxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevPTCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevVoxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));

    bool resolutionChanged = false;
    int reps = 0;

    // ========================================
    // MAIN RAY-MARCHING LOOP
    // ========================================
    
    // Continue marching until we exit the volume or reach maximum opacity
    while (t_os < t_hit_max_os && t_os >= t_hit_min_os
        && vec3_max(p) < 1.0 && vec3_min(p) >= 0.0
    ) {

        // Reset per-sample accumulation
        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // Update target resolution based on current distance (with jitter)
        targetRes = getLOD(t, 0, 9, lodFactorEffective * (0.999 + 0.002 * rnd));

        // ========================================
        // RESOLUTION CHANGE HANDLING
        // ========================================
        
        if (targetRes != currentLOD) {
            currentLOD = targetRes;
            stepResAdaptive++;
            stepResEffective = clamp(stepResAdaptive, 0, lowestDataRes);
            
            // Adjust sampling position for new resolution
            p -= dp * rnd;
            dt = voxelStepOS(stepResEffective, os_rayDir);
            dp = os_rayDir * dt;
            p += dp * rnd;
            resolutionChanged = true;

            // Check bounds after resolution change
            if (p.x < 0.0 || p.x >= 1.0 || p.y < 0.0 || p.y >= 1.0 || p.z < 0.0 || p.z >= 1.0) {
                break;
            }
        } else {
            resolutionChanged = false;
        }

        // ========================================
        // UPDATE COORDINATES FOR ALL RESOLUTIONS
        // ========================================
        
        // Calculate page table coordinates and voxel positions for all resolution levels
        for (int r = 0; r < 10; r++) {
            r_prevPTCoord[r] = r_ptCoord[r];
            r_prevVoxel[r] = r_voxel[r];
            r_ptCoord[r] = getBrickFromNormalized(p, r);
            r_voxel[r] = getVoxelFromNormalized(p, r);
        }

        // ========================================
        // RENDER MODE DEFINITIONS
        // ========================================
        // 0: empty brick (no data)
        // 1: constant brick (uniform value)
        // 2: voxel brick (variable data)

        vec3 sliceColor = vec3(0.0);
        float sliceAlpha = 0.0;

        // ========================================
        // MULTI-CHANNEL SAMPLING
        // ========================================
        
        // Process each channel independently
        for (int c = 0; c < 7; c++) {
            // Skip channels with zero opacity
            if (c_opacity[c] <= 0.000001) {
                continue;
            } else if (channelMapping[c] == -1) {
                continue;
            }

            int slot = channelMapping[c];

            bool newBrick = false;
            bool newVoxel = false;
            int bestRes = clamp(targetRes, c_res_min[c], c_res_max[c]);

            // Check if we need to load a new brick at a better resolution
            bool betterResChanged = false;
            for (int r = bestRes; r <= c_res_current[c]; r++ ) {
                if (r_ptCoord[r] != r_prevPTCoord[r]) {
                    betterResChanged = true;
                    break;
                }
            }

            // Determine if we need to load new brick data
            if (r_ptCoord[bestRes] != r_prevPTCoord[bestRes]
                || c_renderMode_current[c] == -1
                || resolutionChanged == true
                || betterResChanged
                ) {
                newBrick = true;
                newVoxel = true;
            } else if (c_renderMode_current[c] == 2) {
                newVoxel = true;
            } else if (c_renderMode_current[c] == 0) {
                continue;  // Skip empty bricks
            }

            // ========================================
            // BRICK LOADING AND CACHING
            // ========================================
            
            if (newBrick) {
                // Query page table for brick location and status
                ivec4 brickCacheInfo = getBrickLocation(p, bestRes, slot, rnd, true, c);
                if (brickCacheInfo.w == -1 || brickCacheInfo.w == -2) {
                    // Empty brick - no data available
                    c_val_current[c] = 0.0;
                    c_renderMode_current[c] = 0;
                    c_minVal[c] = 0.0;
                    continue;
                } else if (brickCacheInfo.w == -3) {
                    // Solid brick - constant maximum value
                    c_val_current[c] = 1.0;
                    c_renderMode_current[c] = 1;
                    c_maxVal[c] = 1.0;
                    newVoxel = false;
                } else if (brickCacheInfo.w == -4) {
                    // Constant brick - uniform value
                    float val = float(brickCacheInfo.x);
                    c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));
                    c_renderMode_current[c] = 1;
                    newVoxel = false;
                } else if (brickCacheInfo.w >= 0) {
                    // Voxel brick - variable data, load from cache
                    c_res_current[c] = brickCacheInfo.w;
                    c_ptCoord_current[c] = r_ptCoord[c_res_current[c]];
                    c_brickCacheCoord_current[c] = vec3(brickCacheInfo.xyz);
                    c_renderMode_current[c] = 2;
                    newVoxel = true;
                    
                    // Track brick usage for cache management
                    if (int(floor(rnd * float(maxChannels))) == c) {
                        setUsage(brickCacheInfo.xyz, t_hit_min_os, t_hit_max_os, t_os, rnd);
                    }
                }
            }
            
            // ========================================
            // VOXEL SAMPLING WITH INTERPOLATION
            // ========================================
            
            if (newVoxel) {
                c_voxel_current[c] = r_voxel[c_res_current[c]];

                reps++;
                
                // Calculate position within the brick (0-31 range)
                vec3 voxelInBrick = mod(c_voxel_current[c], 32.0);
                vec3 clampedVoxelInBrick = clamp(voxelInBrick, 0.5, 31.5);
                // Sample the brick cache texture
                float val = sampleBrick(c_brickCacheCoord_current[c].xyz, clampedVoxelInBrick);

                // ========================================
                // HIGH-QUALITY INTERPOLATION (renderRes == 0)
                // ========================================
                
                if (renderRes == 0) {
                    
                    // Check if we're near brick boundaries (need interpolation)
                    bvec3 clampedMin = lessThan(voxelInBrick, clampedVoxelInBrick);
                    bvec3 clampedMax = greaterThan(voxelInBrick, clampedVoxelInBrick);
                    bvec3 clamped = bvec3(clampedMin.x || clampedMax.x, clampedMin.y || clampedMax.y, clampedMin.z || clampedMax.z);
                    vec3 diff = voxelInBrick - clampedVoxelInBrick;
                    
                    if (any(clampedMin) || any(clampedMax)) {                       
                        int boundaryAxes = int(clamped.x) + int(clamped.y) + int(clamped.z);
                        float f = 0.0;
                                                
                        if (boundaryAxes == 1) {
                            // Linear interpolation across one boundary
                            vec3 otherGlobalVoxelPos = vec3(0,0,0);
                            vec3 otherP = vec3(0,0,0);
                            float otherVoxelVal = 0.0;

                            // Determine which axis we're interpolating across
                            if (clampedMin.x) {
                                otherGlobalVoxelPos = c_voxel_current[c] - vec3(1.0, 0.0, 0.0);
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.x);
                            } else if (clampedMax.x) {
                                otherGlobalVoxelPos = c_voxel_current[c] + vec3(1.0, 0.0, 0.0);
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.x);
                            } else if (clampedMin.y) {
                                otherGlobalVoxelPos = c_voxel_current[c] - vec3(0.0, 1.0, 0.0);
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.y);
                            } else if (clampedMax.y) {
                                otherGlobalVoxelPos = c_voxel_current[c] + vec3(0.0, 1.0, 0.0);
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.y);
                            } else if (clampedMin.z) {
                                otherGlobalVoxelPos = c_voxel_current[c] - vec3(0.0, 0.0, 1.0);
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.z);
                            } else if (clampedMax.z) {
                                otherGlobalVoxelPos = c_voxel_current[c] + vec3(0.0, 0.0, 1.0); 
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.z);
                            }

                            // Sample the neighboring voxel
                            vec3 otherPTcoord = getBrickFromNormalized(otherP, c_res_current[c]);
                            vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0);
                            otherVoxelInBrick -= diff;

                            // Check if neighbor is outside volume bounds
                            if (otherP.x < 0.0 || otherP.x >= 1.0 || otherP.y < 0.0 || otherP.y >= 1.0 || otherP.z < 0.0 || otherP.z >= 1.0) {
                                otherVoxelVal = val;
                            } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz) {
                                // Use cached adjacent brick
                                otherVoxelVal = sampleBrick(c_brick_XYZ_adjacent[c].xyz, otherVoxelInBrick);
                            } else {
                                // Load new adjacent brick
                                ivec4 otherBrickCacheInfo = getBrickLocation(otherP, c_res_current[c], slot, rnd, false, c); 
                                float otherVoxelVal;
                                if (otherBrickCacheInfo.w == -1 || otherBrickCacheInfo.w == -2) {
                                    otherVoxelVal = val;
                                } else if (otherBrickCacheInfo.w == -3) {
                                    otherVoxelVal = 1.0;
                                } else if (otherBrickCacheInfo.w == -4) {
                                    otherVoxelVal = float(otherBrickCacheInfo.x);
                                } else {
                                    otherVoxelVal = sampleBrick(vec3(otherBrickCacheInfo.xyz), otherVoxelInBrick);
                                }
                                c_PT_XYZ_adjacent[c] = getBrickFromVoxel(otherGlobalVoxelPos, c_res_current[c]); 
                                c_brick_XYZ_adjacent[c] = vec4(otherBrickCacheInfo);
                            }
                            
                            // Perform linear interpolation
                            float originalVal = val;
                            val = lerp(originalVal, otherVoxelVal, f);                            
                        } else if (boundaryAxes == 2) {
                            // Bilinear interpolation across two boundaries
                            vec3 offA = vec3(0.0);
                            vec3 offB = vec3(0.0);
                            vec2 f = vec2(0.0);

                            // Determine which two axes we're interpolating across
                            if (clamped.x && clamped.y) {
                                offA.x = clampedMin.x ? -1.0 : 1.0;
                                offB.y = clampedMin.y ? -1.0 : 1.0;
                                f = vec2(abs(diff.x), abs(diff.y));
                            } else if (clamped.x && clamped.z) {
                                offA.x = clampedMin.x ? -1.0 : 1.0;
                                offB.z = clampedMin.z ? -1.0 : 1.0;
                                f = vec2(abs(diff.x), abs(diff.z));
                            } else if (clamped.y && clamped.z) {
                                offA.y = clampedMin.y ? -1.0 : 1.0;
                                offB.z = clampedMin.z ? -1.0 : 1.0;
                                f = vec2(abs(diff.y), abs(diff.z));
                            }

                            // Macro for sampling at offset positions
                            #define SAMPLE_AT_OFFSET(OFF, DEST)                                         \
                            {                                                                           \
                                vec3 otherGlobalVoxelPos = c_voxel_current[c] + (OFF);                  \
                                vec3 otherP              = getNormalizedFromVoxel(                      \
                                                             otherGlobalVoxelPos, c_res_current[c]);    \
                                                                                                        \
                                if ( any(lessThan(otherP, vec3(0.0)))                                   \
                                  || any(greaterThanEqual(otherP, vec3(1.0))) ) {                       \
                                    DEST = val;                                                         \
                                } else {                                                                \
                                    vec3 otherPTcoord      = getBrickFromNormalized(                    \
                                                                otherP, c_res_current[c]);             \
                                    vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0) - diff;     \
                                                                                                        \
                                    bool matched = false;                                               \
                                    if (otherPTcoord == c_PT_X_adjacent[c].xyz)   {                         \
                                        DEST = sampleBrick(c_brick_X_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_Y_adjacent[c].xyz) {                    \
                                        DEST = sampleBrick(c_brick_Y_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_Z_adjacent[c].xyz) {                    \
                                        DEST = sampleBrick(c_brick_Z_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz) {                  \
                                        DEST = sampleBrick(c_brick_XYZ_adjacent[c].xyz, otherVoxelInBrick); \
                                        matched = true;                                                 \
                                    }                                                                   \
                                                                                                        \
                                    if (!matched) {                                                     \
                                        ivec4 info = getBrickLocation(otherP,                           \
                                                                      c_res_current[c], slot,              \
                                                                      rnd, false, c);                      \
                                        if (info.w == -1 || info.w == -2) {                            \
                                            DEST = val;                                                 \
                                        } else if (info.w == -3) {                                      \
                                            DEST = 1.0;                                                 \
                                        } else if (info.w == -4) {                                      \
                                            DEST = float(info.x);                                       \
                                        } else {                                                        \
                                            DEST = sampleBrick(vec3(info.xyz), otherVoxelInBrick);      \
                                        }                                                               \
                                        if (abs((OFF).x) > 0.5 && abs((OFF).y) < 0.5 && abs((OFF).z) < 0.5) {             \
                                            c_PT_X_adjacent[c]  = otherPTcoord;                                     \
                                            c_brick_X_adjacent[c] = vec4(info);                                 \
                                        } else if (abs((OFF).y) > 0.5 && abs((OFF).x) < 0.5 && abs((OFF).z) < 0.5) {      \
                                            c_PT_Y_adjacent[c]  = otherPTcoord;                                     \
                                            c_brick_Y_adjacent[c] = vec4(info);                                 \
                                        } else if (abs((OFF).z) > 0.5 && abs((OFF).x) < 0.5 && abs((OFF).y) < 0.5) {      \
                                            c_PT_Z_adjacent[c]  = otherPTcoord;                                     \
                                            c_brick_Z_adjacent[c] = vec4(info);                                 \
                                        } else {                                                                  \
                                            c_PT_XYZ_adjacent[c]     = otherPTcoord;                        \
                                            c_brick_XYZ_adjacent[c]  = vec4(info);                      \
                                        }                                                                       \
                                    }                                                                   \
                                }                                                                       \
                            }
                            
                            // Sample the four corners for bilinear interpolation
                            float v00 = val;
                            float v10; float v01; float v11;
                            SAMPLE_AT_OFFSET(offA, v10);
                            SAMPLE_AT_OFFSET(offB, v01);
                            SAMPLE_AT_OFFSET(offA + offB, v11);

                            val = bilerp(v00, v10, v01, v11, f);

                            #undef SAMPLE_AT_OFFSET

                        } else if (boundaryAxes == 3) {
                            // Trilinear interpolation across all three boundaries
                            
                            vec3 offA = vec3(0.0);
                            vec3 offB = vec3(0.0);
                            vec3 offC = vec3(0.0);
                            vec3 f = vec3(0.0);

                            offA.x = clampedMin.x ? -1.0 : 1.0;
                            offB.y = clampedMin.y ? -1.0 : 1.0;
                            offC.z = clampedMin.z ? -1.0 : 1.0;

                            f = vec3(abs(diff.x), abs(diff.y), abs(diff.z));

                            // Macro for sampling at offset positions
                            #define SAMPLE_AT_OFFSET(OFF, DEST) \
                                { \
                                    vec3 otherGlobalVoxelPos = c_voxel_current[c] + (OFF); \
                                    vec3 otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]); \
                                    if (any(lessThan(otherP, vec3(0.0))) || any(greaterThanEqual(otherP, vec3(1.0)))) { \
                                        DEST = val; \
                                    } else { \
                                        vec3 otherPTcoord      = getBrickFromNormalized(otherP, c_res_current[c]);             \
                                        vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0) - diff;     \
                                        if (otherPTcoord == c_PT_X_adjacent[c])   {                         \
                                            DEST = sampleBrick(c_brick_X_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_Y_adjacent[c].xyz) {                    \
                                            DEST = sampleBrick(c_brick_Y_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_Z_adjacent[c].xyz) {                    \
                                            DEST = sampleBrick(c_brick_Z_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz) {                  \
                                            DEST = sampleBrick(c_brick_XYZ_adjacent[c].xyz, otherVoxelInBrick); \
                                        } else {                                                               \
                                            ivec4 otherBrickCacheInfo = getBrickLocation(otherP, c_res_current[c], slot, rnd, false, c); \
                                            vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0) - diff; \
                                            if (otherBrickCacheInfo.w == -1 || otherBrickCacheInfo.w == -2) { \
                                                DEST = val; \
                                            } else if (otherBrickCacheInfo.w == -3) { \
                                                DEST = 1.0; \
                                            } else if (otherBrickCacheInfo.w == -4) { \
                                                DEST = float(otherBrickCacheInfo.x); \
                                            } else { \
                                                DEST = sampleBrick(vec3(otherBrickCacheInfo.xyz), otherVoxelInBrick); \
                                            } \
                                        } \
                                    } \
                                }
                            
                            // Sample all eight corners for trilinear interpolation
                            float v000 = val;
                            float v100; float v010; float v001; float v110; float v101; float v011; float v111;
                            SAMPLE_AT_OFFSET(offA, v100);
                            SAMPLE_AT_OFFSET(offB, v010);
                            SAMPLE_AT_OFFSET(offC, v001);
                            SAMPLE_AT_OFFSET(offA + offB, v110);
                            SAMPLE_AT_OFFSET(offA + offC, v101);
                            SAMPLE_AT_OFFSET(offB + offC, v011);
                            SAMPLE_AT_OFFSET(offA + offB + offC, v111);

                            val = trilerp(v000, v100, v010, v001, v110, v101, v011, v111, f);

                            #undef SAMPLE_AT_OFFSET
                            
                        }

                    } else {
                        // No boundary interpolation needed - clear adjacent brick cache
                        c_PT_X_adjacent[c] = c_PT_Y_adjacent[c] = c_PT_Z_adjacent[c] = vec3(-1.0);
                        c_brick_X_adjacent[c] = c_brick_Y_adjacent[c] = c_brick_Z_adjacent[c] = vec4(-1.0);
                    }
                }

                // ========================================
                // VALUE NORMALIZATION AND TRACKING
                // ========================================
                
                // Normalize value to 0-1 range using channel-specific contrast limits
                c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));
                c_res_prev[c] = c_res_current[c];

                // Track min/max values for MIP/MinIP rendering
                if (c_minVal[c] == -1.0) {
                    c_minVal[c] = c_val_current[c];
                } else {
                    c_minVal[c] = min(c_minVal[c], c_val_current[c]);
                }
                c_maxVal[c] = max(c_maxVal[c], c_val_current[c]);

            }

            // ========================================
            // BRICK REQUEST GENERATION
            // ========================================
            
            // Request higher resolution bricks if we're using lower resolution than optimal
            if (!overWrittenRequest 
                && c_res_current[c] != bestRes
                && c_val_current[c] > 0.0
                && c_renderMode_current[c] == 2
                && int(floor(rnd * float(maxChannels))) == c) {
                setBrickRequest(p, bestRes, slot, rnd);
                overWrittenRequest = true;
            }

            // ========================================
            // CHANNEL COMPOSITING
            // ========================================
            
            // Accumulate this channel's contribution
            total += c_val_current[c];
            rgbCombo += c_val_current[c] * c_color[c];

        }

        // ========================================
        // FRONT-TO-BACK COMPOSITING
        // ========================================
        
        // Clamp total intensity and calculate alpha
        total = clamp(total, 0.0, 1.0);
        sliceAlpha = total * opacity * dt * 32.0;  // Scale by step size and brick size
        sliceColor = rgbCombo;

        // Front-to-back alpha blending
        outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
        outColor.a += sliceAlpha * alphaMultiplicator;
        alphaMultiplicator *= (1.0 - sliceAlpha);

        // Early termination for opaque regions (standard rendering only)
        if (outColor.a > 0.99 && u_renderstyle == 0) { break; }

        // ========================================
        // ADVANCE RAY POSITION
        // ========================================
        
        // Move to next sample position
        t += dt;
        p += dp;
        t_os += dt;
    }

    // ========================================
    // RENDERING STYLE POST-PROCESSING
    // ========================================
    
    if (u_renderstyle == 1) { 
        // Minimum Intensity Projection (MinIP)
        // Shows the minimum value encountered along each ray
        outColor = vec4(0.0);
        for (int c = 0; c < 7; c++) {
            if (c_color[c] != vec3(0.0, 0.0, 0.0)) {
                outColor.rgb += c_minVal[c] * c_color[c];
                outColor.a += c_minVal[c];
            }
        }
    } else if (u_renderstyle == 0) { 
        // Maximum Intensity Projection (MIP)
        // Shows the maximum value encountered along each ray
        outColor = vec4(0.0);
        for (int c = 0; c < 7; c++) {
            if (c_color[c] != vec3(0.0, 0.0, 0.0)) {
                outColor.rgb += c_maxVal[c] * c_color[c];
            }
        }
        outColor.a = 1.0;
    }

    // ========================================
    // FINAL OUTPUT
    // ========================================
    
    // Convert from linear to sRGB color space and set all render targets
    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);
    
}
