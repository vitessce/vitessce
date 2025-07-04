// #include <packing>
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler3D;
in vec3 rayDirUnnorm;
in vec3 cameraCorrected;
uniform sampler3D brickCacheTex;
uniform usampler3D pageTableTex;
// render constants
uniform int u_renderstyle;
uniform float opacity;
uniform highp vec3 boxSize;
// per channel min max values
uniform vec2 clim0;
uniform vec2 clim1;
uniform vec2 clim2;
uniform vec2 clim3;
uniform vec2 clim4;
uniform vec2 clim5;
uniform vec2 clim6;
uniform vec2 xClip;
uniform vec2 yClip;
uniform vec2 zClip;
// rgb -- color values, a -- visibility (boolean)
uniform vec4 color0;
uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;
uniform vec4 color4;
uniform vec4 color5;
uniform vec4 color6;
// maps colors to physical spaces
uniform int channelMapping[7];
// stepsize, correlates with resolution
uniform int renderRes;
// resolution 0 voxel extents
uniform uvec3 voxelExtents;

// global range of requested resolutions
uniform ivec2 resGlobal;
// max number of channels (relevant for the cache statistics)
// between 1 and 7
uniform int maxChannels;

// per color channel resolution range
uniform ivec2 res0;
uniform ivec2 res1;
uniform ivec2 res2;
uniform ivec2 res3;
uniform ivec2 res4;
uniform ivec2 res5;
uniform ivec2 res6;
uniform ivec2 res7;

// controls how fast we decrease the resolution
uniform float lodFactor;

// per resolution anchor point for pagetable
uniform uvec3 anchor0;
uniform uvec3 anchor1;
uniform uvec3 anchor2;
uniform uvec3 anchor3;
uniform uvec3 anchor4;
uniform uvec3 anchor5;
uniform uvec3 anchor6;
uniform uvec3 anchor7;
uniform uvec3 anchor8;
uniform uvec3 anchor9;

// per resolution downsample factor
uniform vec3 scale0; // should be 1 1 1
uniform vec3 scale1;
uniform vec3 scale2;
uniform vec3 scale3;
uniform vec3 scale4;
uniform vec3 scale5;
uniform vec3 scale6;
uniform vec3 scale7;
uniform vec3 scale8;
uniform vec3 scale9;

// output buffers
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gRequest;
layout(location = 2) out vec4 gUsage;

// constants
const float BRICK_SIZE = 32.0;
const float BRICK_CACHE_SIZE_X = 2048.0;
const float BRICK_CACHE_SIZE_Y = 2048.0;
const float BRICK_CACHE_SIZE_Z = 128.0;

/**
 * calculating the intersection of the ray with the bounding box
 */
vec2 intersect_hit(vec3 orig, vec3 dir) {
    vec3 boxMin = vec3(-0.5) * boxSize;
    vec3 boxMax = vec3(0.5) * boxSize;
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
    vec3 invDir = 1.0 / dir;
    vec3 tmin0 = (boxMin - orig) * invDir;
    vec3 tmax0 = (boxMax - orig) * invDir;
    vec3 tmin = min(tmin0, tmax0);
    vec3 tmax = max(tmin0, tmax0);
    float t0 = max(tmin.x, max(tmin.y, tmin.z));
    float t1 = min(tmax.x, min(tmax.y, tmax.z));
    return vec2(t0, t1);
}

/**
 * random number generator based on the uv coordinate
 * Author @patriciogv - 2015
 * http://patriciogonzalezvivo.com
 */
float random() {
    return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

/**
 * color space conversion
 */
float linear_to_srgb(float x) {
    if (x <= 0.0031308f) {
        return 12.92f * x;
    }
    return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;
}

/**
 * color space conversion
 */
vec4 linear_to_srgb(vec4 x) {
    return vec4(linear_to_srgb(x.r), linear_to_srgb(x.g), linear_to_srgb(x.b), x.a);
}

/**
 * transform the pagetable coordinate into a RGBA8 value
 */
vec4 packPTCoordToRGBA8(uvec3 coord) {

    uint x = coord.x & 0x3FFu; // 10 bits
    uint y = coord.y & 0x3FFu; // 10 bits
    uint z = coord.z & 0xFFFu; // 12 bits

    uint packed =
        (x << 22u) |
        (y << 12u) |
        (z);

    // Decompose into RGBA
    return vec4(
        float((packed >> 24u) & 0xFFu) / 255.0,
        float((packed >> 16u) & 0xFFu) / 255.0,
        float((packed >> 8u) & 0xFFu) / 255.0,
        float(packed & 0xFFu) / 255.0
    );
}

/**
 * get the anchor point per resolution
 */
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

/**
 * get the lowest resolution
 */
int getLowestRes() {
    for (int i = 0; i < 10; i++) {
        if (getAnchorPoint(i) == uvec3(0,0,0)) {
            return i - 1;
        }
    }
    return 9;
}

/**
 * get the downsample factor per resolution
 */
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

/**
 * get the resolution range per color channel
 */
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

/**
 * get the min max values per color channel
 */
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

/**
 * get the voxel coordinate in the specified resolution from the normalized coordinate
 */
vec3 getVoxelFromNormalized(vec3 normalized, int res) {
    vec3 extents = (vec3(voxelExtents) / getScale(res)); // should be voxelExtents per res
    vec3 voxel = normalized * extents;
    return voxel;
}

/**
 * get the normalized coordinate based on the voxel coordinate in the specified resolution
 */
vec3 getNormalizedFromVoxel(vec3 voxel, int res) {
    vec3 extents = (vec3(voxelExtents) / getScale(res)); // should be voxelExtents per res
    vec3 normalized = voxel / extents;
    return normalized;
}

/**
 * get the brick coordinate in the specified resolution based on the normalized coordinate
 * needed for pagetable cactulations
 */
vec3 getBrickFromNormalized(vec3 normalized, int res) {
    vec3 voxel = getVoxelFromNormalized(normalized, res);
    vec3 brick = floor(voxel / 32.0);
    return brick;
}

/**
 * get the brick coordinate in the specified resolution based on the voxel coordinate
 */
vec3 getBrickFromVoxel(vec3 voxel, int res) {
    vec3 brick = floor(voxel / 32.0);
    return brick;
}

/**
 * get the vector for the specified channel slot in the pagetable
 */
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

/**
 * get the color per color channel
 */
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

/**
 * get the opacity (used as visibility) per color channel
 */
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

/**
 * retrieving the brick based on:
 * location -- normalized coordinate
 * targetRes -- target resolution
 * channel -- physical channel slot
 * rnd -- random number for jittering requests 
 * query -- whether to query the brick (we dont query for interblock interpolation)
 * colorIndex -- color index for querying the min max values
 * 
 * returns:
 * w >= 0 -- xyz contains brick cache coordinate, w stores resolution
 * w == -1 -- not resident in any resolution, should be treated as empty
 * w == -2 -- empty (with respect to current transfer function)
 * w == -3 -- constant full (with respect to current transfer function)
 * w == -4 -- constant value within range, x stores that value
 *
 * bit layout:
 * [1] 31    | 0 — flag resident
 * [1] 30    | 1 — flag init
 * [7] 23…29 | 2…8 — min → 128
 * [7] 16…22 | 9…15 — max → 128
 * [6] 10…15 | 16…21 — x offset in brick cache → max 64
 * [6] 4…9   | 22…27 — y offset in brick cache →  max 64
 * [4] 0…3   | 28…31 — z offset in brick cache → max 16, effectively 4
*/
ivec4 getBrickLocation(vec3 location, int targetRes, int channel, float rnd, bool query, int colorIndex) {

    // min max for current color 
    vec2 clim = getClim(colorIndex);

    // resolution ranges, TODO: connect this back to color
    int channelMin = getRes(channel).x;
    int channelMax = getRes(channel).y;
    int currentRes = clamp(targetRes, channelMin, channelMax);
    currentRes = clamp(currentRes, resGlobal.x, resGlobal.y);
    int lowestRes = clamp(resGlobal.y, channelMin, channelMax);

    // request the current channel based on probability
    bool requestChannel = false;
    if (int(floor(rnd * float(maxChannels))) == colorIndex) {
        requestChannel = true;
    }

    // loop through resolutions
    while (currentRes <= lowestRes) {

        // calculate pagetable coordinate
        uvec3 anchorPoint = getAnchorPoint(currentRes);
        vec3 brickLocation = getBrickFromNormalized(location, currentRes);
        uvec3 channelOffset = getChannelOffset(channel);
        vec3 coordinate = floor(vec3(anchorPoint * channelOffset)) + brickLocation;
        if (currentRes == 0) {
            int zExtent = int(ceil(float(voxelExtents.z) / 32.0));
            coordinate = vec3(anchorPoint) + vec3(0.0, 0.0, zExtent * channel) + brickLocation;
        }

        // get PT entry
        uint ptEntry = texelFetch(pageTableTex, ivec3(coordinate), 0).r;

        // check if the PT entry is initialized
        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) && query == true) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            continue;
        }

        // get the min max values of the brick
        uint umin = ((ptEntry >> 23u) & 0x7Fu);
        uint umax = ((ptEntry >> 16u) & 0x7Fu);
        float min = float(int(umin)) / 127.0;
        float max = float(int(umax)) / 127.0;

        // exit early if brick is constant
        if (float(max) <= clim.x) {
            return ivec4(0,0,0,-2);
            // EMPTY
        } else if (float(min) >= clim.y) {
            return ivec4(0,0,0,-3);
            // CONSTANT FULL
        } else if ((umax - umin) < 2u) {
            // CONSTANT OTHER VALUE
            return ivec4(min,0,0,-4);
        }

        // return brick cache location if resident
        // continue to next resolution if not resident
        uint isResident = (ptEntry >> 31u) & 1u;
        if (isResident == 0u) {
            currentRes++;
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) && query == true) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            continue;
        } else {
            uint xBrickCache = (ptEntry >> 10u) & 0x3Fu;
            uint yBrickCache = (ptEntry >> 4u) & 0x3Fu;
            uint zBrickCache = ptEntry & 0xFu;
            uvec3 brickCacheCoord = uvec3(xBrickCache, yBrickCache, zBrickCache);

            return ivec4(brickCacheCoord, currentRes);
        }
    }

    // not resident in any resolution, should be treated as empty
    return ivec4(0,0,0,-1);
}

/**
 * set the brick request for the specified slot channel
 */
void setBrickRequest(vec3 location, int targetRes, int channel, float rnd) {
    uvec3 anchorPoint = getAnchorPoint(targetRes);
    vec3 brickLocation = getBrickFromNormalized(location, targetRes);
    uvec3 channelOffset = getChannelOffset(channel);
    vec3 coordinate = floor(vec3(anchorPoint * channelOffset)) + brickLocation;
    if (targetRes == 0) {
        int zExtent = int(ceil(float(voxelExtents.z) / 32.0));
        coordinate = vec3(anchorPoint) + vec3(0.0, 0.0, zExtent * channel) + brickLocation;
    }
    if (int(floor(rnd * float(maxChannels))) == channel) {
        gRequest = packPTCoordToRGBA8(uvec3(coordinate));
    }
}

/**
 * set the usage for the specified brick
 */
void setUsage(ivec3 brickCacheOffset, float t_hit_min_os, float t_hit_max_os, float t_os, float rnd) {
    float normalized_t_os = (t_os - t_hit_min_os) / (t_hit_max_os - t_hit_min_os); // should be between 0 and 1
    if (normalized_t_os <= rnd || gUsage == vec4(0.0, 0.0, 0.0, 0.0)) {
        gUsage = vec4(vec3(brickCacheOffset) / 255.0, 1.0);
    }
}

/**
 * get the max value of a vec3
 */
float vec3_max(vec3 v) {
    return max(v.x, max(v.y, v.z));
}

/**
 * get the min value of a vec3
 */
float vec3_min(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

/**
 * get the LOD based on the distance to the camera
 */
int getLOD(float distance, int highestRes, int lowestRes, float lodFactor) {
    int lod = int(log2(distance * lodFactor));
    return clamp(lod, highestRes, lowestRes);
}

/**
 * get the voxel step in object space
 */
float voxelStepOS(int res, vec3 osDir) {
    vec3 voxelSize = getScale(res) / vec3(voxelExtents);
    vec3 dt_vec = voxelSize / abs(osDir);
    return min(dt_vec.x, min(dt_vec.y, dt_vec.z));
}

/**
 * linear interpolation
 */
float lerp(float v0, float v1, float fx) {
    return mix(v0, v1, fx); // (1-fx)·v0 + fx·v1
}

/**
 * bilinear interpolation
 */
float bilerp(float v00, float v10, float v01, float v11, vec2 f) {
    float c0 = mix(v00, v10, f.x); // interpolate in X on bottom row
    float c1 = mix(v01, v11, f.x); // interpolate in X on top row
    return mix(c0, c1, f.y); // now interpolate those in Y
}

/**
 * trilinear interpolation
 */
float trilerp(
    float v000, float v100, float v010, float v110,
    float v001, float v101, float v011, float v111,
    vec3 f) { // f = fract(coord)
    // interpolate along X for each of the four bottom-face voxels
    float c00 = mix(v000, v100, f.x);
    float c10 = mix(v010, v110, f.x);
    float c01 = mix(v001, v101, f.x);
    float c11 = mix(v011, v111, f.x);

    // interpolate those along Y
    float c0 = mix(c00, c10, f.y);
    float c1 = mix(c01, c11, f.y);

    // final interpolation along Z
    return mix(c0, c1, f.z);
}

/**
 * sample the brick cache based on the brick cache coordinate and the in-brick coordinate
 */
float sampleBrick(vec3 brickCacheCoord, vec3 voxelInBrick) {
    vec3 brickCacheCoordNormalized = vec3(
        (float(brickCacheCoord.x) * BRICK_SIZE + float(voxelInBrick.x)) / BRICK_CACHE_SIZE_X,
        (float(brickCacheCoord.y) * BRICK_SIZE + float(voxelInBrick.y)) / BRICK_CACHE_SIZE_Y,
        (float(brickCacheCoord.z) * BRICK_SIZE + float(voxelInBrick.z)) / BRICK_CACHE_SIZE_Z
    );
    return texture(brickCacheTex, brickCacheCoordNormalized).r;
}

/**
 * main renderloop
*/
void main(void) {

    // initialize all render targets
    gRequest = vec4(0,0,0,0);
    gUsage = vec4(0,0,0,0);
    gColor = vec4(0.0, 0.0, 0.0, 0.0);

    // out color sums up our accumulated value before writing it into the gColor buffer
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);

    // random number for jittering
    float rnd = random();

    // get lowest resolution
    int lowestDataRes = getLowestRes();

    // normalize the view Ray & intersect with the volume bounds
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir);
    if (t_hit.x >= t_hit.y) { discard; }
    t_hit.x = max(t_hit.x, 0.0); // cap at 0
    float t = t_hit.x;
    float distance = abs((cameraCorrected / boxSize).z + (ws_rayDir / boxSize).z * t );

    // convert from world space to object space
    float ws2os = length(ws_rayDir / boxSize);  // scalar conversion factor
    float t_hit_min_os = t_hit.x * ws2os;       // entry distance in OS units
    float t_hit_max_os = t_hit.y * ws2os;       // exit  distance in OS units
    float t_os         = t_hit_min_os;          // our new marching parameter

    // voxel edge is the max extent of the volume
    float voxelEdge = float(max(voxelExtents.x, max(voxelExtents.y, voxelExtents.z)));

    // calculate LOD factor based on the voxel edge
    float lodFactorEffective = lodFactor * voxelEdge / 256.0;

    // initialize resolutions
    // target res based on the distance
    int targetRes = getLOD(t, 0, 9, lodFactorEffective);
    // render defines only stepping distance
    int stepResAdaptive = renderRes;
    int stepResEffective = clamp(stepResAdaptive, 0, lowestDataRes);

    // convert to object space
    vec3 os_rayDir = normalize(ws_rayDir / boxSize);
    vec3 os_rayOrigin = cameraCorrected / boxSize + vec3(0.5);
    float dt = voxelStepOS(stepResEffective, os_rayDir);

    // convert to normalized space
    vec3 p = cameraCorrected + t_hit.x * ws_rayDir;
    p = p / boxSize + vec3(0.5); // this gives us exactly 0..1
    vec3 dp = (os_rayDir * dt);
    p += dp * (rnd);
    p = clamp(p, 0.0 + 0.0000028, 1.0 - 0.0000028);

    // color accumulation variables, are calculated per 'slice'
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;

    // alpha accumulation variable runs globally
    float alphaMultiplicator = 1.0;

    // request tracking, if we have a request for a brick which not visible in lower
    // resolutions, we can overwrite it once
    bool overWrittenRequest = false;

    // current state tracking
    vec3 currentTargetResPTCoord = vec3(0,0,0);
    int currentLOD = targetRes;

    // constants per color channel
    vec3 [] c_color = vec3[7](getChannelColor(0), getChannelColor(1), getChannelColor(2), getChannelColor(3), getChannelColor(4), getChannelColor(5), getChannelColor(6));
    float [] c_opacity = float[7](getChannelOpacity(0), getChannelOpacity(1), getChannelOpacity(2), getChannelOpacity(3), getChannelOpacity(4), getChannelOpacity(5), getChannelOpacity(6));
    // resolution ranges (currently) per color channel
    // TODO: figure out how to hook it up with frontend
    int [] c_res_min = int[7](getRes(0).x, getRes(1).x, getRes(2).x, getRes(3).x, getRes(4).x, getRes(5).x, getRes(6).x);
    int [] c_res_max = int[7](getRes(0).y, getRes(1).y, getRes(2).y, getRes(3).y, getRes(4).y, getRes(5).y, getRes(6).y);
    
    // current state variables per color channel
    // current resolution
    int []   c_res_current =             int[7](0,0,0,0,0,0,0);
    // current value
    float [] c_val_current =             float[7](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    // current brick cache coordinate
    vec3 []  c_brickCacheCoord_current = vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    // current voxel in current resolution
    vec3 []  c_voxel_current =           vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    // current pagetable coordinate
    vec3 []  c_ptCoord_current =         vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    // current render mode -- 0: empty (add 0), 1: constant (add current val), 2: voxel (query new voxel)
    // upon change of PT we re-query anyways
    int []   c_renderMode_current =      int[7](-1, -1, -1, -1, -1, -1, -1);
    // current pagetable coordinate of the adjacent bricks in X, Y, Z or diagonal direction
    vec3 []  c_PT_X_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_Y_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_Z_adjacent =           vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 []  c_PT_XYZ_adjacent =         vec3[7](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    // corresponding brick coordinates of the adjacent bricks in X, Y, Z or diagonal direction
    vec4 []  c_brick_X_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_Y_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_Z_adjacent =        vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));
    vec4 []  c_brick_XYZ_adjacent =      vec4[7](vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0), vec4(-1.0));

    // min and max values of the current color
    // used for minimum/maximum intensity projection
    float [] c_minVal = float[7](-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0);
    float [] c_maxVal = float[7](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

    // pt coord and voxel per resolution
    vec3 [] r_ptCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_voxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevPTCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevVoxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));

    // resolution changed flag
    bool resolutionChanged = false;
    // number of repetitions (for debugging purposes)
    int reps = 0;

    // while we are 'in' the volume
    while (t_os < t_hit_max_os && t_os >= t_hit_min_os
        && vec3_max(p) < 1.0 && vec3_min(p) >= 0.0
    ) {
        // initialize slice values
        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // calculate target resolution based on distance and lod factor
        targetRes = getLOD(t, 0, 9, lodFactorEffective * (0.999 + 0.002 * rnd));

        // if target resolution changed, update the current resolution and stepsize
        if (targetRes != currentLOD) {
            currentLOD = targetRes;
            stepResAdaptive++;
            stepResEffective = clamp(stepResAdaptive, 0, lowestDataRes);
            p -= dp * rnd;
            dt = voxelStepOS(stepResEffective, os_rayDir);
            dp = os_rayDir * dt;
            p += dp * rnd;
            resolutionChanged = true;

            if (p.x < 0.0 || p.x >= 1.0 || p.y < 0.0 || p.y >= 1.0 || p.z < 0.0 || p.z >= 1.0) {
                break;
            }
        } else {
            resolutionChanged = false;
        }

        // update the ptCoord and voxel for every resolution
        for (int r = 0; r < 10; r++) {
            r_prevPTCoord[r] = r_ptCoord[r];
            r_prevVoxel[r] = r_voxel[r];
            r_ptCoord[r] = getBrickFromNormalized(p, r);
            r_voxel[r] = getVoxelFromNormalized(p, r);
        }

        // render modes:
        // 0: empty
        // 1: constant
        // 2: voxel

        // initialize the per channel slice values
        vec3 sliceColor = vec3(0.0);
        float sliceAlpha = 0.0;

        // iterate over up to 7 channels by color
        for (int c = 0; c < 7; c++) {
            // skip if opacity is 0 or if color is not mapped to a physical slot
            if (c_opacity[c] <= 0.000001) {
                continue;
            } else if (channelMapping[c] == -1) {
                continue;
            }

            // physical slot in pagetable
            int slot = channelMapping[c];

            // keep track of status
            bool newBrick = false;
            bool newVoxel = false;
            // best possible resolution
            int bestRes = clamp(targetRes, c_res_min[c], c_res_max[c]);

            // check if any new better resolution could be available, if so, we need to re-query the brick
            bool betterResChanged = false;
            for (int r = bestRes; r <= c_res_current[c]; r++ ) {
                if (r_ptCoord[r] != r_prevPTCoord[r]) {
                    betterResChanged = true;
                    break;
                }
            }

            // check if we need to re-query the brick / voxel or reuse past 'val'
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
                continue;
            }

            // check if a new brick is available in the best possible resolution
            if (newBrick) {
                ivec4 brickCacheInfo = getBrickLocation(p, bestRes, slot, rnd, true, c);
                // check information about the newly queried brick
                // if the res is not at best res, possibly the same as previous brick
                if (brickCacheInfo.w == -1 || brickCacheInfo.w == -2) {
                    // empty -- we can skip the rest of the loop
                    c_val_current[c] = 0.0;
                    c_renderMode_current[c] = 0;
                    c_minVal[c] = 0.0;
                    continue;
                } else if (brickCacheInfo.w == -3) {
                    // solid -- we set the value and do not need to query a voxel
                    c_val_current[c] = 1.0;
                    c_renderMode_current[c] = 1;
                    c_maxVal[c] = 1.0;
                    newVoxel = false;
                } else if (brickCacheInfo.w == -4) {
                    // static value -- we set the value and do not need to query a voxel
                    float val = float(brickCacheInfo.x);
                    c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));
                    c_renderMode_current[c] = 1;
                    newVoxel = false;
                } else if (brickCacheInfo.w >= 0) {
                    // new brick -- we set the coordinate and resolution and need to query a voxel
                    c_res_current[c] = brickCacheInfo.w;
                    c_ptCoord_current[c] = r_ptCoord[c_res_current[c]];
                    c_brickCacheCoord_current[c] = vec3(brickCacheInfo.xyz);
                    c_renderMode_current[c] = 2;
                    newVoxel = true;
                    // we set the usage of the brick based on the channel and the relative distance into the cube
                    if (int(floor(rnd * float(maxChannels))) == c) {
                        setUsage(brickCacheInfo.xyz, t_hit_min_os, t_hit_max_os, t_os, rnd);
                    }
                }
            }
            
            // we need to query a new voxel e.g. sample the brick cache
            if (newVoxel) {
                c_voxel_current[c] = r_voxel[c_res_current[c]];

                // we clamp the coordinate to be inside the brick and sample the volume
                reps++;
                vec3 voxelInBrick = mod(c_voxel_current[c], 32.0);
                vec3 clampedVoxelInBrick = clamp(voxelInBrick, 0.5, 31.5);
                float val = sampleBrick(c_brickCacheCoord_current[c].xyz, clampedVoxelInBrick);

                // interblock interpolation
                if (renderRes == 0) {
                    // calculate what axis we need to interpolate
                    bvec3 clampedMin = lessThan(voxelInBrick, clampedVoxelInBrick);
                    bvec3 clampedMax = greaterThan(voxelInBrick, clampedVoxelInBrick);
                    bvec3 clamped = bvec3(clampedMin.x || clampedMax.x, clampedMin.y || clampedMax.y, clampedMin.z || clampedMax.z);
                    vec3 diff = voxelInBrick - clampedVoxelInBrick;
                    
                    if (any(clampedMin) || any(clampedMax)) {                       
                        int boundaryAxes = int(clamped.x) + int(clamped.y) + int(clamped.z);
                        float f = 0.0;
                                                
                        if (boundaryAxes == 1) {
                            // linear interpolation
                            vec3 otherGlobalVoxelPos = vec3(0,0,0); // Changed: now global voxel coordinates
                            vec3 otherP = vec3(0,0,0);
                            float otherVoxelVal = 0.0;

                            // we need global voxel pos - start from current global voxel position
                            if (clampedMin.x) {
                                otherGlobalVoxelPos = c_voxel_current[c] - vec3(1.0, 0.0, 0.0); // Fixed: use global coordinates
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.x);
                            } else if (clampedMax.x) {
                                otherGlobalVoxelPos = c_voxel_current[c] + vec3(1.0, 0.0, 0.0); // Fixed: use global coordinates
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.x);
                            } else if (clampedMin.y) {
                                otherGlobalVoxelPos = c_voxel_current[c] - vec3(0.0, 1.0, 0.0); // Fixed: use global coordinates
                                otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                                f = abs(diff.y);
                            } else if (clampedMax.y) {
                                otherGlobalVoxelPos = c_voxel_current[c] + vec3(0.0, 1.0, 0.0); // Fixed: use global coordinates
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

                            vec3 otherPTcoord = getBrickFromNormalized(otherP, c_res_current[c]);
                            otherPTcoord = getBrickFromVoxel(otherGlobalVoxelPos, c_res_current[c]);
                            vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0);
                            otherVoxelInBrick -= diff;

                            // PT only used for comparison if neighboring brick is the same (XYZ+-)
                            // brick stores neighboring brick regardless of resolution
                            if (otherP.x < 0.0 || otherP.x >= 1.0 || otherP.y < 0.0 || otherP.y >= 1.0 || otherP.z < 0.0 || otherP.z >= 1.0) {
                                otherVoxelVal = val;
                            } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz && c_brick_XYZ_adjacent[c].w >= 0.0) {
                                otherVoxelVal = sampleBrick(c_brick_XYZ_adjacent[c].xyz, otherVoxelInBrick);
                            } else {
                                ivec4 otherBrickCacheInfo = ivec4(-1);
                                if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz) {
                                    otherBrickCacheInfo = ivec4(c_brick_XYZ_adjacent[c]);
                                } else {
                                    otherBrickCacheInfo = getBrickLocation(otherP, c_res_current[c], slot, rnd, false, c); 
                                }
                                if (otherBrickCacheInfo.w == -1 || otherBrickCacheInfo.w == -2) {
                                    otherVoxelVal = val;
                                } else if (otherBrickCacheInfo.w == -3) {
                                    otherVoxelVal = 1.0;
                                } else if (otherBrickCacheInfo.w == -4) {
                                    otherVoxelVal = float(otherBrickCacheInfo.x);
                                } else {
                                    // TODO: we do not recalculate the voxelInBrick based on the resolution
                                    otherVoxelVal = sampleBrick(vec3(otherBrickCacheInfo.xyz), otherVoxelInBrick);
                                }
                                c_PT_XYZ_adjacent[c] = getBrickFromVoxel(otherGlobalVoxelPos, c_res_current[c]); 
                                c_brick_XYZ_adjacent[c] = vec4(otherBrickCacheInfo);
                            }
                            float originalVal = val;
                            val = lerp(originalVal, otherVoxelVal, f);                            
                        } else if (boundaryAxes == 2) {
                            // bilinear interpolation
                            vec3 offA = vec3(0.0);
                            vec3 offB = vec3(0.0);
                            vec2 f = vec2(0.0);

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
                                    if (otherPTcoord == c_PT_X_adjacent[c].xyz && c_brick_X_adjacent[c].w >= 0.0)   {                         \
                                        DEST = sampleBrick(c_brick_X_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_Y_adjacent[c].xyz && c_brick_Y_adjacent[c].w >= 0.0) {                    \
                                        DEST = sampleBrick(c_brick_Y_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_Z_adjacent[c].xyz && c_brick_Z_adjacent[c].w >= 0.0) {                    \
                                        DEST = sampleBrick(c_brick_Z_adjacent[c].xyz, otherVoxelInBrick);   \
                                        matched = true;                                                 \
                                    } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz && c_brick_XYZ_adjacent[c].w >= 0.0) {                  \
                                        DEST = sampleBrick(c_brick_XYZ_adjacent[c].xyz, otherVoxelInBrick); \
                                        matched = true;                                                 \
                                    }             \
                                    ivec4 info = ivec4(-1); \
                                    if (otherPTcoord == c_PT_X_adjacent[c].xyz) { info = ivec4(c_brick_X_adjacent[c]); } \
                                    else if (otherPTcoord == c_PT_Y_adjacent[c].xyz) { info = ivec4(c_brick_Y_adjacent[c]); } \
                                    else if (otherPTcoord == c_PT_Z_adjacent[c].xyz) { info = ivec4(c_brick_Z_adjacent[c]); } \
                                    else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz) { info = ivec4(c_brick_XYZ_adjacent[c]); } \
                                    else { info = getBrickLocation(otherP, c_res_current[c], slot, rnd, false, c); } \
                                    \
                                    if (!matched) {                                                     \
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
                            
                            float v00 = val;
                            float v10; float v01; float v11;
                            SAMPLE_AT_OFFSET(offA, v10);
                            SAMPLE_AT_OFFSET(offB, v01);
                            SAMPLE_AT_OFFSET(offA + offB, v11);

                            val = bilerp(v00, v10, v01, v11, f);

                            #undef SAMPLE_AT_OFFSET

                        } else if (boundaryAxes == 3) {
                            // trilinear interpolation
                            
                            vec3 offA = vec3(0.0);
                            vec3 offB = vec3(0.0);
                            vec3 offC = vec3(0.0);
                            vec3 f = vec3(0.0);

                            offA.x = clampedMin.x ? -1.0 : 1.0;
                            offB.y = clampedMin.y ? -1.0 : 1.0;
                            offC.z = clampedMin.z ? -1.0 : 1.0;

                            f = vec3(abs(diff.x), abs(diff.y), abs(diff.z));

                            #define SAMPLE_AT_OFFSET(OFF, DEST) \
                                { \
                                    vec3 otherGlobalVoxelPos = c_voxel_current[c] + (OFF); \
                                    vec3 otherP = getNormalizedFromVoxel(otherGlobalVoxelPos, c_res_current[c]); \
                                    if (any(lessThan(otherP, vec3(0.0))) || any(greaterThanEqual(otherP, vec3(1.0)))) { \
                                        DEST = val; \
                                    } else { \
                                        vec3 otherPTcoord      = getBrickFromNormalized(otherP, c_res_current[c]);             \
                                        vec3 otherVoxelInBrick = mod(otherGlobalVoxelPos, 32.0) - diff;     \
                                        if (otherPTcoord == c_PT_X_adjacent[c] && c_brick_X_adjacent[c].w >= 0.0)   {                         \
                                            DEST = sampleBrick(c_brick_X_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_Y_adjacent[c].xyz && c_brick_Y_adjacent[c].w >= 0.0) {                    \
                                            DEST = sampleBrick(c_brick_Y_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_Z_adjacent[c].xyz && c_brick_Z_adjacent[c].w >= 0.0) {                    \
                                            DEST = sampleBrick(c_brick_Z_adjacent[c].xyz, otherVoxelInBrick);   \
                                        } else if (otherPTcoord == c_PT_XYZ_adjacent[c].xyz && c_brick_XYZ_adjacent[c].w >= 0.0) {                  \
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
                        // no adjacent bricks -> reset the adjacent trackers
                        c_PT_X_adjacent[c] = c_PT_Y_adjacent[c] = c_PT_Z_adjacent[c] = c_PT_XYZ_adjacent[c] = vec3(-1.0);
                        c_brick_X_adjacent[c] = c_brick_Y_adjacent[c] = c_brick_Z_adjacent[c] = c_brick_XYZ_adjacent[c] = vec4(-1.0);
                    }
                }

                // we normalize the (accumulated) value to the range of the color channel
                c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));

                // update the min and max values for the min/max projection
                if (c_minVal[c] == -1.0) {
                    c_minVal[c] = c_val_current[c];
                } else {
                    c_minVal[c] = min(c_minVal[c], c_val_current[c]);
                }
                c_maxVal[c] = max(c_maxVal[c], c_val_current[c]);

            }

            // potentially overwrite brick request
            if (!overWrittenRequest 
                && c_res_current[c] != bestRes
                && c_val_current[c] > 0.0
                && c_renderMode_current[c] == 2
                && int(floor(rnd * float(maxChannels))) == c) {
                setBrickRequest(p, bestRes, slot, rnd);
                overWrittenRequest = true;
            }

            // sum up the values onto the slice values
            total += c_val_current[c];
            rgbCombo += c_val_current[c] * c_color[c];

        }

        // add the calculated slice to the total color
        total = clamp(total, 0.0, 1.0);
        sliceAlpha = total * opacity * dt * 32.0;
        sliceColor = rgbCombo;

        outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
        outColor.a += sliceAlpha * alphaMultiplicator;
        alphaMultiplicator *= (1.0 - sliceAlpha);

        // check if we can exit early
        if (outColor.a > 0.99 && u_renderstyle == 0) { break; }

        t += dt;
        p += dp;
        t_os += dt;
    }

    if (u_renderstyle == 1) { // minimum intensity projection
        outColor = vec4(0.0);
        for (int c = 0; c < 7; c++) {
            if (c_color[c] != vec3(0.0, 0.0, 0.0)) {
                outColor.rgb += c_minVal[c] * c_color[c];
                outColor.a += c_minVal[c];
            }
        }
    } else if (u_renderstyle == 0) { // maximum intensity projection
        outColor = vec4(0.0);
        for (int c = 0; c < 7; c++) {
            if (c_color[c] != vec3(0.0, 0.0, 0.0)) {
                outColor.rgb += c_maxVal[c] * c_color[c];
            }
        }
        outColor.a = 1.0;
    }

    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);
    
}