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
uniform float dtScale;
uniform float volumeCount; // -> should be channel count
uniform highp vec3 boxSize;
uniform float near;
varying vec4 glPosition;
uniform float far;
varying vec3 worldSpaceCoords; // also not really used?

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
float linear_to_srgb(float x) {
    if (x <= 0.0031308f) {
        return 12.92f * x;
    }
    return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;
}

const int targetRes0 = 0; // highest
const int lowestRes = 5;
const uvec3 baseExtents = uvec3(32, 32, 28);
const uvec3 fullResExtents = uvec3(32, 32, 25);

const uvec3 anchorPoint0 = uvec3(0,0,28);
const uvec3 anchorPoint1 = uvec3(16,16,15);
const uvec3 anchorPoint2 = uvec3(8,8,8);
const uvec3 anchorPoint3 = uvec3(4,4,4);
const uvec3 anchorPoint4 = uvec3(2,2,2);
const uvec3 anchorPoint5 = uvec3(1,1,1);

uvec3 getAnchorPoint(int index) {
    if (index == 0) return anchorPoint0;
    if (index == 1) return anchorPoint1;
    if (index == 2) return anchorPoint2;
    if (index == 3) return anchorPoint3;
    if (index == 4) return anchorPoint4;
    return anchorPoint5;
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
ivec4 getBrickLocation(vec3 location, int targetRes, int channel) {

    int currentRes = targetRes;

    while (currentRes <= lowestRes) {
        uvec3 anchorPoint = getAnchorPoint(currentRes);
        // multiplier to scale the [0,1] to the extents in the PT in that res
        float scale = pow(2.0, float(lowestRes) - float(currentRes)); // lowestRes should be 1 
        vec3 channelOffset = vec3(0,0,1); // this is for the 0th channel now
        uvec3 coordinate = uvec3(anchorPoint) + uvec3(location * scale);
        uint ptEntry = texture(pageTableTex, vec3(coordinate)).r;
        uint isInit = (ptEntry >> 30u) & 1u;
        if (isInit == 0u) { 
            currentRes++; 
            // TODO: request brick
            continue;
        }
        uint min = (ptEntry >> 23u) & 0x7Fu;
        uint max = (ptEntry >> 16u) & 0x7Fu;
        if (float(min) > u_clim[0]) {
            return ivec4(-1,0,0,currentRes);
        } else if (float(max) < u_clim[1]) {
            return ivec4(0, -1, 0, currentRes);
        } else if (abs(float(min) - float(max)) < 2.0) {
            return ivec4(0,0,-int(min) * 2,currentRes);
        }
        // check if resident
        uint isResident = (ptEntry >> 31u) & 1u;
        if (isResident == 0u) {
            currentRes++;
            // TODO: request brick
            continue;
        } else {
            uint xBrickCache = (ptEntry >> 10u) & 0x3Fu;
            uint yBrickCache = (ptEntry >> 4u) & 0x3Fu;
            uint zBrickCache = ptEntry & 0xFu;
            uvec3 brickCacheCoord = uvec3(xBrickCache, yBrickCache, zBrickCache);

            return ivec4(brickCacheCoord, currentRes);
        }
    }
    // if target res is 0 return that
    // if target res is not null OR not available, step down until found
    // get bitmask of lowest found
    // genIType bitfieldExtract(	genIType value,  int offset,   int bits);
    // check if init, if not -> res down AND REQUEST
    // if minmax check out -> dont even request
    // check if resident, if not -> size up in res AND REQUEST
    // if resident, return x,y,z,resolution AND ADD TO LRU

    // return x,y,z,resolution (for size) -> maybe add negative values for nonres etc.
    return ivec4(0,0,0,currentRes);
}

// calculations at beginning: dt per res?

// loop through:
// get brick location
    // if brick empty or solid, proceed accordingly
// depending on resolution, begin stepping -> new loop
    // when stepping, sum up and multiply by the dt per res
// depending on target res, try loading new brick
// if no brick found, skip to next brick

// conditionals -> alpha above certain value -> increase target res
// if distance above certain value -> increase target res (?)


void main(void) {

    //STEP 1: Normalize the view Ray
    vec3 rayDir = normalize(rayDirUnnorm);

    //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume
    vec2 t_hit = intersect_hit(cameraCorrected, rayDir);
    if (t_hit.x >= t_hit.y) {
      discard;
    }
    t_hit.x = max(t_hit.x, 0.0);

    // how to query 
    uint ptint = texture(pageTableTex, vec3(0,0,0)).r;
    float pt = float(ptint) / 4294967295.0;
    float bc = texture(brickCacheTex, vec3(16.0/2048.0,16.0/2048.0,16.0/128.0)).r;

    gl_FragColor = vec4(0.1*pt, 0 , 0.1*bc, 1.0);
    // gl_FragColor = vec4(u_color, 1.0);
    // gl_FragColor = vec4(u_clim[0], u_clim[1], 0.0, 1.0);
    // return;

    //STEP 3: Compute the step size to march through the volume grid',
    ivec3 volumeTexSize = textureSize(brickCacheTex, 0);
    volumeTexSize = ivec3(2048,2048,128);
    vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(rayDir));
    float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    dt = max(0.5, dt);
    vec3 p = cameraCorrected + (t_hit.x + dt) * rayDir;
    // Most browsers do not need this initialization, but add it to be safe.',
    gl_FragColor = vec4(0.01);
    p = p / boxSize + vec3(0.5);
    vec3 step = (rayDir * dt) / boxSize;

    // Initialization of some variables.',
    float max_val = 0.0;
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;
    float x = gl_FragCoord.x/u_window_size.x;
    float y = gl_FragCoord.y/u_window_size.y;

    float alphaMultiplicator = 1.0;
    for (float t = t_hit.x; t < t_hit.y; t += dt) {
        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        vec3 brickCacheCoord = vec3(
            p.x * 32.0 / 2048.0,
            p.y * 32.0 / 2048.0,
            p.z * 32.0 / 128.0
        );

        float val = texture(brickCacheTex, brickCacheCoord).r;
        val = max(0.0, (val - u_clim[0]) / (u_clim[1] - u_clim[0]));
        rgbCombo += max(0.0, min(1.0, val)) * u_color;
        total    += val;


        total = clamp(total, 0.0, 1.0);
        float sliceAlpha = total * dtScale * dt;
        vec3 sliceColor  = rgbCombo;

        // DEBUG -- right now if we have 1 channel we add the color multiplied with the alpha.
        // however we should add the full color and then just add the alpha. also we would have
        // to weigh the colors by the alpha if adding multiple.

        gl_FragColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
        gl_FragColor.a   += sliceAlpha * alphaMultiplicator;

        alphaMultiplicator *= (1.0 - sliceAlpha);

        if (gl_FragColor.a > 0.99) {
            break;
        }
        p += step;
    }

    // gl_FragDepth = distance(worldSpaceCoords,p)*u_physical_Pixel;
    gl_FragColor.r = linear_to_srgb(gl_FragColor.r);
    gl_FragColor.g = linear_to_srgb(gl_FragColor.g);
    gl_FragColor.b = linear_to_srgb(gl_FragColor.b);
}


/*
    // For finding the settings for the MESH
    //gl_FragColor = vec4(worldSpaceCoords.xyz,1.0); // COLORED BOX
    //gl_FragColor = vec4(cameraCorrected.x,cameraCorrected.y,cameraCorrected.z,1.0); // CLOSEST PLANE
    //gl_FragColor = vec4(rayDirUnnorm.x,rayDirUnnorm.y,rayDirUnnorm.z,1.0); // RAY DIRECTION (MAKES PLUS SHAPE)
    //gl_FragColor = vec4(t_hit.x/1000.0, 0.0, t_hit.y/1000.0, 1.0); // intersect hits
    //float depth_hit = t_hit.y - t_hit.x;
    //gl_FragColor = vec4(depth_hit/100.0, 0.0, 0.0, 1.0); // intersect hits
    //gl_FragColor = vec4(u_renderstyle==0?1.0:0.0, u_renderstyle==1?1.0:0.0, u_renderstyle==2?1.0:0.0, 1.0); // intersect hits
    //gl_FragColor = vec4(alphaScale, dtScale, 0.0, 1.0);
    //return;
    // NOTE: image opacity scales dtScale, not alphaScale

    //STEP 3: Compute the step size to march through the volume grid',
    ivec3 volumeTexSize = textureSize(volumeTex, 0);
    vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(rayDir));
    float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));
    dt = max(0.5, dt);
    float offset = wang_hash(int(gl_FragCoord.x + 640.0 * gl_FragCoord.y));
    vec3 p = cameraCorrected + (t_hit.x + offset + dt) * rayDir;
    // Most browsers do not need this initialization, but add it to be safe.',
    gl_FragColor = vec4(0.0);
    p = p / boxSize + vec3(0.5);
    vec3 step = (rayDir * dt) / boxSize;

    // Initialization of some variables.',
    float max_val = 0.0;
    float max_val2 = 0.0;
    float max_val3 = 0.0;
    float max_val4 = 0.0;
    float max_val5 = 0.0;
    float max_val6 = 0.0;
    vec3 rgbCombo = vec3(0.0);
    float total = 0.0;
    int max_i = 30000;
    int i = 0;
    float x = gl_FragCoord.x/u_window_size.x;
    float y = gl_FragCoord.y/u_window_size.y;
    //vec3 meshPos = texture2D(u_stop_geom, vec2(x,y)).xyz;
    // "  vec3 meshPos = texture2D(u_stop_geom, vec2(gl_FragCoord.x,gl_FragCoord.y)).xyz;",
    //  "  gl_FragColor = vec4(meshPos,1.0);",
    //  "  return;",
    float alphaMultiplicator = 1.0;
    for (float t = t_hit.x; t < t_hit.y; t += dt) {
        vec3 rgbCombo = vec3(0.0);
        float total   = 0.0;

        float val = texture(pageTableTex, vec3(0,0,0)).r;
        val = max(0.0, (val - u_clim[0]) / (u_clim[1] - u_clim[0]));
        rgbCombo += max(0.0, min(1.0, val)) * u_color;
        total    += val;

        if (volumeCount > 1.0) {
            float val2 = texture(volumeTex2, p).r;
            val2 = max(0.0, (val2 - u_clim2[0]) / (u_clim2[1] - u_clim2[0]));
            rgbCombo += max(0.0, min(1.0, val2)) * u_color2;
            total    += val2;
        }
        if (volumeCount > 2.0) {
            float val3 = texture(volumeTex3, p).r;
            val3 = max(0.0, (val3 - u_clim3[0]) / (u_clim3[1] - u_clim3[0]));
            rgbCombo += max(0.0, min(1.0, val3)) * u_color3;
            total    += val3;
        }
        if (volumeCount > 3.0) {
            float val4 = texture(volumeTex4, p).r;
            val4 = max(0.0, (val4 - u_clim4[0]) / (u_clim4[1] - u_clim4[0]));
            rgbCombo += max(0.0, min(1.0, val4)) * u_color4;
            total    += val4;
        }
        if (volumeCount > 4.0) {
            float val5 = texture(volumeTex5, p).r;
            val5 = max(0.0, (val5 - u_clim5[0]) / (u_clim5[1] - u_clim5[0]));
            rgbCombo += max(0.0, min(1.0, val5)) * u_color5;
            total    += val5;
        }
        if (volumeCount > 5.0) {
            float val6 = texture(volumeTex6, p).r;
            val6 = max(0.0, (val6 - u_clim6[0]) / (u_clim6[1] - u_clim6[0]));
            rgbCombo += max(0.0, min(1.0, val6)) * u_color6;
            total    += val6;
        }

        total = clamp(total, 0.0, 1.0);
        float sliceAlpha = total * dtScale * dt;
        vec3 sliceColor  = rgbCombo;

        // DEBUG -- right now if we have 1 channel we add the color multiplied with the alpha.
        // however we should add the full color and then just add the alpha. also we would have
        // to weigh the colors by the alpha if adding multiple.

        gl_FragColor.rgb += sliceAlpha * alphaMultiplicator * sliceColor;
        gl_FragColor.a   += sliceAlpha * alphaMultiplicator;

        alphaMultiplicator *= (1.0 - sliceAlpha);

        if (gl_FragColor.a > 0.99) {
            break;
        }
        p += step;
    }

    gl_FragDepth = distance(worldSpaceCoords,p)*u_physical_Pixel;
    gl_FragColor.r = linear_to_srgb(gl_FragColor.r);
    gl_FragColor.g = linear_to_srgb(gl_FragColor.g);
    gl_FragColor.b = linear_to_srgb(gl_FragColor.b);
}
*/