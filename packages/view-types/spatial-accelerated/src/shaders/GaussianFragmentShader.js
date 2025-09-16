/*
 * Gaussian Blur Fragment Shader
 *
 * This shader applies Gaussian blur filtering to a texture using different kernel sizes.
 * The blur strength is controlled by the 'gaussian' uniform parameter.
 *
 * ASCII Art Diagrams:
 *
 * 3x3 Gaussian Kernel (gaussian3):
 * ┌─────────┬─────────┬─────────┐
 * │  0.0625 │  0.125  │  0.0625 │
 * ├─────────┼─────────┼─────────┤
 * │  0.125  │   0.25  │  0.125  │
 * ├─────────┼─────────┼─────────┤
 * │  0.0625 │  0.125  │  0.0625 │
 * └─────────┴─────────┴─────────┘
 *
 * 5x5 Gaussian Kernel (gaussian5):
 * ┌─────┬─────┬─────┬─────┬─────┐
 * │ 1/273│ 4/273│ 7/273│ 4/273│ 1/273│
 * ├─────┼─────┼─────┼─────┼─────┤
 * │ 4/273│16/273│26/273│16/273│ 4/273│
 * ├─────┼─────┼─────┼─────┼─────┤
 * │ 7/273│26/273│41/273│26/273│ 7/273│
 * ├─────┼─────┼─────┼─────┼─────┤
 * │ 4/273│16/273│26/273│16/273│ 4/273│
 * ├─────┼─────┼─────┼─────┼─────┤
 * │ 1/273│ 4/273│ 7/273│ 4/273│ 1/273│
 * └─────┴─────┴─────┴─────┴─────┘
 *
 * 7x7 Gaussian Kernel (gaussian7):
 * ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
 * │     │     │ 1/1003│ 2/1003│ 1/1003│     │     │
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │     │ 3/1003│13/1003│22/1003│13/1003│ 3/1003│     │
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │1/1003│13/1003│59/1003│97/1003│59/1003│13/1003│1/1003│
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │2/1003│22/1003│97/1003│159/1003│97/1003│22/1003│2/1003│
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │1/1003│13/1003│59/1003│97/1003│59/1003│13/1003│1/1003│
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │     │ 3/1003│13/1003│22/1003│13/1003│ 3/1003│     │
 * ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 * │     │     │ 1/1003│ 2/1003│ 1/1003│     │     │
 * └─────┴─────┴─────┴─────┴─────┴─────┴─────┘
 *
 * How it works:
 * 1. For each pixel, sample neighboring pixels based on kernel size
 * 2. Weight each sample by the corresponding kernel value
 * 3. Sum all weighted samples to get the blurred pixel color
 * 4. Larger kernels create stronger blur effects
 */

// lang: glsl
export const gaussianFragmentShader = `//
// Input texture to blur
uniform sampler2D tDiffuse;
// Resolution of the texture (width, height)
uniform vec2 resolution;
// Blur strength: 1=no blur, 2-3=3x3 kernel, 4-5=5x5 kernel, 6+=7x7 kernel
uniform int gaussian;
// Texture coordinates for current pixel
varying vec2 vUv;

/**
 * No blur - returns the original pixel color
 */
vec4 noGaussian() {
    vec4 color = texture2D(tDiffuse, vUv);
    return color;
}

/**
 * Applies 3x3 Gaussian blur kernel
 * Samples 9 pixels in a 3x3 grid around the current pixel
 * Weights are based on 2D Gaussian distribution
 */
vec4 gaussian3(vec2 texel) {
    vec4 color = vec4(0.0);

    // Top row: weights [0.0625, 0.125, 0.0625]
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 0.0625;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 0.0625;

    // Middle row: weights [0.125, 0.25, 0.125] (center pixel gets highest weight)
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 0.25;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 0.125;

    // Bottom row: weights [0.0625, 0.125, 0.0625]
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 0.0625;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 0.125;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 0.0625;

    return color;
}

/**
 * Applies 5x5 Gaussian blur kernel
 * Samples 25 pixels in a 5x5 grid around the current pixel
 * Weights sum to 1.0 (273/273) for proper normalization
 */
vec4 gaussian5(vec2 texel) {
    vec4 color = vec4(0.0);

    // Row 1: weights [1/273, 4/273, 7/273, 4/273, 1/273]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -2.0)) * 1.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -2.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -2.0)) * 1.0/273.0;
    
    // Row 2: weights [4/273, 16/273, 26/273, 16/273, 4/273]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -1.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -1.0)) * 4.0/273.0;

    // Row 3 (center): weights [7/273, 26/273, 41/273, 26/273, 7/273]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  0.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 41.0/273.0; // Center pixel
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  0.0)) * 7.0/273.0;
    
    // Row 4: weights [4/273, 16/273, 26/273, 16/273, 4/273]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  1.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 26.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 16.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  1.0)) * 4.0/273.0;
    
    // Row 5: weights [1/273, 4/273, 7/273, 4/273, 1/273]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  2.0)) * 1.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  2.0)) * 7.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  2.0)) * 4.0/273.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  2.0)) * 1.0/273.0;

    return color;
}

/**
 * Applies 7x7 Gaussian blur kernel
 * Samples 49 pixels in a 7x7 grid around the current pixel
 * Weights sum to 1.0 (1003/1003) for proper normalization
 * Creates the strongest blur effect
 */
vec4 gaussian7(vec2 texel) {
    vec4 color = vec4(0.0);

    // Row 1: weights [0, 0, 1/1003, 2/1003, 1/1003, 0, 0]
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -3.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -3.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -3.0)) * 1.0/1003.0;

    // Row 2: weights [0, 3/1003, 13/1003, 22/1003, 13/1003, 3/1003, 0]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -2.0)) * 3.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -2.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -2.0)) * 3.0/1003.0;

    // Row 3: weights [1/1003, 13/1003, 59/1003, 97/1003, 59/1003, 13/1003, 1/1003]
    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0, -1.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0, -1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0, -1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0, -1.0)) * 1.0/1003.0;
    
    // Row 4 (center): weights [2/1003, 22/1003, 97/1003, 159/1003, 97/1003, 22/1003, 2/1003]
    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0,  0.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  0.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  0.0)) * 159.0/1003.0; // Center pixel
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  0.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0,  0.0)) * 2.0/1003.0;
    
    // Row 5: weights [1/1003, 13/1003, 59/1003, 97/1003, 59/1003, 13/1003, 1/1003]
    color += texture2D(tDiffuse, vUv + texel * vec2(-3.0,  1.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)) * 97.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)) * 59.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  1.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 3.0,  1.0)) * 1.0/1003.0;
    
    // Row 6: weights [0, 3/1003, 13/1003, 22/1003, 13/1003, 3/1003, 0]
    color += texture2D(tDiffuse, vUv + texel * vec2(-2.0,  2.0)) * 3.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  2.0)) * 22.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  2.0)) * 13.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 2.0,  2.0)) * 3.0/1003.0;

    // Row 7: weights [0, 0, 1/1003, 2/1003, 1/1003, 0, 0]
    color += texture2D(tDiffuse, vUv + texel * vec2(-1.0,  3.0)) * 1.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 0.0,  3.0)) * 2.0/1003.0;
    color += texture2D(tDiffuse, vUv + texel * vec2( 1.0,  3.0)) * 1.0/1003.0;

    return color;
}

/**
 * Main fragment shader function
 * Determines which blur kernel to apply based on the 'gaussian' uniform
 */
void main() {
    // Calculate the size of one texel (pixel) in texture coordinates
    vec2 texel = 1.0 / resolution;
    
    // Initialize output color (this line appears to be unused/debug code)
    vec4 color = vec4(1.0, 0.0, 0.0, 0.0);

    // TODO: remove these variables since not used
    bool left = vUv.x < 0.5;
    bool top = vUv.y < 0.5;

    if (gaussian > 1 && gaussian <= 3) {
        // Apply 3x3 Gaussian blur for values 2-3
        color = gaussian3(texel);
    } else if (gaussian > 3 && gaussian <= 5) {
        // Apply 5x5 Gaussian blur for values 4-5
        color = gaussian5(texel);
    } else if (gaussian > 5) {
        // Apply 7x7 Gaussian blur for values 6 and above
        color = gaussian7(texel);
    } else {
        // No blur for value 1 or less
        color = noGaussian();
    }

    // Output the final blurred color
    gl_FragColor = color;
}
`;
