export namespace visiumSpatialViewer {
    namespace coordinationSpace {
        namespace embeddingZoom {
            let UMAP: number;
        }
        namespace dataset {
            let A: string;
        }
        namespace embeddingType {
            let UMAP_1: string;
            export { UMAP_1 as UMAP };
        }
        namespace embeddingCellRadiusMode {
            let UMAP_2: string;
            export { UMAP_2 as UMAP };
        }
        namespace embeddingCellRadius {
            let UMAP_3: number;
            export { UMAP_3 as UMAP };
        }
        namespace spatialCellsLayer {
            namespace is_visible {
                let opacity: number;
                let radius: number;
                let visible: boolean;
                let stroked: boolean;
            }
            namespace is_not_visible {
                let opacity_1: number;
                export { opacity_1 as opacity };
                let radius_1: number;
                export { radius_1 as radius };
                let visible_1: boolean;
                export { visible_1 as visible };
                let stroked_1: boolean;
                export { stroked_1 as stroked };
            }
        }
    }
    let datasets: {
        files: ({
            type: string;
            fileType: string;
            url: string;
            options: {
                xy: string;
                mappings: {
                    UMAP: {
                        key: string;
                        dims: number[];
                    };
                };
                matrix?: undefined;
                images?: undefined;
                schemaVersion?: undefined;
                usePhysicalSizeScaling?: undefined;
            };
        } | {
            type: string;
            fileType: string;
            url: string;
            options: {
                matrix: string;
                xy?: undefined;
                mappings?: undefined;
                images?: undefined;
                schemaVersion?: undefined;
                usePhysicalSizeScaling?: undefined;
            };
        } | {
            fileType: string;
            options: {
                images: {
                    name: string;
                    type: string;
                    url: string;
                }[];
                schemaVersion: string;
                usePhysicalSizeScaling: boolean;
                xy?: undefined;
                mappings?: undefined;
                matrix?: undefined;
            };
            type: string;
            url?: undefined;
        })[];
        name: string;
        uid: string;
    }[];
    let description: string;
    let initStrategy: string;
    let layout: ({
        component: string;
        coordinationScopes: {
            dataset: string;
            spatialCellsLayer?: undefined;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingCellRadiusMode?: undefined;
            embeddingCellRadius?: undefined;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            spatialCellsLayer: string;
            dataset: string;
            embeddingType?: undefined;
            embeddingZoom?: undefined;
            embeddingCellRadiusMode?: undefined;
            embeddingCellRadius?: undefined;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        coordinationScopes: {
            embeddingType: string;
            embeddingZoom: string;
            embeddingCellRadiusMode: string;
            embeddingCellRadius: string;
            dataset?: undefined;
            spatialCellsLayer?: undefined;
        };
        h: number;
        w: number;
        x: number;
        y: number;
    } | {
        component: string;
        x: number;
        y: number;
        w: number;
        h: number;
        coordinationScopes?: undefined;
    })[];
    let name: string;
    let version: string;
}
//# sourceMappingURL=visium-spatial-viewer.d.ts.map