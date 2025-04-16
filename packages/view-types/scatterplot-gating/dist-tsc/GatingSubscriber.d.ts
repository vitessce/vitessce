/**
   * A subscriber component for the gating scatterplot.
   * @param {object} props
   * @param {number} props.uuid The unique identifier for this component.
   * @param {string} props.theme The current theme name.
   * @param {object} props.coordinationScopes The mapping from coordination types to coordination
   * scopes.
   * @param {boolean} props.disableTooltip Should the tooltip be disabled?
   * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
   * to call when the component has been removed from the grid.
   * @param {number} props.averageFillDensity Override the average fill density calculation
   * when using dynamic opacity mode.
   */
export function GatingSubscriber(props: {
    uuid: number;
    theme: string;
    coordinationScopes: object;
    disableTooltip: boolean;
    removeGridComponent: Function;
    averageFillDensity: number;
}): JSX.Element;
//# sourceMappingURL=GatingSubscriber.d.ts.map