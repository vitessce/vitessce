#include <packing>
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler3D;
in vec3 rayDirUnnorm;
in vec3 cameraCorrected;
uniform sampler3D brickCacheTex;
uniform usampler3D pageTableTex;
uniform vec2 u_clim;
uniform vec2 u_clim2;
uniform vec2 u_clim3;
uniform vec2 u_clim4;
uniform vec2 u_clim5;
uniform vec2 u_clim6;
uniform vec2 u_xClip;
uniform vec2 u_yClip;
uniform vec2 u_zClip;
uniform vec3 u_color;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;
uniform vec3 u_color6;
uniform float opacity;
uniform highp vec3 boxSize;
uniform int renderRes;
uniform uvec3 voxelExtents;

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

varying vec4 glPosition; // also unused
varying vec3 worldSpaceCoords; // only used for depth

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gRequest;
layout(location = 2) out vec4 gUsage;

const int highestResC0 = 1;
const int lowestResC0 = 5;
const float lodFactor = 2.0;

const int renderResC0 = 5;

const int targetResC0 = 5; // highest
const int lowestRes = 5;

bool smallEq(vec3 x, vec3 y) {
    return x.x <= y.x && x.y <= y.y && x.z <= y.z;
}

bool largeEq(vec3 x, vec3 y) {
    return x.x >= y.x && x.y >= y.y && x.z >= y.z;
}

vec2 intersect_hit(vec3 orig, vec3 dir, vec3 voxelStretchInv) {
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

ivec4 getBrickLocation(vec3 location, int targetRes, int channel) {

    int currentRes = targetRes;

    while (currentRes <= lowestRes) {
        uvec3 anchorPoint = getAnchorPoint(currentRes);
        // multiplier to scale the [0,1] to the extents in the PT in that res
        float scale = pow(2.0, float(lowestRes) - float(currentRes));
        uvec3 channelOffset = getChannelOffset(channel);
        uvec3 flooredLocation = uvec3(floor(location * scale));
        uvec3 coordinate = uvec3(anchorPoint * channelOffset) + flooredLocation;
        uint ptEntry = texelFetch(pageTableTex, ivec3(coordinate), 0).r;

        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            if (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) {
                gRequest = packPTCoordToRGBA8(coordinate);
            }
            continue;
        }
        uint umin = ((ptEntry >> 23u) & 0x7Fu);
        uint umax = ((ptEntry >> 16u) & 0x7Fu);
        float min = float(int(umin)) / 127.0;
        float max = float(int(umax)) / 127.0;
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
            if (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0) {
                gRequest = packPTCoordToRGBA8(coordinate);
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

    return ivec4(0,0,0,-1);
}

void setBrickRequest(vec3 location, int targetRes, int channel) {
    uvec3 anchorPoint = getAnchorPoint(targetRes);
    float scale = pow(2.0, float(lowestRes) - float(targetRes));
    uvec3 channelOffset = getChannelOffset(channel);
    uvec3 coordinate = uvec3(anchorPoint * channelOffset) + uvec3(location * scale);
    gRequest = packPTCoordToRGBA8(coordinate);
}

void setUsage(ivec3 brickCacheOffset, float t_hit_min_os, float t_hit_max_os, float t_os, float rnd) {
    float normalized_t_os = (t_os - t_hit_min_os) / (t_hit_max_os - t_hit_min_os); // should be between 0 and 1
    if (normalized_t_os <= rnd || gUsage == vec4(0.0, 0.0, 0.0, 0.0)) {
        gUsage = vec4(vec3(brickCacheOffset) / 255.0, 1.0);
    }
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

void main(void) {

    gRequest = vec4(0,0,0,0);
    gUsage = vec4(0,0,0,0);
    gColor = vec4(0.0, 0.0, 0.0, 0.0);

    float stretchFactor = float(pow(2.0, float(lowestRes)) * 32.0);
    vec3 voxelStretch = stretchFactor / vec3(voxelExtents);
    vec3 voxelStretchInv = vec3(1.0) / vec3(voxelStretch);

    //STEP 1: Normalize the view Ray
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    
    //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir, voxelStretchInv);
    if (t_hit.x >= t_hit.y) {
      discard;
    }
    t_hit.x = max(t_hit.x, 0.0);

    float t = t_hit.x;

    float ws2os = length(ws_rayDir / boxSize);  // scalar conversion factor

    float t_hit_min_os = t_hit.x * ws2os;       // entry distance in OS units
    float t_hit_max_os = t_hit.y * ws2os;       // exit  distance in OS units
    float t_os         = t_hit_min_os;          // our new marching parameter

    int current_LOD = getLOD(t_os, highestResC0, lowestResC0, lodFactor);
    int targetResC0 = current_LOD;

    ivec3 volumeTexSize = ivec3(voxelExtents);

    vec3 p = cameraCorrected + t_hit.x * ws_rayDir;
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);

    int renderResAdaptive = renderRes;
    int renderResolutionEffective = clamp(renderRes, highestResC0, 5);

    vec3 os_rayDir = normalize(ws_rayDir / boxSize);
    vec3 os_rayOrigin = cameraCorrected / boxSize + vec3(0.5);
    vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(os_rayDir));
    float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    float dt_base = dt;
    dt *= pow(2.0, float(renderResolutionEffective));

    p = p / boxSize + vec3(0.5); // this gives us exactly 0..1
    vec3 step = (os_rayDir * dt);

    float rnd = random();

    p += step * (rnd);
    p = clamp(p, 0.0 + 0.0000028, 1.0 - 0.0000028);

    bool overWrittenRequest = false;

    // Initialization of some variables
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;

    ivec4 currentBrickLocation = ivec4(0,0,0,0);
    ivec3 currentTargetResPTCoord = ivec3(0,0,0);

    float alphaMultiplicator = 1.0;
    vec3 localPos = vec3(0.0);

    int currentLOD = targetResC0;

    vec3 p_stretched = p * voxelStretchInv;

    while (vec3_max(p) < 1.0 && vec3_min(p) >= 0.0 
        && t_os < t_hit_max_os && t_os >= t_hit_min_os
        ) {

        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // p goes from 0 to 1
        targetResC0 = getLOD(t, highestResC0, lowestResC0, lodFactor);

        if (targetResC0 != currentLOD) {
            currentLOD = targetResC0;
            renderResAdaptive++;
            renderResolutionEffective = clamp(renderResAdaptive, highestResC0, 5);
            // p -= step * rnd;
            dt = dt_base * pow(2.0, float(renderResolutionEffective));
            step = os_rayDir * dt;
            // p += step * rnd;
        }

        ivec4 brickCacheOffset = getBrickLocation(p_stretched, targetResC0, 0);
        currentBrickLocation = brickCacheOffset;

        currentTargetResPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
        ivec3 newBrickLocationPTCoord = currentTargetResPTCoord;

        if (brickCacheOffset.w == -1 || brickCacheOffset.w == -2) {
            while (currentTargetResPTCoord == newBrickLocationPTCoord) {
                p += step;
                t += dt;
                t_os += dt;
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
                t_os += dt;
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
                t_os += dt;
                p_stretched = p * voxelStretchInv;
                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
            }
            if (outColor.a > 0.99) { break; }
            continue;
        } else {
        
            float scale = pow(2.0, float(lowestRes) - float(brickCacheOffset.w));
            localPos = fract(p_stretched * scale);

            vec3 brickCacheCoord = vec3(
                (float(brickCacheOffset.x) * 32.0 + localPos.x * 32.0) / 2048.0,
                (float(brickCacheOffset.y) * 32.0 + localPos.y * 32.0) / 2048.0,
                (float(brickCacheOffset.z) * 32.0 + localPos.z * 32.0) / 128.0
            );

            setUsage(brickCacheOffset.xyz, t_hit_min_os, t_hit_max_os, t_os, rnd);

            float val = texture(brickCacheTex, brickCacheCoord).r;

            val = max(0.0, (val - u_clim[0] ) / (u_clim[1] - u_clim[0]));

            vec3 colorVal = u_color;

            if (!overWrittenRequest
                && brickCacheOffset.w != targetResC0
                && val > 0.0) {
                setBrickRequest(p_stretched, targetResC0, 0);
                overWrittenRequest = true;
            }

            vec3 rgbComboAdd = max(0.0, min(1.0, val)) * colorVal;

            ivec3 currentVoxelInBrick = ivec3(localPos * 32.0);
            ivec3 newVoxelInBrick = currentVoxelInBrick;
            rgbCombo += rgbComboAdd;

            while (currentTargetResPTCoord == newBrickLocationPTCoord
                && currentVoxelInBrick == newVoxelInBrick) {
            
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
                t_os += dt;
                p_stretched = p * voxelStretchInv;

                newBrickLocationPTCoord = normalizedToPTCoord(p_stretched, targetResC0);
                newVoxelInBrick = ivec3(fract( p_stretched * scale) * 32.0);
            }
        }
        
        if (outColor.a > 0.99) {
            break;
        }
    }

    // Set all render targets directly without conditionals
    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);

    // gColor = linear_to_srgb(gUsage);
}
