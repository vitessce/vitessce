export default LayerOptions;
/**
 * Gloabl options for all channels (opacity, colormap, etc.).
 * @prop {string} colormap What colormap is currently selected (None, viridis etc.).
 * @prop {number} opacity Current opacity value.
 * @prop {function} handleColormapChange Callback for when colormap changes.
 * @prop {function} handleOpacityChange Callback for when opacity changes.
 * @prop {object} globalControlLabels All available options for global control (z and t).
 * @prop {function} handleGlobalChannelsSelectionChange Callback for global selection changes.
 * @prop {function} handleDomainChange Callback for domain type changes (full or min/max).
 * @prop {array} channels Current channel object for inferring the current global selection.
 * @prop {array} dimensions Currently available dimensions (channel, z, t etc.).
 * @prop {string} domainType One of Max/Min or Full (soon presets as well).
 * @prop {boolean} disableChannelsIfRgbDetected Whether or not we need colormap controllers if RGB.
 */
declare function LayerOptions({ colormap, opacity, handleColormapChange, handleOpacityChange, handleTransparentColorChange, globalControlLabels, globalLabelValues, handleGlobalChannelsSelectionChange, handleSliderChange, handleDomainChange, transparentColor, channels, domainType, disableChannelsIfRgbDetected, shouldShowTransparentColor, shouldShowDomain, shouldShowColormap, use3d, loader, handleMultiPropertyChange, resolution, disable3d, setRasterLayerCallback, setAreAllChannelsLoading, setViewState, spatialHeight, spatialWidth, modelMatrix, }: {
    colormap: any;
    opacity: any;
    handleColormapChange: any;
    handleOpacityChange: any;
    handleTransparentColorChange: any;
    globalControlLabels: any;
    globalLabelValues: any;
    handleGlobalChannelsSelectionChange: any;
    handleSliderChange: any;
    handleDomainChange: any;
    transparentColor: any;
    channels: any;
    domainType: any;
    disableChannelsIfRgbDetected: any;
    shouldShowTransparentColor: any;
    shouldShowDomain: any;
    shouldShowColormap: any;
    use3d: any;
    loader: any;
    handleMultiPropertyChange: any;
    resolution: any;
    disable3d: any;
    setRasterLayerCallback: any;
    setAreAllChannelsLoading: any;
    setViewState: any;
    spatialHeight: any;
    spatialWidth: any;
    modelMatrix: any;
}): JSX.Element;
//# sourceMappingURL=LayerOptions.d.ts.map