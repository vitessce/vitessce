uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform int gaussian;
varying vec2 vUv;

vec4 noGaussian() {
    vec4 color = texture2D(tDiffuse, vUv);
    return color;
}

vec4 gaussian3(vec2 texel) {

    vec4 color = vec4(0.0);

    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 0.0625;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 0.0625;

    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 0.25;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 0.125;

    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 0.0625;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 0.0625;

    return color;
}

vec4 gaussian5(vec2 texel) {

    vec4 color = vec4(0.0);

    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -2.0)) * 1.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -2.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -2.0)) * 1.0/273.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -1.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -1.0)) * 4.0/273.0;

    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  0.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 41.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  0.0)) * 7.0/273.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  1.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  1.0)) * 4.0/273.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  2.0)) * 1.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  2.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  2.0)) * 1.0/273.0;

    return color;
}

vec4 gaussian7(vec2 texel) {
    vec4 color = vec4(0.0);

    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -3.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -3.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -3.0)) * 1.0/1003.0;

    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -2.0)) * 3.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -2.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -2.0)) * 3.0/1003.0;

    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0, -1.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0, -1.0)) * 1.0/1003.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0,  0.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  0.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 159.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  0.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0,  0.0)) * 2.0/1003.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0,  1.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0,  1.0)) * 1.0/1003.0;
    
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  2.0)) * 3.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  2.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  2.0)) * 3.0/1003.0;

    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  3.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  3.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  3.0)) * 1.0/1003.0;

    return color;
}

void main() {
    vec2 texel = 1.0 / resolution;
    vec4 color = vec4(1.0, 0.0, 0.0, 0.0);

    bool left = vUv.x < 0.5;
    bool top = vUv.y < 0.5;

    if (gaussian > 1 && gaussian <= 3) {
        color = gaussian3(texel);
    } else if (gaussian > 3 && gaussian <= 5) {
        color = gaussian5(texel);
    } else if (gaussian > 5) {
        color = gaussian7(texel);
    } else {
        color = noGaussian();
    }

    gl_FragColor = color;
}
