export const coordinationTypeConfigs: {
    [x: number]: any;
};
export const configs: {
    'just-scatter': {
        version: string;
        name: string;
        public: boolean;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                requestInit: {
                    method: string;
                    headers: {
                        'x-foo': string;
                    };
                    mode: string;
                    credentials: string;
                    cache: string;
                    redirect: string;
                    referrer: string;
                    integrity: string;
                };
                type: any;
                fileType: string;
                url: string;
            }[];
        }[];
        coordinationSpace: {
            embeddingType: {
                A: string;
            };
            embeddingZoom: {
                A: number;
            };
        };
        layout: {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
    'just-scatter-expression': {
        version: string;
        name: string;
        public: boolean;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: any;
                fileType: string;
                url: string;
            }[];
        }[];
        coordinationSpace: {
            embeddingType: {
                A: string;
            };
            embeddingZoom: {
                A: number;
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        })[];
    };
    'just-spatial': {
        coordinationSpace: {
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        })[];
        name: string;
        description: string;
        version: string;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: any;
                fileType: string;
                url: string;
            }[];
        }[];
    };
    'just-higlass': {
        public: boolean;
        initStrategy: string;
        version: string;
        datasets: {
            uid: string;
            name: string;
            files: never[];
        }[];
        name: string;
        coordinationSpace: {
            genomicZoomX: {
                A: number;
            };
            genomicZoomY: {
                A: number;
            };
            genomicTargetX: {
                A: number;
            };
            genomicTargetY: {
                A: number;
            };
        };
        layout: {
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
    };
    'codeluppi-2018': {
        name: string;
        description: string;
        version: string;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                options?: undefined;
                coordinationValues?: undefined;
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsLocations: string[];
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                    obsLabels?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsEmbedding: string[];
                    obsLocations?: undefined;
                    obsSets?: undefined;
                    obsLabels?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    embeddingType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsSets: {
                        name: string;
                        column: string[];
                    }[];
                    obsLocations?: undefined;
                    obsEmbedding?: undefined;
                    obsLabels?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsLabels: string;
                    obsLocations?: undefined;
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType?: undefined;
                };
                options?: undefined;
            } | {
                fileType: string;
                options: {
                    schemaVersion: string;
                    images: {
                        name: string;
                        url: string;
                        type: string;
                        metadata: {
                            dimensions: ({
                                field: string;
                                type: string;
                                values: string[];
                            } | {
                                field: string;
                                type: string;
                                values: null;
                            })[];
                            isPyramid: boolean;
                            transform: {
                                translate: {
                                    y: number;
                                    x: number;
                                };
                                scale: number;
                            };
                        };
                    }[];
                    obsIndex?: undefined;
                    obsLocations?: undefined;
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                    obsLabels?: undefined;
                };
                url?: undefined;
                coordinationValues?: undefined;
            })[];
        }[];
        coordinationSpace: {
            embeddingZoom: {
                PCA: number;
                TSNE: number;
            };
            embeddingType: {
                PCA: string;
                TSNE: string;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
            spatialPointLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                };
            };
        };
        layout: ({
            component: string;
            props: {
                description: string;
                channelNamesVisible?: undefined;
                transpose?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                spatialSegmentationLayer: string;
                spatialPointLayer: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                spatialSegmentationLayer: string;
                spatialPointLayer: string;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
            };
            props: {
                channelNamesVisible: boolean;
                description?: undefined;
                transpose?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            props: {
                transpose: boolean;
                description?: undefined;
                channelNamesVisible?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                spatialSegmentationLayer?: undefined;
                spatialPointLayer?: undefined;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
    };
    'codeluppi-2018-via-zarr': {
        name: string;
        description: string;
        version: string;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                options: {
                    obsFeatureMatrix: {
                        path: string;
                    };
                    obsSegmentations: {
                        path: string;
                    };
                    obsLocations: {
                        path: string;
                    };
                    obsEmbedding: {
                        path: string;
                        embeddingType: string;
                    }[];
                    obsSets: {
                        name: string;
                        path: string[];
                    }[];
                    obsLabels?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    obsLocations: {
                        path: string;
                    };
                    obsLabels: {
                        path: string;
                    };
                    obsFeatureMatrix?: undefined;
                    obsSegmentations?: undefined;
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                    schemaVersion?: undefined;
                    images?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                options: {
                    schemaVersion: string;
                    images: {
                        name: string;
                        url: string;
                        type: string;
                        metadata: {
                            dimensions: ({
                                field: string;
                                type: string;
                                values: string[];
                            } | {
                                field: string;
                                type: string;
                                values: null;
                            })[];
                            isPyramid: boolean;
                            transform: {
                                translate: {
                                    y: number;
                                    x: number;
                                };
                                scale: number;
                            };
                        };
                    }[];
                    obsFeatureMatrix?: undefined;
                    obsSegmentations?: undefined;
                    obsLocations?: undefined;
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                    obsLabels?: undefined;
                };
                url?: undefined;
                coordinationValues?: undefined;
            })[];
        }[];
        coordinationSpace: {
            embeddingZoom: {
                PCA: number;
                TSNE: number;
            };
            embeddingType: {
                PCA: string;
                TSNE: string;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
            spatialPointLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                };
            };
        };
        layout: ({
            component: string;
            props: {
                description: string;
                transpose?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                spatialSegmentationLayer: string;
                spatialPointLayer: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                spatialSegmentationLayer: string;
                spatialPointLayer: string;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            props: {
                transpose: boolean;
                description?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                spatialSegmentationLayer?: undefined;
                spatialPointLayer?: undefined;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
    };
    'combat-2022': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
                options: {
                    path: string;
                    featureFilterPath?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
                options: {
                    name: string;
                    path: string;
                }[];
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType?: undefined;
                };
                options: {
                    path: string;
                    featureFilterPath: string;
                };
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            embeddingZoom: {
                A: null;
            };
            embeddingTargetX: {
                A: null;
            };
            embeddingTargetY: {
                A: null;
            };
            embeddingObsSetLabelsVisible: {
                A: boolean;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
                B: string;
            };
            featureValueType: {
                A: string;
                B: string;
            };
            obsColorEncoding: {
                A: string;
                B: string;
            };
            featureSelection: {
                A: null;
                B: null;
            };
            featureValueColormapRange: {
                A: number[];
                B: number[];
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                obsColorEncoding?: undefined;
                featureSelection?: undefined;
                embeddingZoom?: undefined;
                embeddingTargetX?: undefined;
                embeddingTargetY?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                obsColorEncoding: string;
                featureSelection: string;
                embeddingZoom: string;
                embeddingTargetX: string;
                embeddingTargetY: string;
                embeddingObsSetLabelsVisible: string;
                featureValueColormapRange: string;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                obsColorEncoding: string;
                featureSelection: string;
                embeddingType?: undefined;
                featureValueType?: undefined;
                embeddingZoom?: undefined;
                embeddingTargetX?: undefined;
                embeddingTargetY?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
        })[];
    };
    'habib-2017': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                        initialFeatureFilterPath: string;
                    };
                    obsEmbedding: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                };
            }[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
            };
            featureValueType: {
                A: string;
            };
            featureValueColormapRange: {
                A: number[];
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
                embeddingType?: undefined;
            };
            props: {
                transpose: boolean;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureType: string;
                obsType?: undefined;
                embeddingType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
            props?: undefined;
        })[];
    };
    'habib-2017-zip': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                        initialFeatureFilterPath: string;
                    };
                    obsEmbedding: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                };
            }[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
            };
            featureValueType: {
                A: string;
            };
            featureValueColormapRange: {
                A: number[];
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
                embeddingType?: undefined;
            };
            props: {
                transpose: boolean;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureType: string;
                obsType?: undefined;
                embeddingType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
            props?: undefined;
        })[];
    };
    'habib-2017-with-quality-metrics': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                        initialFeatureFilterPath: string;
                    };
                    obsEmbedding: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType?: undefined;
                };
                options: {
                    path: string;
                }[];
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
                B: string;
            };
            featureValueType: {
                A: string;
                B: string;
            };
            featureValueColormapRange: {
                A: number[];
            };
            featureSelection: {
                B: null;
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType?: undefined;
                featureValueType?: undefined;
                featureSelection?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureSelection: string;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
                featureSelection?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
                featureSelection?: undefined;
                embeddingType?: undefined;
            };
            props: {
                transpose: boolean;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureType: string;
                obsType?: undefined;
                featureValueType?: undefined;
                featureSelection?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes: {
                featureType: string;
                featureSelection: string;
                obsType?: undefined;
                featureValueType?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
            };
            props?: undefined;
        })[];
    };
    'human-lymph-node-10x-visium': {
        version: string;
        name: string;
        description: string;
        initStrategy: string;
        datasets: {
            uid: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                        featureFilterPath: string;
                    };
                    obsLocations: {
                        path: string;
                    };
                    obsSegmentations: {
                        path: string;
                    };
                    obsEmbedding: {
                        path: string;
                        embeddingType: string;
                    }[];
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues?: undefined;
                options?: undefined;
            })[];
        }[];
        coordinationSpace: {
            obsType: {
                A: string;
            };
            spatialSegmentationLayer: {
                A: {
                    radius: number;
                    stroked: boolean;
                    visible: boolean;
                    opacity: number;
                };
            };
            spatialImageLayer: {
                A: {
                    type: string;
                    index: number;
                    colormap: null;
                    transparentColor: null;
                    opacity: number;
                    domainType: string;
                    channels: {
                        selection: {
                            c: number;
                        };
                        color: number[];
                        visible: boolean;
                        slider: number[];
                    }[];
                }[];
            };
            obsColorEncoding: {
                A: string;
                B: string;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            featureSelection: {
                A: string[];
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                obsType: string;
                spatialImageLayer: string;
                spatialSegmentationLayer: string;
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                obsColorEncoding: string;
                featureSelection?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                spatialImageLayer: string;
                spatialSegmentationLayer: string;
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                obsColorEncoding: string;
                featureSelection: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                obsColorEncoding: string;
                spatialImageLayer?: undefined;
                spatialSegmentationLayer?: undefined;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                featureSelection?: undefined;
            };
            props: {
                transpose: boolean;
                disableChannelsIfRgbDetected?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                spatialImageLayer: string;
                spatialSegmentationLayer: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                obsColorEncoding?: undefined;
                featureSelection?: undefined;
            };
            props: {
                disableChannelsIfRgbDetected: boolean;
                transpose?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                obsColorEncoding: string;
                spatialImageLayer?: undefined;
                spatialSegmentationLayer?: undefined;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                featureSelection?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                obsColorEncoding: string;
                featureSelection: string;
                spatialImageLayer?: undefined;
                spatialSegmentationLayer?: undefined;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
    };
    'kuppe-2022': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
                options: {
                    name: string;
                    path: string;
                }[];
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                    };
                    featureLabels: {
                        path: string;
                    };
                    obsEmbedding: {
                        path: string;
                        embeddingType: string;
                    }[];
                    obsLocations?: undefined;
                    obsSegmentations?: undefined;
                    obsSets?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
                options: {
                    obsLocations: {
                        path: string;
                    };
                    obsSegmentations: {
                        path: string;
                    };
                    obsFeatureMatrix: {
                        path: string;
                    };
                    featureLabels: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                    obsEmbedding?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues?: undefined;
                options?: undefined;
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                RNA_UMAP: string;
                RNA_PCA: string;
                ATAC_UMAP: string;
            };
            obsType: {
                A: string;
                B: string;
            };
            featureType: {
                A: string;
            };
            featureValueType: {
                A: string;
                B: string;
                C: string;
            };
            featureSelection: {
                A: null;
            };
            obsColorEncoding: {
                A: string;
            };
            obsSetSelection: {
                A: null;
                B: null;
            };
            obsSetColor: {
                A: null;
                B: null;
            };
            featureValueColormapRange: {
                A: number[];
                B: number[];
            };
            embeddingObsSetLabelsVisible: {
                A: boolean;
            };
            spatialImageLayer: {
                A: {
                    type: string;
                    index: number;
                    colormap: null;
                    transparentColor: null;
                    opacity: number;
                    domainType: string;
                    channels: {
                        selection: {
                            c: number;
                        };
                        color: number[];
                        visible: boolean;
                        slider: number[];
                    }[];
                }[];
            };
            spatialSegmentationLayer: {
                A: {
                    radius: number;
                    stroked: boolean;
                    visible: boolean;
                    opacity: number;
                };
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                obsColorEncoding: string;
                obsSetSelection: string;
                obsSetColor: string;
                featureType?: undefined;
                featureValueType?: undefined;
                spatialSegmentationLayer?: undefined;
                spatialImageLayer?: undefined;
                featureSelection?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                obsColorEncoding: string;
                obsSetColor: string;
                obsSetSelection: string;
                featureType: string;
                featureValueType: string;
                spatialSegmentationLayer: string;
                spatialImageLayer: string;
                featureSelection: string;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureSelection: string;
                obsColorEncoding: string;
                obsSetColor: string;
                obsSetSelection: string;
                featureValueColormapRange: string;
                embeddingObsSetLabelsVisible: string;
                spatialSegmentationLayer?: undefined;
                spatialImageLayer?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureType: string;
                featureSelection: string;
                obsColorEncoding: string;
                obsType?: undefined;
                obsSetSelection?: undefined;
                obsSetColor?: undefined;
                featureValueType?: undefined;
                spatialSegmentationLayer?: undefined;
                spatialImageLayer?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                spatialSegmentationLayer: string;
                spatialImageLayer: string;
                obsColorEncoding?: undefined;
                obsSetSelection?: undefined;
                obsSetColor?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                featureSelection?: undefined;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
            };
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
        })[];
    };
    'marshall-2022': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                        featureFilterPath: string;
                    };
                    obsEmbedding: {
                        path: string;
                    };
                    obsLocations: {
                        path: string;
                    };
                    obsSegmentations: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                    featureLabels: {
                        path: string;
                    };
                };
            }[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
            };
            featureValueType: {
                A: string;
            };
            featureValueColormapRange: {
                A: number[];
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
                spatialSegmentationLayer?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureValueColormapRange: string;
                spatialSegmentationLayer?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                spatialSegmentationLayer: string;
                featureValueColormapRange: string;
                embeddingType?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                spatialSegmentationLayer: string;
                embeddingType?: undefined;
                featureValueColormapRange?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                embeddingType?: undefined;
                featureValueType?: undefined;
                featureValueColormapRange?: undefined;
                spatialSegmentationLayer?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
        })[];
    };
    'meta-2022-azimuth': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsFeatureMatrix: {
                        path: string;
                    };
                    obsEmbedding: {
                        path: string;
                    };
                    featureLabels: {
                        path: string;
                    };
                    obsSets: ({
                        name: string;
                        path: string;
                    } | {
                        name: string;
                        path: string[];
                    })[];
                };
            }[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsType: {
                A: string;
            };
            featureType: {
                A: string;
            };
            featureValueType: {
                A: string;
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                obsType: string;
                embeddingType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                obsType: string;
                featureType: string;
                featureValueType: string;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureType: string;
                obsType?: undefined;
                embeddingType?: undefined;
                featureValueType?: undefined;
            };
            uid: string;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            uid: string;
            coordinationScopes?: undefined;
        })[];
    };
    'eng-2019': {
        name: string;
        version: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType: string;
                };
                options: {
                    obsIndex: string;
                    obsEmbedding: string[];
                    obsLocations?: undefined;
                    obsSets?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options: {
                    obsIndex: string;
                    obsLocations: string[];
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options: {
                    obsIndex: string;
                    obsSets: {
                        name: string;
                        column: string;
                    }[];
                    obsEmbedding?: undefined;
                    obsLocations?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options?: undefined;
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                TSNE: string;
                UMAP: string;
            };
            embeddingObsSetPolygonsVisible: {
                A: boolean;
            };
            embeddingObsSetLabelsVisible: {
                A: boolean;
            };
            embeddingObsSetLabelSize: {
                A: number;
            };
            embeddingObsRadiusMode: {
                A: string;
            };
            embeddingObsRadius: {
                A: number;
            };
            embeddingZoom: {
                TSNE: number;
                UMAP: number;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
        };
        layout: ({
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                embeddingObsSetLabelsVisible: string;
                embeddingObsSetLabelSize: string;
                embeddingObsSetPolygonsVisible: string;
                embeddingObsRadiusMode: string;
                embeddingObsRadius: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                spatialSegmentationLayer?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            props: {
                cellRadius: number;
            };
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                spatialSegmentationLayer: string;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
                embeddingObsSetLabelSize?: undefined;
                embeddingObsSetPolygonsVisible?: undefined;
                embeddingObsRadiusMode?: undefined;
                embeddingObsRadius?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
    };
    'wang-2018': {
        name: string;
        version: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
                options?: undefined;
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsLocations: string[];
                    obsLabels?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    obsIndex: string;
                    obsLabels: string;
                    obsLocations?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
                options?: undefined;
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            spatialZoom: {
                A: number;
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
            spatialPointLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                };
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialSegmentationLayer: string;
                spatialPointLayer: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        })[];
    };
    'spraggins-2020': {
        version: string;
        name: string;
        public: boolean;
        staticLayout: ({
            component: string;
            props: {
                view: {
                    zoom: number;
                    target: number[];
                };
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
        description: string;
        layers: {
            name: string;
            type: string;
            fileType: string;
            url: string;
        }[];
    };
    'neumann-2020': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: string;
                fileType: string;
                options: {
                    schemaVersion: string;
                    images: {
                        name: string;
                        type: string;
                        url: string;
                    }[];
                    usePhysicalSizeScaling: boolean;
                    renderLayers: string[];
                };
            }[];
        }[];
        coordinationSpace: {};
        layout: {
            component: string;
            coordinationScopes: {};
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
        initStrategy: string;
    };
    'satija-2020': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    embeddingType: string;
                };
                options: {
                    obsEmbedding: {
                        path: string;
                    };
                    obsFeatureMatrix: {
                        path: string;
                    };
                    obsLabels: {
                        path: string;
                        obsLabelsType: string;
                    }[];
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    featureType?: undefined;
                    featureValueType?: undefined;
                    embeddingType?: undefined;
                };
                options?: undefined;
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                UMAP: string;
            };
            obsLabelsType: {
                A: string;
            };
            embeddingZoom: {
                A: number;
            };
            embeddingTargetX: {
                A: number;
            };
            embeddingTargetY: {
                A: number;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            featureValueColormapRange: {
                A: number[];
            };
        };
        layout: ({
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType?: undefined;
                embeddingZoom?: undefined;
                embeddingTargetX?: undefined;
                embeddingTargetY?: undefined;
                obsLabelsType?: undefined;
                featureValueColormapRange?: undefined;
            };
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                embeddingTargetX: string;
                embeddingTargetY: string;
                obsLabelsType: string[];
                featureValueColormapRange?: undefined;
            };
            props?: undefined;
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes: {
                featureValueColormapRange: string;
                obsLabelsType: string[];
                embeddingType?: undefined;
                embeddingZoom?: undefined;
                embeddingTargetX?: undefined;
                embeddingTargetY?: undefined;
            };
            props: {
                transpose: boolean;
            };
        } | {
            component: string;
            h: number;
            w: number;
            x: number;
            y: number;
            coordinationScopes?: undefined;
            props?: undefined;
        })[];
    };
    'sn-atac-seq-hubmap-2020': any;
    'sc-atac-seq-10x-genomics-pbmc': {
        version: string;
        name: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: string;
                fileType: string;
                url: string;
            }[];
        }[];
        layout: ({
            component: string;
            props: {
                profileTrackUidKey: string;
                description?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            props: {
                description: string;
                profileTrackUidKey?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
        initStrategy: string;
    };
    'blin-2019': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
            }[];
        }[];
        initStrategy: string;
        layout: ({
            component: string;
            props: {
                channelNamesVisible: boolean;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
    };
    'ome-ngff-multi': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                options: {
                    schemaVersion: string;
                    renderLayers: string[];
                    images: {
                        name: string;
                        type: string;
                        url: string;
                    }[];
                };
            }[];
        }[];
        initStrategy: string;
        layout: {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
    'ome-ngff-v0.1': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: string;
                fileType: string;
                url: string;
            }[];
        }[];
        coordinationSpace: {
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
        };
        initStrategy: string;
        layout: ({
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        })[];
    };
    'rgb-ome-tiff': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
            }[];
        }[];
        coordinationSpace: {
            photometricInterpretation: {
                'init_HBM836.VTFP.364_image_0': string;
            };
        };
        initStrategy: string;
        layout: ({
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            props: {
                disableChannelsIfRgbDetected: boolean;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
    };
    'segmentations-ome-tiff': {
        version: string;
        name: string;
        description: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: {
                fileType: string;
                url: string;
                options: {
                    offsetsUrl: string;
                };
            }[];
        }[];
        initStrategy: string;
        layout: {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
    'linnarsson-2018': {
        name: string;
        description: string;
        version: string;
        initStrategy: string;
        public: boolean;
        datasets: {
            uid: string;
            name: string;
            files: ({
                type: string;
                fileType: string;
                url: string;
                options: {
                    embeddingTypes: string[];
                };
            } | {
                type: string;
                fileType: string;
                url: string;
                options?: undefined;
            } | {
                fileType: string;
                url: string;
                type?: undefined;
                options?: undefined;
            })[];
        }[];
        coordinationSpace: {
            embeddingZoom: {
                PCA: number;
                TSNE: number;
            };
            embeddingType: {
                PCA: string;
                TSNE: string;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
        };
        layout: ({
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
            coordinationScopes?: undefined;
        } | {
            component: string;
            props: {
                globalDisable3d: boolean;
                disableChannelsIfRgbDetected: boolean;
                transpose?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            props: {
                transpose: boolean;
                globalDisable3d?: undefined;
                disableChannelsIfRgbDetected?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
    };
    'visium-spatial-viewer': {
        coordinationSpace: {
            embeddingZoom: {
                UMAP: number;
            };
            dataset: {
                A: string;
            };
            embeddingType: {
                UMAP: string;
            };
            embeddingCellRadiusMode: {
                UMAP: string;
            };
            embeddingCellRadius: {
                UMAP: number;
            };
            spatialCellsLayer: {
                is_visible: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
                is_not_visible: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
        };
        datasets: {
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
        description: string;
        initStrategy: string;
        layout: ({
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
        name: string;
        version: string;
    };
    'spatialdata-visium': any;
    'spatialdata-visium_io': any;
    'spatialdata-mcmicro_io': any;
    gating: {
        public: boolean;
        coordinationSpace: {
            embeddingZoom: {
                PCA: number;
                TSNE: number;
            };
            embeddingType: {
                PCA: string;
                TSNE: string;
            };
        };
        layout: ({
            component: string;
            props: {
                description: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
            coordinationScopes?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
        name: string;
        description: string;
        version: string;
        initStrategy: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                type: any;
                fileType: string;
                url: string;
            }[];
        }[];
    };
    vanderbilt: {
        version: string;
        name: string;
        public: boolean;
        staticLayout: ({
            component: string;
            props: {
                view: {
                    zoom: number;
                    target: number[];
                };
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        })[];
        description: string;
        layers: {
            name: string;
            type: string;
            fileType: string;
            url: string;
        }[];
    };
    'dries-2019': {
        name: string;
        version: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType: string;
                };
                options: {
                    obsIndex: string;
                    obsEmbedding: string[];
                    obsLocations?: undefined;
                    obsSets?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options: {
                    obsIndex: string;
                    obsLocations: string[];
                    obsEmbedding?: undefined;
                    obsSets?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options: {
                    obsIndex: string;
                    obsSets: {
                        name: string;
                        column: string;
                    }[];
                    obsEmbedding?: undefined;
                    obsLocations?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                coordinationValues: {
                    obsType: string;
                    embeddingType?: undefined;
                };
                options?: undefined;
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            embeddingType: {
                TSNE: string;
                UMAP: string;
            };
            embeddingObsSetPolygonsVisible: {
                A: boolean;
            };
            embeddingObsSetLabelsVisible: {
                A: boolean;
            };
            embeddingObsSetLabelSize: {
                A: number;
            };
            embeddingObsRadiusMode: {
                A: string;
            };
            embeddingObsRadius: {
                A: number;
            };
            embeddingZoom: {
                TSNE: number;
                UMAP: number;
            };
            spatialZoom: {
                A: number;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            spatialSegmentationLayer: {
                A: {
                    opacity: number;
                    radius: number;
                    visible: boolean;
                    stroked: boolean;
                };
            };
        };
        layout: ({
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
            coordinationScopes?: undefined;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                embeddingType: string;
                embeddingZoom: string;
                embeddingObsSetLabelsVisible: string;
                embeddingObsSetLabelSize: string;
                embeddingObsSetPolygonsVisible: string;
                embeddingObsRadiusMode: string;
                embeddingObsRadius: string;
                spatialZoom?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                spatialSegmentationLayer?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            props: {
                cellRadius: number;
            };
            coordinationScopes: {
                spatialZoom: string;
                spatialTargetX: string;
                spatialTargetY: string;
                spatialSegmentationLayer: string;
                embeddingType?: undefined;
                embeddingZoom?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
                embeddingObsSetLabelSize?: undefined;
                embeddingObsSetPolygonsVisible?: undefined;
                embeddingObsRadiusMode?: undefined;
                embeddingObsRadius?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
    };
    'lake-2023': any;
    'salcher-2022': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: {
                url: string;
                fileType: string;
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
                options: {
                    obsEmbedding: {
                        path: string;
                        embeddingType: string;
                    }[];
                    obsFeatureMatrix: {
                        path: string;
                    };
                    obsSets: {
                        name: string;
                        path: string;
                    }[];
                    featureLabels: {
                        path: string;
                    };
                };
            }[];
        }[];
        coordinationSpace: {
            dataset: {
                A: string;
            };
            embeddingType: {
                A: string;
            };
            featureSelection: {
                A: string[];
            };
            obsColorEncoding: {
                A: string;
            };
            embeddingObsSetLabelsVisible: {
                A: boolean;
            };
            featureValueColormapRange: {
                A: number[];
            };
            featureValueColormap: {
                A: string;
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                dataset: string;
                obsColorEncoding: string;
                featureSelection: string;
                embeddingType?: undefined;
                obsSetLabelsVisible?: undefined;
                embeddingObsSetLabelsVisible?: undefined;
                featureValueColormapRange?: undefined;
                featureValueColormap?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            coordinationScopes: {
                dataset: string;
                embeddingType: string;
                obsSetLabelsVisible: string;
                obsColorEncoding: string;
                featureSelection: string;
                embeddingObsSetLabelsVisible: string;
                featureValueColormapRange: string;
                featureValueColormap: string;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
        initStrategy: string;
    };
    'maynard-2021': any;
    'blin-2019-2': any;
    'blin-2019-3': any;
    'codex-2023': any;
    'visium-2023-image-only': any;
    'visium-2023': any;
    'codeluppi-2018-2': any;
    'kpmp-2023': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                options: {
                    offsetsUrl: string;
                    path?: undefined;
                };
                coordinationValues: {
                    fileUid: string;
                    obsType?: undefined;
                    featureType?: undefined;
                    featureValueType?: undefined;
                };
            } | {
                fileType: string;
                url: string;
                options: {
                    path: string;
                    offsetsUrl?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                    fileUid?: undefined;
                };
            })[];
        }[];
        initStrategy: string;
        coordinationSpace: {
            fileUid: {
                bitmask: string;
                rgb: string;
            };
            imageLayer: {
                histology: string;
            };
            imageChannel: {
                R: string;
                G: string;
                B: string;
            };
            segmentationLayer: {
                ml: string;
            };
            segmentationChannel: {
                ci: string;
                ngsg: string;
                gsg: string;
                t: string;
                a: string;
                ifta: string;
                ptc: string;
            };
            obsType: {
                ci: string;
                ngsg: string;
                gsg: string;
                t: string;
                a: string;
                ifta: string;
                ptc: string;
            };
            obsColorEncoding: {
                ci: string;
                ngsg: string;
                gsg: string;
                t: string;
                a: string;
                ifta: string;
                ptc: string;
            };
            featureValueColormap: {
                ci: string;
                ngsg: string;
                gsg: string;
                t: string;
                a: string;
                ifta: string;
                ptc: string;
            };
            featureValueColormapRange: {
                ci: number[];
                ngsg: number[];
                gsg: number[];
                t: number[];
                a: number[];
                ifta: number[];
                ptc: number[];
            };
            featureType: {
                global: string;
            };
            featureValueType: {
                global: string;
            };
            featureSelection: {
                ci: null;
                ngsg: null;
                gsg: null;
                t: null;
                a: null;
                ifta: null;
                ptc: null;
            };
            spatialTargetC: {
                ci: number;
                ngsg: number;
                gsg: number;
                t: number;
                a: number;
                ifta: number;
                ptc: number;
                imageR: number;
                imageG: number;
                imageB: number;
            };
            spatialChannelColor: {
                ci: number[];
                ngsg: number[];
                gsg: number[];
                t: number[];
                a: number[];
                ifta: number[];
                ptc: number[];
                imageR: number[];
                imageG: number[];
                imageB: number[];
            };
            spatialChannelVisible: {
                ci: boolean;
                ngsg: boolean;
                gsg: boolean;
                t: boolean;
                a: boolean;
                ifta: boolean;
                ptc: boolean;
                imageR: boolean;
                imageG: boolean;
                imageB: boolean;
            };
            spatialLayerVisible: {
                image: boolean;
                bitmask: boolean;
            };
            spatialChannelOpacity: {
                ci: number;
                ngsg: number;
                gsg: number;
                t: number;
                a: number;
                ifta: number;
                ptc: number;
                imageR: number;
                imageG: number;
                imageB: number;
            };
            spatialLayerOpacity: {
                image: number;
                bitmask: number;
            };
            spatialSegmentationFilled: {
                ci: boolean;
                ngsg: boolean;
                gsg: boolean;
                t: boolean;
                a: boolean;
                ifta: boolean;
                ptc: boolean;
            };
            spatialSegmentationStrokeWidth: {
                ci: number;
                ngsg: number;
                gsg: number;
                t: number;
                a: number;
                ifta: number;
                ptc: number;
            };
            obsHighlight: {
                ci: null;
                ngsg: null;
                gsg: null;
                t: null;
                a: null;
                ifta: null;
                ptc: null;
            };
            spatialTargetX: {
                A: number;
            };
            spatialTargetY: {
                A: number;
            };
            spatialZoom: {
                A: number;
            };
            photometricInterpretation: {
                rgb: string;
                multiChannel: string;
            };
            spatialChannelWindow: {
                imageR: number[];
                imageG: number[];
                imageB: number[];
            };
            metaCoordinationScopes: {
                metaA: {
                    obsType: string[];
                    segmentationLayer: string[];
                    imageLayer: string[];
                };
            };
            metaCoordinationScopesBy: {
                metaA: {
                    imageLayer: {
                        fileUid: {
                            histology: string;
                        };
                        imageChannel: {
                            histology: string[];
                        };
                        spatialLayerVisible: {
                            histology: string;
                        };
                        spatialLayerOpacity: {
                            histology: string;
                        };
                        photometricInterpretation: {
                            histology: string;
                        };
                    };
                    imageChannel: {
                        spatialTargetC: {
                            R: string;
                            G: string;
                            B: string;
                        };
                        spatialChannelColor: {
                            R: string;
                            G: string;
                            B: string;
                        };
                        spatialChannelVisible: {
                            R: string;
                            G: string;
                            B: string;
                        };
                        spatialChannelOpacity: {
                            R: string;
                            G: string;
                            B: string;
                        };
                        spatialChannelWindow: {
                            R: string;
                            G: string;
                            B: string;
                        };
                    };
                    segmentationLayer: {
                        fileUid: {
                            ml: string;
                        };
                        segmentationChannel: {
                            ml: string[];
                        };
                        spatialLayerVisible: {
                            ml: string;
                        };
                        spatialLayerOpacity: {
                            ml: string;
                        };
                    };
                    segmentationChannel: {
                        obsType: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        featureType: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        featureValueType: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        featureSelection: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialTargetC: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        obsColorEncoding: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        featureValueColormap: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        featureValueColormapRange: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialChannelVisible: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialChannelOpacity: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialChannelColor: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialSegmentationFilled: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        spatialSegmentationStrokeWidth: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                        obsHighlight: {
                            ci: string;
                            ngsg: string;
                            gsg: string;
                            t: string;
                            a: string;
                            ifta: string;
                            ptc: string;
                        };
                    };
                };
            };
        };
        layout: ({
            component: string;
            coordinationScopes: {
                metaCoordinationScopes: string[];
                metaCoordinationScopesBy: string[];
                spatialTargetX: string;
                spatialTargetY: string;
                spatialZoom: string;
                obsType?: undefined;
                featureType?: undefined;
                featureValueType?: undefined;
                featureSelection?: undefined;
                obsColorEncoding?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
            props?: undefined;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureSelection: string;
                obsColorEncoding: string;
                metaCoordinationScopes?: undefined;
                metaCoordinationScopesBy?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                spatialZoom?: undefined;
            };
            props: {
                title: string;
                aggregateFeatureValues?: undefined;
                omitFeatures?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureSelection: string;
                metaCoordinationScopes?: undefined;
                metaCoordinationScopesBy?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                spatialZoom?: undefined;
                obsColorEncoding?: undefined;
            };
            props: {
                aggregateFeatureValues: boolean;
                title?: undefined;
                omitFeatures?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            component: string;
            coordinationScopes: {
                obsType: string;
                featureType: string;
                featureValueType: string;
                featureSelection: string;
                obsColorEncoding: string;
                metaCoordinationScopes?: undefined;
                metaCoordinationScopesBy?: undefined;
                spatialTargetX?: undefined;
                spatialTargetY?: undefined;
                spatialZoom?: undefined;
            };
            props: {
                omitFeatures: string[];
                title: string;
                aggregateFeatureValues?: undefined;
            };
            x: number;
            y: number;
            w: number;
            h: number;
        })[];
    };
    'kpmp-2023-2': any;
    'exemplar-small': any;
    'exemplar-small-partial-init': any;
    'ims-algorithm-comparison': any;
    'neumann-2020-2': any;
    'lightsheet-2023': any;
    'visium-2023-polygons': any;
    'kpmp-auto-init': {
        version: string;
        name: string;
        description: string;
        datasets: {
            uid: string;
            name: string;
            files: ({
                fileType: string;
                url: string;
                options: {
                    offsetsUrl: string;
                    obsTypesFromChannelNames: boolean;
                    path?: undefined;
                };
                coordinationValues?: undefined;
            } | {
                fileType: string;
                url: string;
                options: {
                    offsetsUrl: string;
                    obsTypesFromChannelNames?: undefined;
                    path?: undefined;
                };
                coordinationValues?: undefined;
            } | {
                fileType: string;
                url: string;
                options: {
                    path: string;
                    offsetsUrl?: undefined;
                    obsTypesFromChannelNames?: undefined;
                };
                coordinationValues: {
                    obsType: string;
                    featureType: string;
                    featureValueType: string;
                };
            })[];
        }[];
        coordinationSpace: {
            photometricInterpretation: {
                'init_S-1905-017737_image_0': string;
            };
            obsType: {
                'init_S-1905-017737_obsSegmentations_0': string;
                'init_S-1905-017737_obsSegmentations_1': string;
                'init_S-1905-017737_obsSegmentations_2': string;
                'init_S-1905-017737_obsSegmentations_3': string;
                'init_S-1905-017737_obsSegmentations_4': string;
                'init_S-1905-017737_obsSegmentations_5': string;
            };
        };
        initStrategy: string;
        layout: {
            component: string;
            x: number;
            y: number;
            w: number;
            h: number;
        }[];
    };
    'jain-2024': any;
    'tian-2024': any;
    'sorger-2024': any;
    'sorger-2024-2': any;
    'sorger-2024-3': any;
    'sorger-2024-4': any;
    'sorger-2024-5': any;
    'kiemen-2024': any;
    'hakimian-2021': any;
};
export const publicConfigs: string[];
export const configStores: {
    'exemplar-small': {
        'exemplar-001.crop.cells.adata.zarr': any;
        'exemplar-001.crop.image.ome.zarr': any;
        'exemplar-001.crop.segmentations.ome.zarr': any;
    };
    'exemplar-small-partial-init': {
        'exemplar-001.crop.cells.adata.zarr': any;
        'exemplar-001.crop.image.ome.zarr': any;
        'exemplar-001.crop.segmentations.ome.zarr': any;
    };
};
//# sourceMappingURL=index.d.ts.map