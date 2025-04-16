/**
 * A subscriber component for a text description component.
 * Also renders a table containing image metadata.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function DescriptionSubscriber(props: {
    theme: string;
    coordinationScopes: object;
    removeGridComponent: Function;
    title: string;
}): JSX.Element;
//# sourceMappingURL=DescriptionSubscriber.d.ts.map