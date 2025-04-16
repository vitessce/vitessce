/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
export function ChannelSelectionDropdown({ handleChange, disabled, channelOptions, selectionIndex, }: {
    handleChange: any;
    disabled: any;
    channelOptions: any;
    selectionIndex: any;
}): JSX.Element;
/**
 * Checkbox for toggling on/off of a channel.
 * @prop {string} color Current color for this channel.
 * @prop {boolean} checked Whether or not this channel is "on".
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {function} toggle Callback for toggling on/off.
 */
export function ChannelVisibilityCheckbox({ color, checked, toggle, disabled, }: {
    color: any;
    checked: any;
    toggle: any;
    disabled: any;
}): JSX.Element;
//# sourceMappingURL=shared-channel-controls.d.ts.map