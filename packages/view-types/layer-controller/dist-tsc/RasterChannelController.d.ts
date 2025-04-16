export default RasterChannelController;
/**
 * Controller for the handling the colormapping sliders.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {array} slider Current slider range.
 * @prop {array} color Current color for this channel.
 * @prop {array} domain Current max/min for this channel.
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {boolean} colormapOn Whether or not the colormap (viridis, magma etc.) is on.
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
 * @prop {function} handleIQRUpdate When the IQR button is clicked, this is called.
 * @prop {number} selectionIndex The current numeric index of the selection.
 */
declare function RasterChannelController({ visibility, slider, color, channels, channelId, domainType: newDomainType, dimName, theme, loader, colormapOn, channelOptions, handlePropertyChange, handleChannelRemove, handleIQRUpdate, selectionIndex, isLoading, use3d: newUse3d, }: {
    visibility?: boolean | undefined;
    slider: any;
    color: any;
    channels: any;
    channelId: any;
    domainType: any;
    dimName: any;
    theme: any;
    loader: any;
    colormapOn: any;
    channelOptions: any;
    handlePropertyChange: any;
    handleChannelRemove: any;
    handleIQRUpdate: any;
    selectionIndex: any;
    isLoading: any;
    use3d: any;
}): JSX.Element;
//# sourceMappingURL=RasterChannelController.d.ts.map