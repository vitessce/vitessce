/**
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {boolean} props.transpose Whether to
 * render as cell-by-gene or gene-by-cell.
 */
export function HeatmapSubscriber(props: {
    uuid: number;
    coordinationScopes: object;
    removeGridComponent: Function;
    title: string;
    transpose: boolean;
}): JSX.Element;
//# sourceMappingURL=HeatmapSubscriber.d.ts.map