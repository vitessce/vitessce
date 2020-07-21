/* eslint-disable */
import GL from '@luma.gl/constants';
import { Matrix3 } from 'math.gl';

export const PIXELATED_TEXTURE_PARAMETERS = {
    // NEAREST for integer data to prevent interpolation.
    [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
    // CLAMP_TO_EDGE to remove tile artifacts.
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

/**
 * Get a MathGL transform matrix that transforms
 * by translating and scaling from a source bounding
 * box to a destination bounding box.
 * @param {*} srcBbox 
 * @param {*} dstBbox 
 */
export function getTransformMatrix(srcBbox, dstBbox) {
    const { width: srcWidth, height: srcHeight, x: srcX = 0, y: srcY = 0 } = srcBbox;
    const { width: dstWidth, height: dstHeight, x: dstX = 0, y: dstY = 0 } = dstBbox;

    const transform = new Matrix3();
    transform.translate([dstX, dstY]);
    transform.scale([
        (dstWidth) / (srcWidth),
        (dstHeight) / (srcHeight),
    ]);
    transform.translate([-srcX,  -srcY]);
    return transform;
}