export const expressionMatrix = {
    rows: ['cell-0', 'cell-1', 'cell-2', 'cell-3', 'cell-4'],
    cols: ['gene-0', 'gene-1', 'gene-2', 'gene-3'],
    // "An image with an 'F' on it has a clear direction so it's easy to tell
    // if it's turned or flipped etc when we use it as a texture."
    // - https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
    matrix: Uint8Array.from([
        0, 255, 255, 0,
        0, 255, 0, 0,
        0, 255, 255, 0,
        0, 255, 0, 0,
        0, 255, 0, 0,
    ]),
};
export const cellColors = new Map([
    ['cell-1', [0, 0, 255]],
    ['cell-0', [0, 0, 255]],
    ['cell-3', [255, 0, 0]],
    ['cell-2', [255, 0, 0]],
]);
