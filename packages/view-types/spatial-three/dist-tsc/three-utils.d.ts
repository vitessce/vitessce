/**
 * Retrieving the volumetric settings from the props, comparing them to the prior settings
 * @param props
 * @param volumeSettings
 * @param setVolumeSettings
 * @param dataReady
 * @param setDataReady
 * @returns {{images: {}, data: (null|*), imageChannelCoordination,
* channelTargetC: (null|(*|boolean)[]|*),
* ySlice: *, contrastLimits: (null|number[][]|*),
* is3dMode: boolean, zSlice: *, resolution: (null|*), colors: (null|number[][]|*),
* allChannels: (null|*), layerTransparency: *, renderingMode: *, xSlice: *, layerScope: *,
* imageChannelScopesByLayer, imageLayerCoordination, imageLayerScopes, channelsVisible: (null|(*|boolean)[]|*)}}
*/
export function useVolumeSettings(props: any, volumeSettings: any, setVolumeSettings: any, dataReady: any, setDataReady: any): {
    images: {};
    data: (null | any);
    imageChannelCoordination: any;
    channelTargetC: (null | (any | boolean)[] | any);
    ySlice: any;
    contrastLimits: (null | number[][] | any);
    is3dMode: boolean;
    zSlice: any;
    resolution: (null | any);
    colors: (null | number[][] | any);
    allChannels: (null | any);
    layerTransparency: any;
    renderingMode: any;
    xSlice: any;
    layerScope: any;
    imageChannelScopesByLayer: any;
    imageLayerCoordination: any;
    imageLayerScopes: any;
    channelsVisible: (null | (any | boolean)[] | any);
};
/**
* Creates the initial volume rendering settings based on the given data
* @param volumes          ... from Store
* @param channelTargetC   ... given by UI
* @param channelsVisible  ... given by UI
* @param colors           ... given by UI
* @param textures         ... from Store
* @param contrastLimits   ... given by UI
* @param volumeMinMax     ... from Store
* @param scale            ... from Store
*/
export function create3DRendering(volumes: any, channelTargetC: any, channelsVisible: any, colors: any, textures: any, contrastLimits: any, volumeMinMax: any, scale: any, renderstyle: any, layerTransparency: any, xSlice: any, ySlice: any, zSlice: any, originalScale: any): (any[] | {
    u_size: {
        value: import("three").Vector3;
    };
    u_renderstyle: {
        value: number;
    };
    u_renderthreshold: {
        value: number;
    };
    u_opacity: {
        value: number;
    };
    u_clim: {
        value: Vector2;
    };
    u_clim2: {
        value: Vector2;
    };
    u_clim3: {
        value: Vector2;
    };
    u_clim4: {
        value: Vector2;
    };
    u_clim5: {
        value: Vector2;
    };
    u_clim6: {
        value: Vector2;
    };
    u_xClip: {
        value: Vector2;
    };
    u_yClip: {
        value: Vector2;
    };
    u_zClip: {
        value: Vector2;
    };
    u_data: {
        value: null;
    };
    u_stop_geom: {
        value: null;
    };
    u_geo_color: {
        value: null;
    };
    u_window_size: {
        value: Vector2;
    };
    u_vol_scale: {
        value: Vector2;
    };
    u_physical_Pixel: {
        value: number;
    };
    volumeTex: {
        value: null;
    };
    volumeTex2: {
        value: null;
    };
    volumeTex3: {
        value: null;
    };
    volumeTex4: {
        value: null;
    };
    volumeTex5: {
        value: null;
    };
    volumeTex6: {
        value: null;
    };
    u_color: {
        value: import("three").Vector3;
    };
    u_color2: {
        value: import("three").Vector3;
    };
    u_color3: {
        value: import("three").Vector3;
    };
    u_color4: {
        value: import("three").Vector3;
    };
    u_color5: {
        value: import("three").Vector3;
    };
    u_color6: {
        value: import("three").Vector3;
    };
    u_cmdata: {
        value: null;
    };
    near: {
        value: number;
    };
    far: {
        value: number;
    };
    alphaScale: {
        value: number;
    };
    dtScale: {
        value: number;
    };
    volumeCount: {
        value: number;
    };
    finalGamma: {
        value: number;
    };
    boxSize: {
        value: import("three").Vector3;
    };
} | {
    uniforms: {
        u_size: {
            value: import("three").Vector3;
        };
        u_renderstyle: {
            value: number;
        };
        u_renderthreshold: {
            value: number;
        };
        u_opacity: {
            value: number;
        };
        u_clim: {
            value: Vector2;
        };
        u_clim2: {
            value: Vector2;
        };
        u_clim3: {
            value: Vector2;
        };
        u_clim4: {
            value: Vector2;
        };
        u_clim5: {
            value: Vector2;
        };
        u_clim6: {
            value: Vector2;
        };
        u_xClip: {
            value: Vector2;
        };
        u_yClip: {
            value: Vector2;
        };
        u_zClip: {
            value: Vector2;
        };
        u_data: {
            value: null;
        };
        u_stop_geom: {
            value: null;
        };
        u_geo_color: {
            value: null;
        };
        u_window_size: {
            value: Vector2;
        };
        u_vol_scale: {
            value: Vector2;
        };
        u_physical_Pixel: {
            value: number;
        };
        volumeTex: {
            value: null;
        };
        volumeTex2: {
            value: null;
        };
        volumeTex3: {
            value: null;
        };
        volumeTex4: {
            value: null;
        };
        volumeTex5: {
            value: null;
        };
        volumeTex6: {
            value: null;
        };
        u_color: {
            value: import("three").Vector3;
        };
        u_color2: {
            value: import("three").Vector3;
        };
        u_color3: {
            value: import("three").Vector3;
        };
        u_color4: {
            value: import("three").Vector3;
        };
        u_color5: {
            value: import("three").Vector3;
        };
        u_color6: {
            value: import("three").Vector3;
        };
        u_cmdata: {
            value: null;
        };
        near: {
            value: number;
        };
        far: {
            value: number;
        };
        alphaScale: {
            value: number;
        };
        dtScale: {
            value: number;
        };
        volumeCount: {
            value: number;
        };
        finalGamma: {
            value: number;
        };
        boxSize: {
            value: import("three").Vector3;
        };
    };
    vertexShader: string;
    fragmentShader: string;
})[] | null;
/**
* Function to load the volumetric data from the given data source
* @param channelTargetC
* @param resolution
* @param data
* @param volumes
* @param textures
* @param volumeMinMax
* @param oldResolution
* @returns {Promise<(*|*[])[]>}
*/
export function initialDataLoading(channelTargetC: any, resolution: any, data: any, volumes: any, textures: any, volumeMinMax: any, oldResolution: any): Promise<(any | any[])[]>;
import { Vector2 } from 'three';
//# sourceMappingURL=three-utils.d.ts.map