/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function ObsSetsManagerSubscriber(props: {
    theme: string;
    coordinationScopes: object;
    removeGridComponent: Function;
    title: string;
}): JSX.Element;
//# sourceMappingURL=ObsSetsManagerSubscriber.d.ts.map