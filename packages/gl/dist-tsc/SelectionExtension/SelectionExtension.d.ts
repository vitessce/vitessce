declare class SelectionExtension {
    getShaders(): {
        modules: {
            name: string;
            vs: string;
            inject: {
                'vs:DECKGL_FILTER_GL_POSITION': string;
                'fs:#main-start': string;
            };
        }[];
    };
    initializeState(context: any, extension: any): void;
}
declare namespace SelectionExtension {
    let extensionName: string;
}
export default SelectionExtension;
//# sourceMappingURL=SelectionExtension.d.ts.map