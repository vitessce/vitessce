/**
 * A subscriber component for `ExpressionHistogram`,
 * which listens for gene selection updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {object} props.coordinationScopes An object mapping coordination
 * types to coordination scopes.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export function ExpressionHistogramSubscriber(props: {
    removeGridComponent: Function;
    coordinationScopes: object;
    theme: string;
}): JSX.Element;
//# sourceMappingURL=ExpressionHistogramSubscriber.d.ts.map