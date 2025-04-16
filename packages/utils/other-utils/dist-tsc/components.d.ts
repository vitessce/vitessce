export declare const DEFAULT_DARK_COLOR: number[];
export declare const DEFAULT_LIGHT_COLOR: number[];
export declare const DEFAULT_LIGHT2_COLOR: number[];
export declare function getDefaultColor(theme: 'dark' | 'light' | 'light2'): number[];
export declare const PALETTE: number[][];
export declare const VIEWER_PALETTE: number[][];
export declare const PATHOLOGY_PALETTE: number[][];
export declare const LARGE_PATHOLOGY_PALETTE: number[][];
export declare const COLORMAP_OPTIONS: string[];
export declare const DEFAULT_GL_OPTIONS: {
    webgl2: boolean;
};
export declare function createDefaultUpdateStatus(componentName: string): (message: string) => void;
export declare function createDefaultUpdateCellsSelection(componentName: string): (cellsSelection: any) => void;
export declare function createDefaultUpdateCellsHover(componentName: string): (hoverInfo: {
    cellId: string;
}) => void;
export declare function createDefaultUpdateGenesHover(componentName: string): (hoverInfo: {
    geneId: string;
}) => void;
export declare function createDefaultUpdateTracksHover(componentName: string): (hoverInfo: any) => void;
export declare function createDefaultUpdateViewInfo(componentName: string): (viewInfo: any) => void;
export declare function createDefaultClearPleaseWait(): () => void;
/**
 * Copy a typed array into a new array buffer.
 * @param {Uint8Array} arr The typed array to be copied.
 * @returns {Uint8Array} The copied array.
 */
export declare function copyUint8Array(arr: Uint8Array): Uint8Array;
export declare function asEsModule(component: any): {
    __esModule: boolean;
    default: any;
};
export declare function formatBytes(bytes: number, decimals?: number): string;
//# sourceMappingURL=components.d.ts.map