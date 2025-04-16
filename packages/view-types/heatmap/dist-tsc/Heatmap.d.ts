export default Heatmap;
/**
 * A heatmap component for cell x gene matrices.
 * @param {object} props
 * @param {string} props.uuid The uuid of this component,
 * used by tooltips to determine whether to render a tooltip or
 * a crosshair.
 * @param {string} props.theme The current theme name.
 * @param {object} props.viewState The viewState for
 * DeckGL.
 * @param {function} props.setViewState The viewState setter
 * for DeckGL.
 * @param {number} props.width The width of the canvas.
 * @param {number} props.height The height of the canvas.
 * @param {null|Uint8Array} props.uint8ObsFeatureMatrix A flat Uint8Array
 * containing the expression data.
 * @param {Map} props.cellColors Map of cell ID to color. Optional.
 * If defined, the key ordering is used to order the cell axis of the heatmap.
 * @param {array} props.cellColorLabels array of labels to place beside cell color
 * tracks. Only works for transpose=true.
 * @param {function} props.setCellHighlight Callback function called on
 * hover with the cell ID. Optional.
 * @param {function} props.setGeneHighlight Callback function called on
 * hover with the gene ID. Optional.
 * @param {function} props.updateViewInfo Callback function that gets called with an
 * object { uuid, project(), projectFromId() } where
 * project is the DeckGL Viewport.project function, and
 * projectFromId is a wrapper around project that
 * takes (cellId, geneId) as parameters and returns
 * canvas (x,y) pixel coordinates. Used to show tooltips. Optional.
 * @param {boolean} props.transpose By default, false.
 * @param {string} props.variablesTitle By default, 'Genes'.
 * @param {string} props.observationsTitle By default, 'Cells'.
 * @param {number} props.useDevicePixels By default, 1. Higher values
 * e.g. 2 increase text sharpness.
 * @param {boolean} props.hideObservationLabels By default false.
 * @param {boolean} props.hideVariableLabels By default false.
 * @param {string} props.colormap The name of the colormap function to use.
 * @param {array} props.colormapRange A tuple [lower, upper] to adjust the color scale.
 * @param {function} props.setColormapRange The setter function for colormapRange.
 * @param {string[]} props.obsIndex The cell ID list.
 * @param {string[]} props.featureIndex The gene ID list.
 * @param {null|Map<string,string>} props.featureLabelsMap A map of featureIndex to featureLabel.
 */
declare const Heatmap: any;
//# sourceMappingURL=Heatmap.d.ts.map