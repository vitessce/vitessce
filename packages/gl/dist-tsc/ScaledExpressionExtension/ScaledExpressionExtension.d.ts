declare class ScaledExpressionExtension {
    getShaders(): {
        modules: {
            name: string;
            vs: string;
            inject: {
                'vs:DECKGL_FILTER_COLOR': string;
            };
        }[];
        defines: {
            COLORMAP_FUNC: any;
        };
    };
    updateState({ props, oldProps }: {
        props: any;
        oldProps: any;
    }): void;
    initializeState(): void;
    draw(): void;
}
declare namespace ScaledExpressionExtension {
    export let extensionName: string;
    export { defaultProps };
}
export default ScaledExpressionExtension;
declare namespace defaultProps {
    namespace colormap {
        export let type: string;
        export { GLSL_COLORMAP_DEFAULT as value };
        export let compare: boolean;
    }
    namespace colorScaleLo {
        let type_1: string;
        export { type_1 as type };
        export let value: number;
        let compare_1: boolean;
        export { compare_1 as compare };
    }
    namespace colorScaleHi {
        let type_2: string;
        export { type_2 as type };
        let value_1: number;
        export { value_1 as value };
        let compare_2: boolean;
        export { compare_2 as compare };
    }
    let isExpressionMode: boolean;
    namespace getExpressionValue {
        let type_3: string;
        export { type_3 as type };
        let value_2: number;
        export { value_2 as value };
    }
    namespace getSelectionState {
        let type_4: string;
        export { type_4 as type };
        let value_3: number;
        export { value_3 as value };
    }
}
import { GLSL_COLORMAP_DEFAULT } from '../constants.js';
//# sourceMappingURL=ScaledExpressionExtension.d.ts.map