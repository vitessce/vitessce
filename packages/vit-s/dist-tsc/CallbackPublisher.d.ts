/**
 * This is a dummy component which handles
 * publishing new view configs and loaders to
 * the provided callbacks on changes.
 * @param {object} props
 * @param {function} props.onConfigChange A callback function
 * to execute on each change of the Vitessce view config.
 * @param {function} props.onLoaderChange A callback function
 * to execute on each change of the loaders object.
 * @param {boolean} props.validateOnConfigChange Whether to validate
 * against the view config schema when publishing changes.
 */
export default function CallbackPublisher(props: {
    onConfigChange: Function;
    onLoaderChange: Function;
    validateOnConfigChange: boolean;
}): null;
//# sourceMappingURL=CallbackPublisher.d.ts.map