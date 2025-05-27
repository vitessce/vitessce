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
uniform uvec3 anchor10;

varying vec4 glPosition; // also unused
varying vec3 worldSpaceCoords; // only used for depth

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gRequest;
layout(location = 2) out vec4 gUsage;

// const uvec3 voxelExtents = uvec3(1024, 1024, 795);
// const vec3 voxelStretch = vec3(1.0, 1.0, 1024.0 / 795.0);
// const vec3 voxelStretchInv = vec3(1.0, 1.0, 795.0 / 1024.0);

const int highestResC0 = 0;
const int lowestResC0 = 5;
const float lodFactor = 5.0;

const int renderResC0 = 5;

const int targetResC0 = 5; // highest
const int lowestRes = 5;

vec2 intersect_hit(vec3 orig, vec3 dir, vec3 voxelStretchInv) {
    vec3 boxMin = vec3(-0.5) * boxSize;
    vec3 boxMax = vec3(0.5) * boxSize;
    if (u_xClip.x > -1.0) {
        boxMin.x = u_xClip.x - (boxSize.x / 2.0) * voxelStretchInv.x;
        if (u_xClip.y < boxSize.x)
        boxMax.x = u_xClip.y - (boxSize.x / 2.0) * voxelStretchInv.x;
    }
    if (u_yClip.x > -1.0) {
        boxMin.y = u_yClip.x - (boxSize.y / 2.0) * voxelStretchInv.y;
        if (u_yClip.y < boxSize.y)
        boxMax.y = u_yClip.y - (boxSize.y / 2.0) * voxelStretchInv.y;
    }
    if (u_zClip.x > -1.0) {
        boxMin.z = u_zClip.x - (boxSize.z / 2.0) * voxelStretchInv.z;
        if (u_zClip.y < boxSize.z)
        boxMax.z = u_zClip.y - (boxSize.z / 2.0) * voxelStretchInv.z;
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

        return ivec4(coordinate, -10);

        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
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

void setBrickRequest(vec3 location, int targetRes, int channel) {
    uvec3 anchorPoint = getAnchorPoint(targetRes);
    float scale = pow(2.0, float(lowestRes) - float(targetRes)); // lowestRes should be 1 
    uvec3 channelOffset = getChannelOffset(channel); // this is for the 0th channel now
    uvec3 coordinate = uvec3(anchorPoint * channelOffset) + uvec3(location * scale);
    gRequest = packBrickCoordToRGBA8(coordinate);
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
    // return;

    // float stretchFactor = float(max(voxelExtents.x, max(voxelExtents.y, voxelExtents.z)));
    float stretchFactor = float(pow(2.0, float(lowestRes)) * 32.0);
    vec3 voxelStretch = stretchFactor / vec3(voxelExtents);
    vec3 voxelStretchInv = vec3(1.0) / vec3(voxelStretch);

    // vec3 voxelStretchInv = vec3(1.0);

    if (stretchFactor == 640.0) {
        // gColor = vec4(voxelStretchInv.x, voxelStretchInv.y, voxelStretchInv.z, 1.0);
        // gColor = vec4(glPosition.x, glPosition.y, glPosition.z, 1.0);
        // return;
    }

    //STEP 1: Normalize the view Ray
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    
    //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir, voxelStretchInv);
    if (t_hit.x >= t_hit.y) {
      discard;
    }
    t_hit.x = max(t_hit.x, 0.0);

    float t = t_hit.x;

    int current_LOD = getLOD(t, highestResC0, lowestResC0, lodFactor);
    int targetResC0 = current_LOD;

    //STEP 3: Compute the step size to march through the volume grid
    // ivec3 volumeTexSize = textureSize(brickCacheTex, 0);
    ivec3 volumeTexSize = ivec3(voxelExtents);

    float randomOffset = random();

    vec3 p = cameraCorrected + t_hit.x * ws_rayDir;
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);
    // t_hit is now between 0 and 15

    // boxSize is now 1 x 1 x 795/1024
    // that is the voxel ratio
    // NOT the physical pixel ratio

    // TODO lowest and higest res should be over all channels
    int renderResAdaptive = renderRes;
    int renderResolutionEffective = clamp(renderRes, highestResC0, 5);
    // renderResolutionEffective = 0;

    vec3 os_rayDir = normalize(ws_rayDir / boxSize);
    vec3 os_rayOrigin = cameraCorrected / boxSize + vec3(0.5);
    vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(os_rayDir));
    float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    float dt_base = dt;
    dt *= pow(2.0, float(renderResolutionEffective));

    p = p / boxSize + vec3(0.5); // this gives us exactly 0..1
    vec3 step = (os_rayDir * dt);

    p += step * (randomOffset);
    p = clamp(p, 0.0 + 0.0000028, 1.0 - 0.0000028);

    bool overWrittenRequest = false;

    // Initialization of some variables
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;

    ivec4 currentBrickLocation = ivec4(0,0,0,0);
    ivec3 currentTargetResPTCoord = ivec3(0,0,0);

    float alphaMultiplicator = 1.0;
    vec3 localPos = vec3(0.0);

    // t is in world space now
    int currentLOD = targetResC0;

    vec3 p_stretched = p * voxelStretchInv;

    // gColor = vec4(p_stretched.x, p_stretched.y, p_stretched.z, 1.0);
    // gColor = vec4(p.x, p.y, p.z, 1.0);
    // return;

    while (vec3_max(p) < 1.0 && vec3_min(p) > 0.0 
        && t < t_hit.y && t >= t_hit.x) {

        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // p goes from 0 to 1
        targetResC0 = getLOD(t, highestResC0, lowestResC0, lodFactor);

        if (targetResC0 != currentLOD) {
            currentLOD = targetResC0;
            renderResAdaptive++;
            renderResolutionEffective = clamp(renderResAdaptive, highestResC0, 5);
            dt = dt_base * pow(2.0, float(renderResolutionEffective));
            step = os_rayDir * dt;
        }

        // dt = dt_base * pow(2.0, float(targetResC0));

        ivec4 brickCacheOffset = getBrickLocation(p_stretched, targetResC0, 0);
        currentBrickLocation = brickCacheOffset;

        if (brickCacheOffset.w == -10) {
            gColor = vec4(float(brickCacheOffset.x)/8.0, 
                float(brickCacheOffset.y)/8.0, 
                float(brickCacheOffset.z)/8.0, 1.0);
            return;
        }

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
            if (outColor.a > 0.99) { break; }
            continue;
        } else {
        
            float scale = pow(2.0, float(lowestRes) - float(brickCacheOffset.w));
            localPos = fract(p_stretched * scale);

            // dt = dt_base * pow(2.0, float(brickCacheOffset.w));

            vec3 brickCacheCoord = vec3(
                (float(brickCacheOffset.x) * 32.0 + localPos.x * 32.0) / 2048.0,
                (float(brickCacheOffset.y) * 32.0 + localPos.y * 32.0) / 2048.0,
                (float(brickCacheOffset.z) * 32.0 + localPos.z * 32.0) / 128.0
            );

            float val = texture(brickCacheTex, brickCacheCoord).r;

            val = max(0.0, (val - u_clim[0] ) / (u_clim[1] - u_clim[0]));

            // color based on t
            vec3 colorVal = vec3(0.0);
            if (brickCacheOffset.w == 0) {
                colorVal = vec3(0.0, 1.0, 1.0);
            } else if (brickCacheOffset.w == 1) {
                colorVal = vec3(1.0, 0.0, 0.0);
            } else if (brickCacheOffset.w == 2) {
                colorVal = vec3(0.0, 1.0, 0.0);
            } else if (brickCacheOffset.w == 3) {
                colorVal = vec3(1.0, 0.0, 1.0);
            } else if (brickCacheOffset.w == 4) {
                colorVal = vec3(1.0, 1.0, 0.0);
            } else if (brickCacheOffset.w == 5) {
                colorVal = vec3(0.0, 0.0, 1.0);
            }
            // colorVal = vec3(1.0, 0.0, 0.0);

            if (!overWrittenRequest
                && brickCacheOffset.w != targetResC0
                && val > 0.0) {
                setBrickRequest(p_stretched, targetResC0, 0);
                overWrittenRequest = true;
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

    // Set all render targets directly without conditionals
    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);

    if (gRequest.a + gRequest.b + gRequest.g + gRequest.r > 0.0) {
        // gColor = vec4(gRequest.r, gRequest.g, gRequest.b, 1.0);
    }

    uint ptEntry = texelFetch(pageTableTex, ivec3(0, 0, 1), 0).r;
    if (ptEntry != 0u) {
        // gColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    // gColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    // gColor = vec4(float(ptEntry) / 4294967295.0, 0.0, 0.0, 1.0);
    // float val = texture(brickCacheTex, vec3(31.0, 0.0, 0.0)).r;
    // gColor = vec4(val, 0.0, 0.0, 1.0);
}
