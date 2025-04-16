/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export function EmbeddingScatterplotSubscriber(props: {
    uuid: number;
    theme: string;
    coordinationScopes: object;
    removeGridComponent: Function;
    title: string;
    averageFillDensity: number;
}): JSX.Element;
//# sourceMappingURL=EmbeddingScatterplotSubscriber.d.ts.map