import React from 'react';
import {
    TitleInfo,
    useReady,
    useCoordination,
    useLoaders,
    useImageData, useDeckCanvasSize,
} from '@vitessce/vit-s';
import {ViewType, COMPONENT_COORDINATION_TYPES} from '@vitessce/constants-internal';
import {ColorPalette3DExtensions} from '@hms-dbmi/viv';
import ThreeJsViewer from './Three';

/**
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function ThreeSubscriber(props) {
    const {
        coordinationScopes,
        removeGridComponent,
        theme,
        title = 'Three View',
    } = props;
    const loaders = useLoaders();

    // contrastLimits,
    //     colors,
    //     channelsVisible,
    //     selections,
    //     colormap,
    //     resolution = Math.max(0, loaders.length - 1),
    //     modelMatrix,
    //     onViewStateChange,
    //     xSlice = null,
    //     ySlice = null,
    //     zSlice = null,
    //     onViewportLoad,
    //     height: screenHeight,
    //     width: screenWidth,
    //     viewStates: viewStatesProp,
    //     clippingPlanes = [],
    //     useFixedAxis = true,
    //     extensions = [new ColorPalette3DExtensions.AdditiveBlendExtension()]

    // Get "props" from the coordination space.
    const [{
        dataset,
        spatialImageLayer: imageLayers,
        setSpatialImageLayer: setRasterLayers,
    }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_THREE], coordinationScopes);

    const use3d = imageLayers?.some(l => l.use3d);
    const [width, height, deckRef] = useDeckCanvasSize();

    // Get data from loaders using the data hooks.
    const [{image}, imageStatus] = useImageData(
        loaders, dataset, false, {}, {},
        {}, // TODO: which properties to match on. Revisit after #830.
    );
    const {loaders: imageLayerLoaders = [], meta: imageLayerMeta = []} = image || {};

    const isReady = () => true;

    const loadersNew = imageLayerLoaders[0] !== undefined ? imageLayerLoaders[0].data : []
    const contrastLimits = imageLayers !== null ? imageLayers[0].channels.map((channel) => channel.slider) : [];
    const colors = imageLayers !== null ? imageLayers[0].channels.map((channel) => channel.color) : [];
    const channelsVisible = imageLayers !== null ? imageLayers[0].channels.map((channel) => channel.visible) : [];
    const resolution = imageLayers !== null ? imageLayers[0].resolution : 0;
    let onViewportLoad = () => {
    };

    const layerConfig = {
        loader: loadersNew,
        contrastLimits,
        colors,
        channelsVisible,
        resolution,
        onViewportLoad
    };

    //loader, channelsVisible, resolution, colors, contrastLimits, selections, onViewportLoad
    const layerProps = [layerConfig];

    return (
        <TitleInfo
            title={title}
            removeGridComponent={removeGridComponent}
            isScroll
            theme={theme}
            isReady={isReady}
        >
            {use3d ?
                <ThreeJsViewer
                    layerProps={layerProps}
                /> : <div>Only rendering of 3D content possible</div>}
        </TitleInfo>
    );
}
