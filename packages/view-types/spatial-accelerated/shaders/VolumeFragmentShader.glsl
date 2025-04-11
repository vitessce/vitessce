#include <packing>
precision highp float;
precision mediump sampler3D;
precision highp usampler3D;
// precision highp usampler3D;
in vec3 rayDirUnnorm;
in vec3 cameraCorrected;
// soon to be deprecated
// uniform sampler3D volumeTex;
// uniform sampler3D volumeTex2;
// uniform sampler3D volumeTex3;
// uniform sampler3D volumeTex4;
// uniform sampler3D volumeTex5;
// uniform sampler3D volumeTex6;
// NEW SAMPLERS
uniform sampler3D brickCacheTex;
uniform usampler3D pageTableTex;
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
uniform float alphaScale; // UNUSED
uniform float dtScale;
uniform float finalGamma; // UNUSED
uniform float volumeCount; // -> should be channel count
uniform highp vec3 boxSize;
uniform vec3 u_size; // UNUSED
uniform int u_renderstyle; // UNUSED
uniform float u_opacity; // UNUSED
uniform vec3 u_vol_scale; // UNUSED
uniform float near;
uniform float u_physical_Pixel; // only used for depth computation -> redundant
varying vec2 vUv; // UNUSED
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

void main(void) {

    //STEP 1: Normalize the view Ray',
    vec3 rayDir = normalize(rayDirUnnorm);
    //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume',
    vec2 t_hit = intersect_hit(cameraCorrected, rayDir);
    if (t_hit.x >= t_hit.y) {
      discard;
    }

    // float pt = texture(pageTableTex, vec3(0,0,0)).r;
    uint ptint = texture(pageTableTex, vec3(0,0,0)).r;
    float pt = float(ptint) / 4294967295.0;
    float bc = texture(brickCacheTex, vec3(0,0,0)).r;

    gl_FragColor = vec4(pt, 0.5, bc, 1.0);
    return;
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

    //No sample behind the eye',
    t_hit.x = max(t_hit.x, 0.0);
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