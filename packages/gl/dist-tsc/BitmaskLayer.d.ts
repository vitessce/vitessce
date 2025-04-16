declare const BitmaskLayer_base: new (...props: import(".pnpm/@vivjs+types@0.16.1/node_modules/@vivjs/types").Viv<{
    contrastLimits: number[][];
    channelsVisible: boolean[];
    dtype: string;
    domain?: number[] | undefined;
    id?: string | undefined;
    onHover?: Function | undefined;
    onClick?: Function | undefined;
    modelMatrix?: Object | undefined;
    interpolation?: number | undefined;
}, string[]>[]) => any;
/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
declare class BitmaskLayer extends BitmaskLayer_base {
    [x: string]: any;
    getShaders(): {
        fs: string;
        vs: string;
        modules: any[];
        defines: {
            COLORMAP_FUNC: any;
        };
    };
    updateState({ props, oldProps, changeFlags }: {
        props: any;
        oldProps: any;
        changeFlags: any;
    }): void;
    setColorTexture(): void;
    draw(opts: any): void;
    /**
     * This function creates textures from the data
     */
    dataToTexture(data: any, width: any, height: any): any;
}
declare namespace BitmaskLayer {
    export let layerName: string;
    export { defaultProps };
}
export default BitmaskLayer;
declare namespace defaultProps {
    namespace hoveredCell {
        let type: string;
        let value: null;
        let compare: boolean;
    }
    namespace cellColorData {
        let type_1: string;
        export { type_1 as type };
        let value_1: null;
        export { value_1 as value };
        let compare_1: number;
        export { compare_1 as compare };
    }
    namespace colormap {
        let type_2: string;
        export { type_2 as type };
        export { GLSL_COLORMAP_DEFAULT as value };
        let compare_2: boolean;
        export { compare_2 as compare };
    }
    namespace expressionData {
        let type_3: string;
        export { type_3 as type };
        let value_2: null;
        export { value_2 as value };
        let compare_3: number;
        export { compare_3 as compare };
    }
}
import { GLSL_COLORMAP_DEFAULT } from './constants.js';
//# sourceMappingURL=BitmaskLayer.d.ts.map