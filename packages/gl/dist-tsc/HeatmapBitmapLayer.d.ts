/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
declare class HeatmapBitmapLayer {
    /**
     * Copy of getShaders from Layer (grandparent, parent of BitmapLayer).
     * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/core/src/lib/layer.js#L302
     * @param {object} shaders
     * @returns {object} Merged shaders.
     */
    _getShaders(shaders: object): object;
    /**
     * Need to override to provide custom shaders.
     */
    getShaders(): object;
    updateState(args: any): void;
    /**
     * Need to override to provide additional uniform values.
     * Simplified by removing video-related code.
     * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L173
     * @param {*} opts
     */
    draw(opts: any): void;
    /**
     * Need to override to provide the custom DEFAULT_TEXTURE_PARAMETERS
     * object.
     * Simplified by removing video-related code.
     * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L218
     * @param {Uint8Array} image
     */
    loadTexture(image: Uint8Array): void;
}
declare namespace HeatmapBitmapLayer {
    export let layerName: string;
    export { defaultProps };
}
export default HeatmapBitmapLayer;
declare namespace defaultProps {
    namespace image {
        let type: string;
        let value: null;
        let async: boolean;
    }
    namespace colormap {
        let type_1: string;
        export { type_1 as type };
        export { GLSL_COLORMAP_DEFAULT as value };
        export let compare: boolean;
    }
    namespace bounds {
        let type_2: string;
        export { type_2 as type };
        let value_1: number[];
        export { value_1 as value };
        let compare_1: boolean;
        export { compare_1 as compare };
    }
    namespace aggSizeX {
        let type_3: string;
        export { type_3 as type };
        let value_2: number;
        export { value_2 as value };
        let compare_2: boolean;
        export { compare_2 as compare };
    }
    namespace aggSizeY {
        let type_4: string;
        export { type_4 as type };
        let value_3: number;
        export { value_3 as value };
        let compare_3: boolean;
        export { compare_3 as compare };
    }
    namespace colorScaleLo {
        let type_5: string;
        export { type_5 as type };
        let value_4: number;
        export { value_4 as value };
        let compare_4: boolean;
        export { compare_4 as compare };
    }
    namespace colorScaleHi {
        let type_6: string;
        export { type_6 as type };
        let value_5: number;
        export { value_5 as value };
        let compare_5: boolean;
        export { compare_5 as compare };
    }
}
import { GLSL_COLORMAP_DEFAULT } from './constants.js';
//# sourceMappingURL=HeatmapBitmapLayer.d.ts.map