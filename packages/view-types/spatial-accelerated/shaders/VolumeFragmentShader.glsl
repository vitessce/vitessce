// #include <packing>
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp usampler3D;
in vec3 rayDirUnnorm;
in vec3 cameraCorrected;
uniform sampler3D brickCacheTex;
uniform usampler3D pageTableTex;
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
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;
uniform vec3 color6;
uniform float opacity;
uniform highp vec3 boxSize;
uniform int renderRes;
uniform uvec3 voxelExtents;

uniform ivec2 resGlobal;
uniform int maxChannels;

uniform ivec2 res0;
uniform ivec2 res1;
uniform ivec2 res2;
uniform ivec2 res3;
uniform ivec2 res4;
uniform ivec2 res5;
uniform ivec2 res6;
uniform ivec2 res7;

uniform float lodFactor;

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

vec3 getVoxelFromNormalized(vec3 normalized, int res) {
    vec3 extents = (vec3(voxelExtents) / getScale(res)); // should be voxelExtents per res
    vec3 voxel = normalized * extents;
    return voxel;
}

vec3 getBrickFromNormalized(vec3 normalized, int res) {
    vec3 voxel = getVoxelFromNormalized(normalized, res);
    vec3 brick = floor(voxel / 32.0);
    return brick;
}

vec3 getBrickFromVoxel(vec3 voxel, int res) {
    vec3 brick = floor(voxel / 32.0);
    return brick;
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

vec3 getChannelColor(int index) {
    if (index == 0) return color0;
    if (index == 1) return color1;
    if (index == 2) return color2;
    if (index == 3) return color3;
    if (index == 4) return color4;
    if (index == 5) return color5;
    if (index == 6) return color6;
    return vec3(0.0, 0.0, 0.0);
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
// add maxres here
ivec4 getBrickLocation(vec3 location, int targetRes, int channel, float rnd) {

    vec2 clim = getClim(channel);
    int channelMin = getRes(channel).x;
    int channelMax = getRes(channel).y;

    int currentRes = clamp(targetRes, channelMin, channelMax);
    currentRes = clamp(currentRes, resGlobal.x, resGlobal.y);
    int lowestRes = clamp(resGlobal.y, channelMin, channelMax);

    bool requestChannel = false;
    if (int(floor(rnd * float(maxChannels))) == channel) {
        requestChannel = true;
    }

    while (currentRes <= lowestRes) {

        uvec3 anchorPoint = getAnchorPoint(currentRes);
        vec3 brickLocation = getBrickFromNormalized(location, currentRes);
        uvec3 channelOffset = getChannelOffset(channel);
        vec3 coordinate = floor(vec3(anchorPoint * channelOffset)) + brickLocation;
        if (currentRes == 0) {
            int zExtent = int(ceil(float(voxelExtents.z) / 32.0));
            coordinate = vec3(anchorPoint) + vec3(0.0, 0.0, zExtent * channel) + brickLocation;
        }

        uint ptEntry = texelFetch(pageTableTex, ivec3(coordinate), 0).r;
        vec2 clim = getClim(channel);

        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0)) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            continue;
        }
        uint umin = ((ptEntry >> 23u) & 0x7Fu);
        uint umax = ((ptEntry >> 16u) & 0x7Fu);
        float min = float(int(umin)) / 127.0;
        float max = float(int(umax)) / 127.0;
        if (float(max) <= clim.x) {
            return ivec4(0,1,0,-2);
            // EMPTY
        } else if (float(min) >= clim.y) {
            return ivec4(0,0,0,-3);
            // CONSTANT FULL
        } else if ((umax - umin) < 2u) {
            // CONSTANT OTHER VALUE
            return ivec4(min,0,0,-4);
        }
        // check if resident
        uint isResident = (ptEntry >> 31u) & 1u;
        if (isResident == 0u) {
            currentRes++;
            if (requestChannel == true && (gRequest.a + gRequest.b + gRequest.g + gRequest.r == 0.0)) {
                gRequest = packPTCoordToRGBA8(uvec3(coordinate));
            }
            //return ivec4(0,0,0,-10);
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

void setUsage(ivec3 brickCacheOffset, float t_hit_min_os, float t_hit_max_os, float t_os, float rnd) {
    float normalized_t_os = (t_os - t_hit_min_os) / (t_hit_max_os - t_hit_min_os); // should be between 0 and 1
    if (normalized_t_os <= rnd || gUsage == vec4(0.0, 0.0, 0.0, 0.0)) {
        // gUsage = vec4(gUsage.rgb + vec3(0.1), 1.0);
        gUsage = vec4(vec3(brickCacheOffset) / 255.0, 1.0);
    }
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

float voxelStepOS(int res, vec3 osDir) {
    vec3 voxelSize = getScale(res) / vec3(voxelExtents);
    vec3 dt_vec = voxelSize / abs(osDir);
    return min(dt_vec.x, min(dt_vec.y, dt_vec.z));
}

void main(void) {

    // initialize all render targets
    gRequest = vec4(0,0,0,0);
    gUsage = vec4(0,0,0,0);
    gColor = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 outColor = vec4(0.0, 0.0, 0.0, 0.0);

    // random number for jittering
    float rnd = random();

    // normalize the view Ray & intersect with the volume bounds
    vec3 ws_rayDir = normalize(rayDirUnnorm);
    vec2 t_hit = intersect_hit(cameraCorrected, ws_rayDir);
    if (t_hit.x >= t_hit.y) { discard; }
    t_hit.x = max(t_hit.x, 0.0); // cap at 0
    float t = t_hit.x;

    // convert from world space to object space
    float ws2os = length(ws_rayDir / boxSize);  // scalar conversion factor
    float t_hit_min_os = t_hit.x * ws2os;       // entry distance in OS units
    float t_hit_max_os = t_hit.y * ws2os;       // exit  distance in OS units
    float t_os         = t_hit_min_os;          // our new marching parameter

    // initialize resolutions
    // target res based on the distance
    int targetRes = getLOD(t_os, resGlobal.x, resGlobal.y, lodFactor);
    // render defines only stepping distance
    int stepResAdaptive = renderRes;
    int stepResEffective = clamp(stepResAdaptive, 0, 5);

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

    // color accumulation variables
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;
    float alphaMultiplicator = 1.0;

    // request tracking
    bool overWrittenRequest = false;

    // current state tracking
    vec3 currentTargetResPTCoord = vec3(0,0,0);
    int currentLOD = targetRes;

    // constants per channel
    vec3 [] c_color = vec3[7](getChannelColor(0), getChannelColor(1), getChannelColor(2), getChannelColor(3), getChannelColor(4), getChannelColor(5), getChannelColor(6));
    int [] c_res_min = int[7](getRes(0).x, getRes(1).x, getRes(2).x, getRes(3).x, getRes(4).x, getRes(5).x, getRes(6).x);
    int [] c_res_max = int[7](getRes(0).y, getRes(1).y, getRes(2).y, getRes(3).y, getRes(4).y, getRes(5).y, getRes(6).y);
    
    // current vars
    int [] c_res_current = int[7](0,0,0,0,0,0,0);
    float [] c_val_current = float[7](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    vec3 [] c_brickCacheCoord_current = vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 [] c_voxel_current = vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 [] c_ptCoord_current = vec3[7](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    int [] c_renderMode_current = int[7](-1, -1, -1, -1, -1, -1, -1);
    int [] c_res_prev = int[7](-1,-1,-1,-1,-1,-1,-1);

    // pt coord and voxel per resolution
    vec3 [] r_ptCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_voxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevPTCoord = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));
    vec3 [] r_prevVoxel = vec3[10](vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0), vec3(-1.0));

    bool resolutionChanged = false;
    int reps = 0;

    while (t_os < t_hit_max_os && t_os >= t_hit_min_os
        && vec3_max(p) < 1.0 && vec3_min(p) >= 0.0
    ) {

        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        // p goes from 0 to 1
        targetRes = getLOD(t, resGlobal.x, resGlobal.y, lodFactor);

        // TODO: figure out how to best clamp the renderres
        if (targetRes != currentLOD) {
            currentLOD = targetRes;
            stepResAdaptive++;
            stepResEffective = clamp(stepResAdaptive, 0, 5);
            p -= dp * rnd;
            dt = voxelStepOS(stepResEffective, os_rayDir);
            dp = os_rayDir * dt;
            p += dp * rnd;
            resolutionChanged = true;

            if (p.x < 0.0 || p.x >= 1.0 || p.y < 0.0 || p.y >= 1.0 || p.z < 0.0 || p.z >= 1.0) {
                // gColor = vec4(0.0, 1.0, 1.0, 1.0);
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

        vec3 sliceColor = vec3(0.0);
        float sliceAlpha = 0.0;

        // TODO make channel dependent
        for (int c = 0; c < 7; c++) {
            if (c_color[c] == vec3(0.0, 0.0, 0.0)) {
                continue;
            }

            bool newBrick = false;
            bool newVoxel = false;
            int bestRes = clamp(targetRes, c_res_min[c], c_res_max[c]);

            if (r_ptCoord[bestRes] != r_prevPTCoord[bestRes]
                || c_renderMode_current[c] == -1
                || resolutionChanged == true
                ) {
                newBrick = true;
                newVoxel = true;
            } else if (c_renderMode_current[c] == 2) {
                newVoxel = true;
            } else if (c_renderMode_current[c] == 0) {
                continue;
            }

            if (newBrick) {
                ivec4 brickCacheInfo = getBrickLocation(p, bestRes, c, rnd);
                if (brickCacheInfo.w == -1 || brickCacheInfo.w == -2 || brickCacheInfo.w == -10) {
                    // empty
                    c_val_current[c] = 0.0;
                    c_renderMode_current[c] = 0;
                    continue;
                } else if (brickCacheInfo.w == -3) {
                    // solid
                    c_val_current[c] = 1.0;
                    c_renderMode_current[c] = 1;
                    newVoxel = false;
                    // continue;
                } else if (brickCacheInfo.w == -4) {
                    float val = float(brickCacheInfo.x);
                    c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));
                    c_renderMode_current[c] = 1;
                    newVoxel = false;
                    // continue;
                } else if (brickCacheInfo.w >= 0) {
                    // reps++;
                    c_res_current[c] = brickCacheInfo.w;
                    c_ptCoord_current[c] = r_ptCoord[c_res_current[c]];
                    c_brickCacheCoord_current[c] = vec3(brickCacheInfo.xyz);
                    c_renderMode_current[c] = 2;
                    newVoxel = true;
                    if (int(floor(rnd * float(maxChannels))) == c) {
                        setUsage(brickCacheInfo.xyz, t_hit_min_os, t_hit_max_os, t_os, rnd);
                    }
                }
            }
            
            if (newVoxel) {
                c_voxel_current[c] = r_voxel[c_res_current[c]];
                if (c_voxel_current[c] == r_prevVoxel[c_res_current[c]]
                    && c_res_current[c] == c_res_prev[c]) {
                    continue; // TODO: fix here
                }
                reps++;
                vec3 voxelInBrick = mod(c_voxel_current[c], 32.0);
                voxelInBrick = clamp(voxelInBrick, 0.5, 31.49999);
                vec3 brickCacheCoord = vec3(
                    (float(c_brickCacheCoord_current[c].x) * 32.0 + float(voxelInBrick.x)) / 2048.0,
                    (float(c_brickCacheCoord_current[c].y) * 32.0 + float(voxelInBrick.y)) / 2048.0,
                    (float(c_brickCacheCoord_current[c].z) * 32.0 + float(voxelInBrick.z)) / 128.0
                );
                float val = texture(brickCacheTex, brickCacheCoord).r;
                c_val_current[c] = max(0.0, (val - getClim(c).x) / (getClim(c).y - getClim(c).x));
                c_res_prev[c] = c_res_current[c];
                // gColor = vec4(voxelInBrick / 32.0, 1.0);
                // return;
            }

            if (!overWrittenRequest 
                && c_res_current[c] != bestRes
                && c_val_current[c] > 0.0
                && c_renderMode_current[c] == 2
                && int(floor(rnd * float(maxChannels))) == c) {
                setBrickRequest(p, bestRes, c, rnd);
                overWrittenRequest = true;
                // gColor = vec4(1.0, 1.0, 0.0, 1.0);
                // return;
            }

            total += c_val_current[c];
            rgbCombo += c_val_current[c] * c_color[c];

        }

        total = clamp(total, 0.0, 1.0);
        sliceAlpha = total * opacity * dt * 32.0;
        sliceColor = rgbCombo;

        outColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
        outColor.a += sliceAlpha * alphaMultiplicator;
        alphaMultiplicator *= (1.0 - sliceAlpha);

        if (outColor.a > 0.99) { break; }

        t += dt;
        p += dp;
        t_os += dt;
        // reps++;
    }

    // Set all render targets directly without conditionals
    gColor = vec4(linear_to_srgb(outColor.r), 
                  linear_to_srgb(outColor.g), 
                  linear_to_srgb(outColor.b), 
                  outColor.a);
    
    // gColor = vec4(float(reps) / 500.0, 0.0, 0.0, 1.0);

    // gColor = vec4(gRequest.a * 10.0, gRequest.g * 3.0, gRequest.b * 3.0, 1.0);
    // gRequest = vec4(0.0, 0.0, 0.0, 0.0);
    // gColor = linear_to_srgb(gRequest);
    // gRequest = vec4(0.0, 0.0, 0.0, 0.0);

    // gColor = vec4(gRequest.a, gRequest.g, gRequest.b, 1.0);
    // gRequest = vec4(0.0, 0.0, 0.0, 0.0);
    // gColor = linear_to_srgb(gUsage);
}
