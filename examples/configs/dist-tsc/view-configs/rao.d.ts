export namespace justHiglass {
    let _public: boolean;
    export { _public as public };
    export let initStrategy: string;
    export let version: string;
    export let datasets: {
        uid: string;
        name: string;
        files: never[];
    }[];
    export let name: string;
    export namespace coordinationSpace {
        namespace genomicZoomX {
            let A: number;
        }
        namespace genomicZoomY {
            let A_1: number;
            export { A_1 as A };
        }
        namespace genomicTargetX {
            let A_2: number;
            export { A_2 as A };
        }
        namespace genomicTargetY {
            let A_3: number;
            export { A_3 as A };
        }
    }
    export let layout: {
        component: string;
        coordinationScopes: {
            genomicZoomX: string;
            genomicZoomY: string;
            genomicTargetX: string;
            genomicTargetY: string;
        };
        props: {
            hgViewConfig: {
                uid: string;
                autocompleteSource: string;
                genomePositionSearchBox: {
                    autocompleteServer: string;
                    autocompleteId: string;
                    chromInfoServer: string;
                    chromInfoId: string;
                    visible: boolean;
                };
                chromInfoPath: string;
                tracks: {
                    top: ({
                        type: string;
                        height: number;
                        tilesetUid: string;
                        server: string;
                        uid: string;
                        options: {
                            name: string;
                            fontSize: number;
                            labelPosition: string;
                            labelLeftMargin: number;
                            labelRightMargin: number;
                            labelTopMargin: number;
                            labelBottomMargin: number;
                            minHeight: number;
                            geneAnnotationHeight: number;
                            geneLabelPosition: string;
                            geneStrandSpacing: number;
                            showMousePosition: boolean;
                            mousePositionColor: string;
                            plusStrandColor: string;
                            minusStrandColor: string;
                            labelColor: string;
                            trackBorderWidth: number;
                            trackBorderColor: string;
                            color?: undefined;
                            stroke?: undefined;
                            fontIsLeftAligned?: undefined;
                        };
                        chromInfoPath?: undefined;
                    } | {
                        chromInfoPath: string;
                        type: string;
                        height: number;
                        uid: string;
                        options: {
                            color: string;
                            stroke: string;
                            fontSize: number;
                            fontIsLeftAligned: boolean;
                            showMousePosition: boolean;
                            mousePositionColor: string;
                            name?: undefined;
                            labelPosition?: undefined;
                            labelLeftMargin?: undefined;
                            labelRightMargin?: undefined;
                            labelTopMargin?: undefined;
                            labelBottomMargin?: undefined;
                            minHeight?: undefined;
                            geneAnnotationHeight?: undefined;
                            geneLabelPosition?: undefined;
                            geneStrandSpacing?: undefined;
                            plusStrandColor?: undefined;
                            minusStrandColor?: undefined;
                            labelColor?: undefined;
                            trackBorderWidth?: undefined;
                            trackBorderColor?: undefined;
                        };
                        tilesetUid?: undefined;
                        server?: undefined;
                    })[];
                    left: ({
                        type: string;
                        width: number;
                        tilesetUid: string;
                        server: string;
                        options: {
                            labelPosition: string;
                            name: string;
                            fontSize: number;
                            labelLeftMargin: number;
                            labelRightMargin: number;
                            labelTopMargin: number;
                            labelBottomMargin: number;
                            minWidth: number;
                            geneAnnotationHeight: number;
                            geneLabelPosition: string;
                            geneStrandSpacing: number;
                            showMousePosition: boolean;
                            mousePositionColor: string;
                            plusStrandColor: string;
                            minusStrandColor: string;
                            labelColor: string;
                            trackBorderWidth: number;
                            trackBorderColor: string;
                            color?: undefined;
                            stroke?: undefined;
                            fontIsLeftAligned?: undefined;
                        };
                        uid: string;
                        chromInfoPath?: undefined;
                    } | {
                        chromInfoPath: string;
                        type: string;
                        width: number;
                        uid: string;
                        options: {
                            color: string;
                            stroke: string;
                            fontSize: number;
                            fontIsLeftAligned: boolean;
                            minWidth: number;
                            showMousePosition: boolean;
                            mousePositionColor: string;
                            labelPosition?: undefined;
                            name?: undefined;
                            labelLeftMargin?: undefined;
                            labelRightMargin?: undefined;
                            labelTopMargin?: undefined;
                            labelBottomMargin?: undefined;
                            geneAnnotationHeight?: undefined;
                            geneLabelPosition?: undefined;
                            geneStrandSpacing?: undefined;
                            plusStrandColor?: undefined;
                            minusStrandColor?: undefined;
                            labelColor?: undefined;
                            trackBorderWidth?: undefined;
                            trackBorderColor?: undefined;
                        };
                        tilesetUid?: undefined;
                        server?: undefined;
                    })[];
                    center: {
                        uid: string;
                        type: string;
                        height: number;
                        contents: {
                            server: string;
                            tilesetUid: string;
                            type: string;
                            options: {
                                maxZoom: null;
                                labelPosition: string;
                                name: string;
                                backgroundColor: string;
                                labelLeftMargin: number;
                                labelRightMargin: number;
                                labelTopMargin: number;
                                labelBottomMargin: number;
                                labelShowResolution: boolean;
                                labelShowAssembly: boolean;
                                labelColor: string;
                                labelTextOpacity: number;
                                labelBackgroundColor: string;
                                labelBackgroundOpacity: number;
                                colorRange: string[];
                                colorbarBackgroundColor: string;
                                colorbarBackgroundOpacity: number;
                                colorbarPosition: string;
                                trackBorderWidth: number;
                                trackBorderColor: string;
                                heatmapValueScaling: string;
                                showMousePosition: boolean;
                                mousePositionColor: string;
                                showTooltip: boolean;
                                extent: string;
                                zeroValueColor: null;
                                scaleStartPercent: string;
                                scaleEndPercent: string;
                            };
                            height: number;
                            uid: string;
                            transforms: {
                                name: string;
                                value: string;
                            }[];
                        }[];
                        options: {};
                    }[];
                    right: never[];
                    bottom: never[];
                    whole: never[];
                    gallery: never[];
                };
                layout: {
                    w: number;
                    h: number;
                    x: number;
                    y: number;
                    moved: boolean;
                    static: boolean;
                };
            };
        };
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
//# sourceMappingURL=rao.d.ts.map