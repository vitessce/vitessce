#include <packing>
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler3D;
in vec3 rayDirUnnorm;
in vec3 cameraCorrected;
// NEW SAMPLERS
uniform sampler3D brickCacheTex;
uniform usampler3D pageTableTex;
// uniform usampler3D lruBrickCacheTex; // size of bc/32
// uniform usampler3D requestQueueTex; // holds list of pagetable coords
uniform vec2 u_clim;
uniform vec2 u_clim2;
uniform vec2 u_clim3;
uniform vec2 u_clim4;
uniform vec2 u_clim5;
uniform vec2 u_clim6;
uniform vec2 u_window_size;
uniform vec2 u_xClip;
uniform vec2 u_yClip;
uniform vec2 u_zClip;
// uniform sampler2D u_cmdata; // UNUSED
// uniform sampler2D u_stop_geom; // UNUSED
// uniform sampler2D u_geo_color; // UNUSED
uniform vec3 u_color;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;
uniform vec3 u_color6;
uniform float opacity;
uniform float volumeCount; // -> should be channel count
uniform highp vec3 boxSize;
uniform float near;
varying vec4 glPosition;
uniform float far;
varying vec3 worldSpaceCoords; // only used for depth

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gRequest;
layout(location = 2) out vec4 gUsage;

float linearize_z(float z) {
    return near * far / (far + z * (near - far));
}

vec2 intersect_hit(vec3 orig, vec3 dir) {
    vec3 boxMin = vec3(-0.5) * boxSize;
    vec3 boxMax = vec3(0.5) * boxSize;
    if (u_xClip.x > -1.0) {
        boxMin.x = u_xClip.x - (boxSize.x / 2.0);
        if (u_xClip.y < boxSize.x)
        boxMax.x = u_xClip.y - (boxSize.x / 2.0);
    }
    if (u_yClip.x > -1.0) {
        boxMin.y = u_yClip.x - (boxSize.y / 2.0);
        if (u_yClip.y < boxSize.y)
        boxMax.y = u_yClip.y - (boxSize.y / 2.0);
    }
    if (u_zClip.x > -1.0) {
        boxMin.z = u_zClip.x - (boxSize.z / 2.0);
        if (u_zClip.y < boxSize.z)
        boxMax.z = u_zClip.y - (boxSize.z / 2.0);
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

// Pseudo-random number gen from',
// http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/',
// with some tweaks for the range of values',
float wang_hash(int seed) {
    seed = (seed ^ 61) ^ (seed >> 16);
    seed *= 9;
    seed = seed ^ (seed >> 4);
    seed *= 0x27d4eb2d;
    seed = seed ^ (seed >> 15);
    return float(seed % 2147483647) / float(2147483647);
}

// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com
float random() {
    return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float linear_to_srgb(float x) {
    if (x <= 0.0031308f) {
        return 12.92f * x;
    }
    return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;
}

vec4 linear_to_srgb(vec4 x) {
    return vec4(linear_to_srgb(x.r), linear_to_srgb(x.g), linear_to_srgb(x.b), x.a);
}

vec4 packBrickCoordToRGBA8(uvec3 coord) {
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

const int highestResC0 = 1;
const int lowestResC0 = 5;
const float lodFactor = 5.0;

const int targetResC0 = 5; // highest
const int lowestRes = 5;
const uvec3 baseExtents = uvec3(32, 32, 28);
const uvec3 fullResExtents = uvec3(32, 32, 25);

const uvec3 anchorPoint0 = uvec3(0,0,28);
const uvec3 anchorPoint1 = uvec3(16,16,15);
const uvec3 anchorPoint2 = uvec3(8,8,8);
const uvec3 anchorPoint3 = uvec3(4,4,4);
const uvec3 anchorPoint4 = uvec3(2,2,2);
const uvec3 anchorPoint5 = uvec3(1,1,1);

const uvec3 voxelExtents = uvec3(1024, 1024, 795);
const vec3 voxelStretch = vec3(1.0, 1.0, 1024.0 / 795.0);
const vec3 voxelStretchInv = vec3(1.0, 1.0, 795.0 / 1024.0);

uvec3 getAnchorPoint(int index) {
    if (index == 0) return anchorPoint0;
    if (index == 1) return anchorPoint1;
    if (index == 2) return anchorPoint2;
    if (index == 3) return anchorPoint3;
    if (index == 4) return anchorPoint4;
    return anchorPoint5;
}

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

vec3 volumeSizeAtRes(int res) {
    float factor = pow(2.0, float(res));
    return vec3(voxelExtents) / factor;
}

/*
[1] 31    | 0 — flag resident
[1] 30    | 1 — flag init
[7] 23…29 | 2…8 — min → 128
[7] 16…22 | 9…15 — max → 128
[6] 10…15 | 16…21 — x offset in brick cache → 64
[6] 4…9   | 22…27 — y offset in brick cache → 64
[4] 0…3   | 28…31 — z offset in brick cache → 16 (only needs 4 no?)
*/

//input: location as 0..1 coordinate in volume
//input: targetRes
//input: channel
//output: x,y,z as brick address in brick cache, w as resolution
//if not found -- 0,0,0,-1
//if empty -- 0,0,0,-2
//if full -- 0,0,0,-3
//if constant -- min,currentRes,0,-4
ivec4 getBrickLocation(vec3 location, int targetRes, int channel) {

    int currentRes = targetRes;

    while (currentRes <= lowestRes) {
        uvec3 anchorPoint = getAnchorPoint(currentRes);
        // multiplier to scale the [0,1] to the extents in the PT in that res
        float scale = pow(2.0, float(lowestRes) - float(currentRes)); // lowestRes should be 1 
        uvec3 channelOffset = getChannelOffset(channel); // this is for the 0th channel now
        uvec3 coordinate = uvec3(anchorPoint * channelOffset) + uvec3(location * scale);
        uint ptEntry = texelFetch(pageTableTex, ivec3(coordinate), 0).r;

        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            // TODO: request brick
            if (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) {
                gRequest = packBrickCoordToRGBA8(coordinate);
            }
            continue;
        }
        uint umin = ((ptEntry >> 23u) & 0x7Fu);
        uint umax = ((ptEntry >> 16u) & 0x7Fu);
        float min = float(int(umin)) / 127.0;
        float max = float(int(umax)) / 127.0;
        // return ivec4(int(umin), int(umax), 0, -2);
        if (float(max) <= u_clim[0]) {
            return ivec4(
                0,
                1,
                0,
                -2);
            // EMPTY
        } else if (float(min) >= u_clim[1]) {
            return ivec4(
                0, 
                0, 
                1, 
                -3);
            // CONSTANT FULL
        } else if ((umax - umin) < 2u) {
            // CONSTANT OTHER VALUE
            return ivec4(
                min, 
                0, 
                0, 
                -4);
        }
        // check if resident
        uint isResident = (ptEntry >> 31u) & 1u;
        if (isResident == 0u) {
            currentRes++;
            // TODO: request brick
            if (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) {
                gRequest = packBrickCoordToRGBA8(coordinate);
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

    // return x,y,z,resolution (for size) -> maybe add negative values for nonres etc.
    return ivec4(0,0,0,-1);
}

ivec3 normalizedToPTCoord(vec3 normalized, int targetRes) {
    float scale = pow(2.0, float(lowestRes) - float(targetRes));
    return ivec3(normalized * scale);
}

float vec3_max(vec3 v) {
    return max(v.x, max(v.y, v.z));
}

float vec3_min(vec3 v) {
    return min(v.x, min(v.y, v.z));
}

int getLOD(float distance, int highestRes, int lowestRes, float lodFactor) {
    int lod = int(log2(distance * lodFactor));
    return clamp(lod, highestRes, lowestRes);
}

// TODO:
// conditionals -> alpha above certain value -> increase target res
// if distance above certain value -> increase target res (?)
// if zoomed out (voxel smaller than pixel) -> increase target res
// differentiate between ws and os


void main(void) {

    gRequest = vec4(0,0,0,0);
    gUsage = vec4(0,0,0,0);
    gColor = vec4(0.0, 0.0, 0.0, 0.0);

    //STEP 1: Normalize the view Ray
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    
    //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir);
    if (t_hit.x >= t_hit.y) {
      discard;
    }
    t_hit.x = max(t_hit.x, 0.0);

    //STEP 3: Compute the step size to march through the volume grid
    ivec3 volumeTexSize = textureSize(brickCacheTex, 0);
    volumeTexSize = ivec3(voxelExtents);

    float randomOffset = random();

    vec3 p = cameraCorrected + t_hit.x * ws_rayDir;
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);
    // t_hit is now between 0 and 15

    // boxSize is now 1 x 1 x 795/1024
    // that is the voxel ratio
    // NOT the physical pixel ratio

    vec3 os_rayDir = normalize(ws_rayDir / boxSize);
    vec3 os_rayOrigin = cameraCorrected / boxSize + vec3(0.5);
    vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(os_rayDir));
    float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    dt *= pow(2.0, float(targetResC0));

    p = p / boxSize + vec3(0.5); // this gives us exactly 0..1
    vec3 step = (os_rayDir * dt);

    p += step * (randomOffset);
    p = clamp(p, 0.0 + 0.0000028, 1.0 - 0.0000028);


    // Initialization of some variables
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;

    ivec4 currentBrickLocation = ivec4(0,0,0,0);
    ivec3 currentTargetResPTCoord = ivec3(0,0,0);

    float alphaMultiplicator = 1.0;
    vec3 localPos = vec3(0.0);
    float t = t_hit.x;

    // t is in world space now

    vec3 p_stretched = p * voxelStretchInv;

    int current_LOD = getLOD(t, highestResC0, lowestResC0, lodFactor);
    int targetResC0 = current_LOD;

    while (vec3_max(p) < 1.0 && vec3_min(p) > 0.0) {

        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // p goes from 0 to 1
        targetResC0 = getLOD(t, highestResC0, lowestResC0, lodFactor);

        ivec4 brickCacheOffset = getBrickLocation(p_stretched, targetResC0, 0);
        currentBrickLocation = brickCacheOffset;

        currentTargetResPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
        ivec3 newBrickLocationPTCoord = currentTargetResPTCoord;

        if (brickCacheOffset.w == -1 || brickCacheOffset.w == -2) {
            while (currentTargetResPTCoord == newBrickLocationPTCoord) {
                p += step;
                t += dt;
                p_stretched = p * voxelStretchInv;

                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
            }
            continue;
        } else if (brickCacheOffset.w == -3) {
            // full
            float sliceAlpha = opacity * dt * 32.0;
            vec3 sliceColor = u_color;

            while (currentTargetResPTCoord == newBrickLocationPTCoord) {
                outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
                outColor.a += sliceAlpha * alphaMultiplicator;
                
                if (outColor.a > 0.99) { break; }
                
                alphaMultiplicator *= (1.0 - sliceAlpha);

                p += step;
                t += dt;
                p_stretched = p * voxelStretchInv;
                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
            }
            if (outColor.a > 0.99) { break; }
            continue;
        } else if (brickCacheOffset.w == -4) {
            // render constant
            float val = float(brickCacheOffset.x);
            val = max(0.0, (val - u_clim[0] ) / (u_clim[1] - u_clim[0]));
            float sliceAlpha = val * opacity * dt * 32.0;
            vec3 sliceColor = val * u_color;

            while (currentTargetResPTCoord == newBrickLocationPTCoord) {
                outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
                outColor.a += sliceAlpha * alphaMultiplicator;
                
                if (outColor.a > 0.99) { break; }
                
                alphaMultiplicator *= (1.0 - sliceAlpha);
            
                p += step;
                t += dt;
                p_stretched = p * voxelStretchInv;
                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
            }
            continue;
        } else {
        
            float scale = pow(2.0, float(lowestRes) - float(brickCacheOffset.w));
            localPos = fract(p_stretched * scale);

            vec3 brickCacheCoord = vec3(
                (float(brickCacheOffset.x) * 32.0 + localPos.x * 32.0) / 2048.0,
                (float(brickCacheOffset.y) * 32.0 + localPos.y * 32.0) / 2048.0,
                (float(brickCacheOffset.z) * 32.0 + localPos.z * 32.0) / 128.0
            );

            float val = texture(brickCacheTex, brickCacheCoord).r;

            val = max(0.0, (val - u_clim[0] ) / (u_clim[1] - u_clim[0]));

            // color based on t
            vec3 colorVal = vec3(0.0);
            if (targetResC0 == 0) {
                colorVal = vec3(0.5, 0.5, 0.0);
            } else if (targetResC0 == 1) {
                colorVal = vec3(1.0, 0.0, 0.0);
            } else if (targetResC0 == 2) {
                colorVal = vec3(0.0, 1.0, 0.0);
            } else if (targetResC0 == 3) {
                colorVal = vec3(0.0, 0.0, 1.0);
            } else if (targetResC0 == 4) {
                colorVal = vec3(1.0, 1.0, 0.0);
            } else if (targetResC0 == 5) {
                colorVal = vec3(1.0, 0.0, 1.0);
            }
            

            vec3 rgbComboAdd = max(0.0, min(1.0, val)) * colorVal;

            ivec3 currentVoxelInBrick = ivec3(localPos * 32.0);
            ivec3 newVoxelInBrick = currentVoxelInBrick;

            int reps = 0;
            rgbCombo += rgbComboAdd;

            while (currentTargetResPTCoord == newBrickLocationPTCoord
                && currentVoxelInBrick == newVoxelInBrick) {

                if (reps > 0) {
                    // gColor = vec4(0.0, 0.0, 1.0, 1.0);
                    // return;
                }
                reps++;
            
                total = val;

                total = clamp(total, 0.0, 1.0);
                float sliceAlpha = total * opacity * dt * 32.0;
                vec3 sliceColor  = rgbCombo;

                outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
                outColor.a   += sliceAlpha * alphaMultiplicator;

                if (outColor.a > 0.99) {
                    break;
                }

                alphaMultiplicator *= (1.0 - sliceAlpha);

                t += dt;
                p += step;
                p_stretched = p * voxelStretchInv;

                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
                newVoxelInBrick = ivec3(fract( p_stretched * scale) * 32.0);
            }
        }
        
        if (outColor.a > 0.99) {
            break;
        }
    }

    // gl_FragDepth = distance(worldSpaceCoords,p)*u_physical_Pixel;
    // outColor.r = linear_to_srgb(outColor.r);
    // outColor.g = linear_to_srgb(outColor.g);
    // outColor.b = linear_to_srgb(outColor.b);

    // Set all render targets directly without conditionals
    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);

    if (gRequest.a + gRequest.b + gRequest.g + gRequest.r > 0.0) {
        // gColor = vec4(gRequest.r, gRequest.g, gRequest.b, 1.0);
    }

    // Also set outColor for compatibility
    // outColor.r = linear_to_srgb(outColor.r);
    // outColor.g = linear_to_srgb(outColor.g);
    // outColor.b = linear_to_srgb(outColor.b);
}
