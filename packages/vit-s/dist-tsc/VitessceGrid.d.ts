/**
 * The wrapper for the VitessceGrid and LoadingIndicator components.
 * @param {object} props
 * @param {number} props.rowHeight The height of each grid row. Optional.
 * @param {object} props.config The view config.
 * @param {string} props.theme The theme name.
 * @param {number} props.height Total height for grid. Optional.
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {PluginViewType[]} props.viewTypes
 * @param {PluginFileType[]} props.fileTypes
 * @param {PluginCoordinationType[]} props.coordinationTypes
 */
export default function VitessceGrid(props: {
    rowHeight: number;
    config: object;
    theme: string;
    height: number;
    onWarn: Function;
    viewTypes: PluginViewType[];
    fileTypes: PluginFileType[];
    coordinationTypes: PluginCoordinationType[];
}): JSX.Element;
//# sourceMappingURL=VitessceGrid.d.ts.map