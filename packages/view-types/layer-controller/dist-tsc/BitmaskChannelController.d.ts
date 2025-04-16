export default BitmaskChannelController;
/**
 * Controller for the handling the bitmask channels.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
 * @prop {number} selectionIndex The current numeric index of the selection.
 * @prop {boolean} disableOptions Whether or not channel options are be disabled (default: false).
 */
declare function BitmaskChannelController({ visibility, dimName, channelOptions, handlePropertyChange, handleChannelRemove, selectionIndex, disableOptions, }: {
    visibility?: boolean | undefined;
    dimName: any;
    channelOptions: any;
    handlePropertyChange: any;
    handleChannelRemove: any;
    selectionIndex: any;
    disableOptions?: boolean | undefined;
}): JSX.Element;
//# sourceMappingURL=BitmaskChannelController.d.ts.map