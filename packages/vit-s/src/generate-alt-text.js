import { ViewType } from '@vitessce/constants-internal';

/**
   * Method for converting an array with strings to a natural sentence,
   * concatenating the items with commans, and the last item with 'and'.
   * @param {Array} arr Array with text items.
   * @returns {string} Natural language sentence in the form of 'a, b and c', where a/b/c are items.
   */
export function arrayToString(arr) {
  const arrF = arr.filter(item => item !== undefined);
  if (arrF.length === 0) {
    return '';
  }
  if (arrF.length === 1) {
    return arrF[0];
  }
  return `${arr.slice(0, -1).join(', ')} and ${arr.slice(-1)}`;
}

/**
   * Mapping of ViewType to natural language description of ViewType.
   */
export const ViewTypesToText = new Map([
  [ViewType.DESCRIPTION, 'description'],
  [ViewType.STATUS, 'status view for debugging'],
  [ViewType.SCATTERPLOT, 'scatterplot with embeddings'],
  [ViewType.SPATIAL, 'spatial view'],
  [ViewType.SPATIAL_BETA, 'spatial view'],
  [ViewType.HEATMAP, 'cell by gene heatmap'],
  [ViewType.LAYER_CONTROLLER, 'layer controller'],
  [ViewType.LAYER_CONTROLLER_BETA, 'layer controller'],
  [ViewType.GENOMIC_PROFILES, 'genome browser tracks with bar plots'],
  [ViewType.GATING, 'scatterplot of gated gene expression data'],
  [ViewType.FEATURE_LIST, 'interactive list of features'],
  [ViewType.OBS_SETS, 'list of potential observation sets'],
  [ViewType.OBS_SET_SIZES, 'sizes of selected observation sets'],
  [ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION, 'violin plot with values'],
  [ViewType.FEATURE_VALUE_HISTOGRAM, 'distribution of values'],
]);

/**
   * Method for converting an array with strings to a natural sentence,
   * concatenating the items with commans, and the last item with 'and'.
   * @param {Object} config Vitessce config.
   * @returns {string} Natural language sentence describing config (alt-text).
   */
export function getAltText(config) {
  const componentList = config.layout.map(c => c.component);
  const altText = `Vitessce grid with ${componentList.length} views, including ${arrayToString(componentList.map(c => ViewTypesToText.get(c) || 'plugin view'))}.`;
  return altText;
}
