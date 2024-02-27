import {
    Vector2,
    Vector3
} from "../../node_modules/three/build/three.module.js";

var VolumeRenderShaderPerspective = {
    uniforms: {
        "u_size": {value: new Vector3(1, 1, 1)},
        "u_renderstyle": {value: 0},
        "u_renderthreshold": {value: 0.5},
        "u_opacity": {value: 0.5},
        "u_clim": {value: new Vector2(0.2, 0.8)},
        "u_clim2": {value: new Vector2(0.2, 0.8)},
        "u_clim3": {value: new Vector2(0.2, 0.8)},
        "u_clim4": {value: new Vector2(0.2, 0.8)},
        "u_clim5": {value: new Vector2(0.2, 0.8)},
        "u_clim6": {value: new Vector2(0.2, 0.8)},
        "u_data": {value: null},
        "u_stop_geom": {value: null},
        "u_geo_color": {value: null},
        "u_window_size": {value: new Vector2(1, 1)},
        "u_vol_scale": {value: new Vector2(1, 1, 1)},
        "volumeTex": {value: null},
        "volumeTex2": {value: null},
        "volumeTex3": {value: null},
        "volumeTex4": {value: null},
        "volumeTex5": {value: null},
        "volumeTex6": {value: null},
        "u_color": {value: new Vector3(0, 0, 0)},
        "u_color2": {value: new Vector3(0, 0, 0)},
        "u_color3": {value: new Vector3(0, 0, 0)},
        "u_color4": {value: new Vector3(0, 0, 0)},
        "u_color5": {value: new Vector3(0, 0, 0)},
        "u_color6": {value: new Vector3(0, 0, 0)},
        "u_cmdata": {value: null},
        "near": {value: 0.1},
        "far": {value: 10000},
        "alphaScale": {value: 0},
        "dtScale": {value: 1},
        "volumeCount": {value: 0},
        "finalGamma": {value: 0},
        "boxSize": {value: new Vector3(1, 1, 1)},
    },
    vertexShader: [
        "out vec3 rayDirUnnorm;",
        "out vec3 cameraCorrected;",
        "uniform vec3 u_vol_scale;",
        "uniform vec3 u_size;",
        "varying vec3 worldSpaceCoords;",
        "varying vec2 vUv;",
        "uniform highp vec3 boxSize;",
        "void main()",
        "{",
        "   worldSpaceCoords = position / boxSize + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
        "   cameraCorrected = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;",
        "   rayDirUnnorm = position - cameraCorrected;",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),
    fragmentShader: [
        "#include <packing>",
        "precision highp float;",
        " precision mediump sampler3D;",
        "in vec3 rayDirUnnorm;",
        "in vec3 cameraCorrected;",
        "uniform sampler3D volumeTex;",
        "uniform sampler3D volumeTex2;",
        "uniform sampler3D volumeTex3;",
        "uniform sampler3D volumeTex4;",
        "uniform sampler3D volumeTex5;",
        "uniform sampler3D volumeTex6;",
        "uniform vec2 u_clim;",
        "uniform vec2 u_clim2;",
        "uniform vec2 u_clim3;",
        "uniform vec2 u_clim4;",
        "uniform vec2 u_clim5;",
        "uniform vec2 u_clim6;",
        "uniform vec2 u_window_size;",
        "uniform sampler2D u_cmdata;",
        "uniform sampler2D u_stop_geom;",
        "uniform sampler2D u_geo_color;",
        "uniform vec3 u_color;",
        "uniform vec3 u_color2;",
        "uniform vec3 u_color3;",
        "uniform vec3 u_color4;",
        "uniform vec3 u_color5;",
        "uniform vec3 u_color6;",
        "uniform float alphaScale;",
        "uniform float dtScale;",
        "uniform float finalGamma;",
        "uniform float volumeCount;",
        "uniform highp vec3 boxSize;",
        "uniform vec3 u_size;",
        "uniform int u_renderstyle;",
        "uniform float u_opacity;",
        "uniform vec3 u_vol_scale;",
        "uniform float near;",
        "varying vec2 vUv;",
        "uniform float far;",
        "varying vec3 worldSpaceCoords;",
        "vec4 apply_colormap(float val);",
        "float readDepth( sampler2D depthSampler, vec2 coord ) {",
        "        float fragCoordZ = texture2D( depthSampler, coord ).x;",
        "        float viewZ = perspectiveDepthToViewZ( fragCoordZ, near, far );",
        "        return viewZToOrthographicDepth( viewZ, near, far );",
        "}",
        "float readDepthFromFragCoordZ( float fragCoordZ, vec2 coord ) {",
        "        return viewZToOrthographicDepth( fragCoordZ, near, far );",
        "}",
        "vec2 intersect_hit(vec3 orig, vec3 dir) {",
        "  vec3 boxMin = vec3(-0.5) * boxSize;",
        "  vec3 boxMax = vec3( 0.5) * boxSize;",
        "  vec3 invDir = 1.0 / dir;",
        "  vec3 tmin0 = (boxMin - orig) * invDir;",
        "  vec3 tmax0 = (boxMax - orig) * invDir;",
        "  vec3 tmin = min(tmin0, tmax0);",
        "  vec3 tmax = max(tmin0, tmax0);",
        "  float t0 = max(tmin.x, max(tmin.y, tmin.z));",
        "  float t1 = min(tmax.x, min(tmax.y, tmax.z));",
        "  return vec2(t0, t1);",
        "}",
        "   // Pseudo-random number gen from",
        "   // http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/",
        "   // with some tweaks for the range of values",
        "       float wang_hash(int seed) {",
        "     seed = (seed ^ 61) ^ (seed >> 16);",
        "     seed *= 9;",
        "     seed = seed ^ (seed >> 4);",
        "     seed *= 0x27d4eb2d;",
        "     seed = seed ^ (seed >> 15);",
        "     return float(seed % 2147483647) / float(2147483647);",
        "     }",
        "float linear_to_srgb(float x) {",
        "   if (x <= 0.0031308f) {",
        "     return 12.92f * x;",
        "   }",
        "   return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;",
        "}",
        "void main(void) {",
        "  //STEP 1: Normalize the view Ray",
        "  vec3 rayDir = normalize(rayDirUnnorm);",
        "  //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume",
        "  vec2 t_hit = intersect_hit(cameraCorrected, rayDir);",
        "  if (t_hit.x >= t_hit.y) {",
        "    discard;",
        "  }",
        "  //No sample behind the eye",
        "  t_hit.x = max(t_hit.x, 0.0);",
        "  //STEP 3: Compute the step size to march through the volume grid",
        "  ivec3 volumeTexSize = textureSize(volumeTex, 0);",
        "  vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(rayDir));",
        "  float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));",
        "  dt = max(1.0, dt);",
        "  // Ray starting point, in the real space where the box may not be a cube.",
        "  // Prevents a lost WebGL context.",
        "   if (dt < 0.00001) {",
        "     gl_FragColor = vec4(0.0);",
        "     return;",
        "   }",
        " float offset = wang_hash(int(gl_FragCoord.x + 640.0 * gl_FragCoord.y));",
        " vec3 p = cameraCorrected + (t_hit.x + offset + dt) * rayDir;",
        "  // Most browsers do not need this initialization, but add it to be safe.",
        "  gl_FragColor = vec4(0.0);",
        "  p = p / boxSize + vec3(0.5);",
        "  vec3 step = (rayDir * dt) / boxSize;",
        "  // ",
        "  // Initialization of some variables.",
        "	 float max_val = 0.0;",
        "	 float max_val2 = 0.0;",
        "	 float max_val3 = 0.0;",
        "	 float max_val4 = 0.0;",
        "	 float max_val5 = 0.0;",
        "	 float max_val6 = 0.0;",
        "    vec3 rgbCombo = vec3(0.0);",
        "    float total = 0.0;",
        "  int max_i = 30000;",
        "  int i = 0;",
        "  float x = gl_FragCoord.x/u_window_size.x;",
        "  float y = gl_FragCoord.y/u_window_size.y;",
        "  vec3 meshPos = texture2D(u_geo_color, vec2(x,y)).xyz;",
        // "          gl_FragColor=vec4(meshPos,1.0);",
        // "          return;",
        "  float dist = 0.0;",
        "  for (float t = t_hit.x; t < t_hit.y; t += dt) {",
        "       dist = distance(p,meshPos);",
        "       if(meshPos == vec3(0.0,0.0,0.0))",
        "           dist=1.0;",
        // "       if(dist < 0.1){",
        // "		    gl_FragColor = vec4(1.0,0,0,0);",
        // "           return;",
        // "       }",
        "       if(dist< 0.1){",
        "           vec4 val_color = texture2D(u_geo_color, vec2(x,y));",
        "           gl_FragColor.rgb += (1.0 - gl_FragColor.a) * val_color.a * val_color.rgb;",
        "           gl_FragColor.a += (1.0 - gl_FragColor.a) * val_color.a;",
        // "           break;",
        "       }",
        "      float val = texture(volumeTex, p.xyz).r;",
        "      if(val > max_val){",
        "         max_val = val;",
        "       }",
        "      val = max(0.0, (val - u_clim[0]) / (u_clim[1] - u_clim[0]));",
        "      rgbCombo += max(0.0, min(1.0, val)) * u_color;",
        "      total += val;",
        "      if(volumeCount > 1.0){" +
        "       float val2 = texture(volumeTex2, p.xyz).r;",
        "       if(val2 > max_val2){",
        "          max_val2 = val2;",
        "        }",
        "       val2 = max(0.0,(val2 - u_clim2[0]) / (u_clim2[1] - u_clim2[0]));",
        "       rgbCombo += max(0.0, min(1.0, val2)) * u_color2;",
        "       total += val2;",
        "       }",
        "      if(volumeCount > 2.0){" +
        "      float val3 = texture(volumeTex3, p.xyz).r;",
        "      if(val3 > max_val3){",
        "         max_val3 = val3;",
        "       }",
        "       val3 = max(0.0,(val3 - u_clim3[0]) / (u_clim3[1] - u_clim3[0]));",
        "       rgbCombo += max(0.0, min(1.0, val3)) * u_color3;",
        "       total += val3;",
        "       }",
        "      if(volumeCount > 3.0){" +
        "       float val4 = texture(volumeTex4, p.xyz).r;",
        "       if(val4 > max_val4){",
        "          max_val4 = val4;",
        "        }",
        "       val4 = max(0.0,(val4 - u_clim4[0]) / (u_clim4[1] - u_clim4[0]));",
        "       rgbCombo += max(0.0, min(1.0, val4)) * u_color4;",
        "       total += val4;",
        "       }",
        "      if(volumeCount > 4.0){" +
        "      float val5 = texture(volumeTex5, p.xyz).r;",
        "      if(val5 > max_val5){",
        "         max_val5 = val5;",
        "       }",
        "       val5 = max(0.0,(val5 - u_clim5[0]) / (u_clim5[1] - u_clim5[0]));",
        "       rgbCombo += max(0.0, min(1.0, val5)) * u_color5;",
        "       total += val5;",
        "       }",
        "      if(volumeCount > 5.0){" +
        "      float val6 = texture(volumeTex6, p.xyz).r;",
        "      if(val6 > max_val6){",
        "         max_val6 = val6;",
        "       }",
        "       val6 = max(0.0,(val6 - u_clim6[0]) / (u_clim6[1] - u_clim6[0]));",
        "       rgbCombo += max(0.0, min(1.0, val6)) * u_color6;",
        "       total += val6;",
        "       }",
        "       if(u_renderstyle == 0 && (max_val > u_clim[1] && max_val2 >= u_clim2[1] && max_val3 >= u_clim3[1] && max_val4 >= u_clim4[1] && max_val5 >= u_clim5[1] &&  max_val6 >= u_clim6[1])) break;",
        "       if(u_renderstyle == 2){" +
        "           total = min(total, 1.0);",
        "           vec4 val_color = vec4(rgbCombo, total);",
        "           val_color.a = 1.0 - pow(1.0 - val_color.a, 1.0);",
        "           gl_FragColor.rgb += (1.0 - gl_FragColor.a) * val_color.a * val_color.rgb;",
        "           gl_FragColor.a += (1.0 - gl_FragColor.a) * val_color.a;",
        "           if (gl_FragColor.a >= 0.95) {",
        "               break;",
        "           }",
        "       }",
        "       p += step;",
        "  }",
        // "       dist = max(1.0,min(0.0,dist));",
        // "       gl_FragColor = vec4(dist,dist,dist,1.0);",
        // "       return;",
        "       if(u_renderstyle == 0 && (max_val <  u_clim[0] && max_val2 < u_clim2[0] && max_val3 < u_clim3[0] &&" +
        "              max_val4 <  u_clim4[0] && max_val5 <  u_clim5[0] && max_val6 <  u_clim6[0])){",
        "					gl_FragColor = vec4(0,0,0,0);",
        "		 }else{",
        "           max_val = (max_val - u_clim[0]) / (u_clim[1] - u_clim[0]);",
        "           max_val2 = (max_val2 - u_clim2[0]) / (u_clim2[1] - u_clim2[0]);",
        "           max_val3 = (max_val3 - u_clim3[0]) / (u_clim3[1] - u_clim3[0]);",
        "           max_val4 = (max_val4 - u_clim4[0]) / (u_clim4[1] - u_clim4[0]);",
        "           max_val5 = (max_val5 - u_clim5[0]) / (u_clim5[1] - u_clim5[0]);",
        "           max_val6 = (max_val6 - u_clim6[0]) / (u_clim6[1] - u_clim6[0]);",
        // "       vec3 color = texture2D(u_cmdata, vec2(val, 0.5)).rgb;",
        //MIP:
        //Just Take the maximum value for the color
        // Additive:
        "           if(u_renderstyle == 0){",
        "               vec3 color = u_color * max_val;",
        "               if(volumeCount > 1.0) color = color +  u_color2 * max_val2;",
        "               if(volumeCount > 2.0) color = color +  u_color3 * max_val3;",
        "               if(volumeCount > 3.0) color = color +  u_color4 * max_val4;",
        "               if(volumeCount > 4.0) color = color +  u_color5 * max_val5;",
        "               if(volumeCount > 5.0) color = color +  u_color6 * max_val6;",
        "               vec3 colorCorrected = vec3(min(color[0], 1.0), min(color[1],1.0), min(color[2],1.0));",
        " 	            gl_FragColor = vec4(color,1.0);",
        "           }",
        "    }",
        "    gl_FragColor.r = linear_to_srgb(gl_FragColor.r);",
        "    gl_FragColor.g = linear_to_srgb(gl_FragColor.g);",
        "    gl_FragColor.b = linear_to_srgb(gl_FragColor.b);",
        "}",
    ].join("\n")
};

export {VolumeRenderShaderPerspective};
