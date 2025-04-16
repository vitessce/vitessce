/**
 * We use debounce, so that onSelect is called only after the user has finished the selection.
 * Due to vega-lite limitations, we cannot use the vega-lite signals to implement this.
 * See this issue: https://github.com/vega/vega-lite/issues/5728
 * See this for reference on what is supported: https://vega.github.io/vega-lite/docs/selection.html
 */
/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {string[]} props.geneSelection The list of genes
 * currently selected.
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value` and `gene`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * By default, 50.
 */
export default function ExpressionHistogram(props: {
    geneSelection: string[];
    data: object[];
    theme: string;
    width: number;
    height: number;
    marginRight: number;
    marginBottom: number;
}): JSX.Element;
//# sourceMappingURL=ExpressionHistogram.d.ts.map