/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value`, `gene`, and `set`.
 * @param {number} props.domainMax The maximum gene expression value.
 * @param {object[]} props.colors An object for each
 * cell set, with properties `name` and `color`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * Default is allowing the component to automatically determine the margin.
 * @param {string|null} props.featureValueTransformName A name
 * for the feature value transformation function.
 */
export default function CellSetExpressionPlot(props: {
    data: object[];
    domainMax: number;
    colors: object[];
    theme: string;
    width: number;
    height: number;
    marginRight: number;
    marginBottom: number;
    featureValueTransformName: string | null;
}): JSX.Element;
//# sourceMappingURL=CellSetExpressionPlot.d.ts.map