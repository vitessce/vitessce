// Utilities for constructing shaders that handle the coloring of Neuroglancer point annotation layers.
// References:
// - https://github.com/vitessce/vitessce/issues/2359#issuecomment-3572906947
// - https://chanzuckerberg.github.io/cryoet-data-portal/stable/neuroglancer_quickstart.html

/**
 * 
 * @param {number[]} selectedGeneIndices List of gene indices that are selected for coloring.
 * @param {[number, number, number][]} selectedColors RGB color (0, 255) for each selected gene index, in the same order as selectedGeneIndices.
 * @returns 
 */
export function getCategoricalShader(selectedGeneIndices, selectedColors) {
    if(selectedGeneIndices.length !== selectedColors.length) {
        throw new Error("selectedGeneIndices and selectedColors must have the same length");
    }

    // Convert 0-255 RGB values to 0-1 range for GLSL.
    const normalizedColors = selectedColors.map(color => color.map(c => c / 255));
    
    // Create a shader that maps gene indices to the corresponding colors.
    const numGenes = selectedGeneIndices.length;
    const defaultColor = [0.925, 0.925, 0.925]; // Light gray for unselected genes.

    const colorMapVec = `vec3 colorMap[${numGenes}] = vec3[${numGenes}](${normalizedColors.map(c => `vec3(${c.join(', ')})`).join(', ')});`;
    const defaultColorVec = `vec3 defaultColor = vec3(${defaultColor.join(', ')});`;
    const geneIndexMap = `int geneIndexMap[${numGenes}] = int[${numGenes}](${selectedGeneIndices.join(', ')});`;

    // lang: glsl
    const shader = `
        void main() {
            int geneIndex = prop_gene();
            /*
            // Example of what the shader would look like with 10 genes hardcoded:
            const vec3 tab10[10] = vec3[10](
                vec3(0.121, 0.466, 0.705), // blue
                vec3(1.000, 0.498, 0.054), // orange
                vec3(0.172, 0.627, 0.172), // green
                vec3(0.839, 0.153, 0.157), // red
                vec3(0.580, 0.404, 0.741), // purple
                vec3(0.549, 0.337, 0.294), // brown
                vec3(0.890, 0.467, 0.761), // pink
                vec3(0.498, 0.498, 0.498), // gray
                vec3(0.737, 0.741, 0.133), // olive
                vec3(0.090, 0.745, 0.811)  // cyan
            );
            
            vec4 color = vec4(0.925, 0.925, 0.925, 0.0); // Default: fully transparent
            const int gene_indices[10] = int[10](1, 2, 15, 32, 42, 33, 47, 49, 130, 200);
            */
            ${colorMapVec}
            ${defaultColorVec}
            ${geneIndexMap}
            for (int i = 0; i < ${numGenes}; ++i) {
                if (geneIndex == geneIndexMap[i]) {
                    color = vec4(colorMap[i], 1.0);
                }
            }

            if (color.a < 0.01) {
                discard; // Don't render this fragment at all
            }

            setColor(color);
        }
    `;
    return shader;
}

// TODO: other types of shaders, e.g., for continuous color scales, or for coloring by a random color for every gene.
// For a comprehensive list of color encoding scenarios, see `createPointLayer` in spatial-beta/Spatial.js.

