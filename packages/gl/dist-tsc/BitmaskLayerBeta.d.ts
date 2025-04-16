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
    /**
     * Override the parent loadChannelTextures to enable
     * up to eight channels (rather than six).
     * Reference: https://github.com/hms-dbmi/viv/blob/v0.13.3/packages/layers/src/xr-layer/xr-layer.js#L316
    */
    loadChannelTextures(channelData: any): void;
    updateState({ props, oldProps, changeFlags }: {
        props: any;
        oldProps: any;
        changeFlags: any;
    }): void;
    draw(opts: any): void;
    /**
     * This function creates textures from the data
     */
    dataToTexture(data: any, width: any, height: any): any;
    multiSetsToTexture(multiFeatureValues: any, multiMatrixObsIndex: any, setColorValues: any, channelIsSetColorMode: any): any[];
}
declare namespace BitmaskLayer {
    export let layerName: string;
    export { defaultProps };
}
export default BitmaskLayer;
declare namespace defaultProps {
    namespace channelStrokeWidths {
        let type: string;
        let value: null;
        let compare: boolean;
    }
    namespace channelsFilled {
        let type_1: string;
        export { type_1 as type };
        let value_1: null;
        export { value_1 as value };
        let compare_1: boolean;
        export { compare_1 as compare };
    }
    namespace channelOpacities {
        let type_2: string;
        export { type_2 as type };
        let value_2: null;
        export { value_2 as value };
        let compare_2: boolean;
        export { compare_2 as compare };
    }
    namespace channelColors {
        let type_3: string;
        export { type_3 as type };
        let value_3: null;
        export { value_3 as value };
        let compare_3: boolean;
        export { compare_3 as compare };
    }
    namespace hoveredCell {
        let type_4: string;
        export { type_4 as type };
        let value_4: null;
        export { value_4 as value };
        let compare_4: boolean;
        export { compare_4 as compare };
    }
    namespace colormap {
        let type_5: string;
        export { type_5 as type };
        export { GLSL_COLORMAP_DEFAULT as value };
        let compare_5: boolean;
        export { compare_5 as compare };
    }
    namespace expressionData {
        let type_6: string;
        export { type_6 as type };
        let value_5: null;
        export { value_5 as value };
        let compare_6: boolean;
        export { compare_6 as compare };
    }
    namespace multiFeatureValues {
        let type_7: string;
        export { type_7 as type };
        let value_6: null;
        export { value_6 as value };
        let compare_7: boolean;
        export { compare_7 as compare };
    }
    namespace multiMatrixObsIndex {
        let type_8: string;
        export { type_8 as type };
        let value_7: null;
        export { value_7 as value };
        let compare_8: boolean;
        export { compare_8 as compare };
    }
    namespace setColorValues {
        let type_9: string;
        export { type_9 as type };
        let value_8: null;
        export { value_8 as value };
        let compare_9: boolean;
        export { compare_9 as compare };
    }
    namespace channelFeatureValueColormaps {
        let type_10: string;
        export { type_10 as type };
        let value_9: null;
        export { value_9 as value };
        let compare_10: boolean;
        export { compare_10 as compare };
    }
    namespace channelFeatureValueColormapRanges {
        let type_11: string;
        export { type_11 as type };
        let value_10: null;
        export { value_10 as value };
        let compare_11: boolean;
        export { compare_11 as compare };
    }
    namespace channelIsStaticColorMode {
        let type_12: string;
        export { type_12 as type };
        let value_11: null;
        export { value_11 as value };
        let compare_12: boolean;
        export { compare_12 as compare };
    }
    namespace channelIsSetColorMode {
        let type_13: string;
        export { type_13 as type };
        let value_12: null;
        export { value_12 as value };
        let compare_13: boolean;
        export { compare_13 as compare };
    }
}
import { GLSL_COLORMAP_DEFAULT } from './constants.js';
//# sourceMappingURL=BitmaskLayerBeta.d.ts.map