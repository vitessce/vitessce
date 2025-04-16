/**
 * The Vitessce component.
 * @param {object} props
 * @param {object} props.config A Vitessce view config.
 * If the config is valid, the VitessceGrid will be rendered as a child.
 * If the config is invalid, a Warning will be rendered instead.
 * @param {undefined|number} props.rowHeight Row height for grid layout. Optional.
 * @param {number} props.height Total height for grid layout. Optional.
 * @param {string} props.theme The theme, used for styling as
 * light or dark. Optional. By default, "dark"
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {function} props.onConfigChange A callback for view config
 * updates. Optional.
 * @param {function} props.onLoaderChange A callback for loader
 * updates. Optional.
 * @param {boolean} props.validateConfig Whether to validate or not. Only to be
 * set to false in controlled component situations, where bypassing validation
 * is required for performance, and the parent knows the config
 * is already valid (e.g., it originated from onConfigChange). By default, true.
 * @param {boolean} props.validateOnConfigChange Whether to validate
 * against the view config schema when publishing changes. Use for debugging
 * purposes, as this may have a performance impact. By default, false.
 * @param {null|string} props.uid A unique identifier for this Vitessce instance,
 * for the purpose of avoiding CSS autogenerated class name conflicts. Must be valid as part
 * of a CSS class name string.
 * @param {boolean} props.remountOnUidChange Whether to remount the coordination provider
 * upon changes to config.uid. By default, true.
 * @param {array} props.viewTypes Plugin view types.
 * @param {array} props.fileTypes Plugin file types.
 * @param {array} props.jointFileTypes Plugin joint file types.
 * @param {array} props.coordinationTypes Plugin coordination types.
 * @param {null|object} props.warning A warning to render within the Vitessce grid,
 * provided by the parent.
 */
export function VitS(props: {
    config: object;
    rowHeight: undefined | number;
    height: number;
    theme: string;
    onWarn: Function;
    onConfigChange: Function;
    onLoaderChange: Function;
    validateConfig: boolean;
    validateOnConfigChange: boolean;
    uid: null | string;
    remountOnUidChange: boolean;
    viewTypes: array;
    fileTypes: array;
    jointFileTypes: array;
    coordinationTypes: array;
    warning: null | object;
}): JSX.Element;
//# sourceMappingURL=VitS.d.ts.map