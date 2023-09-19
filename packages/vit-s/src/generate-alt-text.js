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
const ViewTypeToText = {
  DESCRIPTION: 'description',
  STATUS: 'status view for debugging',
  SCATTERPLOT: 'scatterplot with embeddings',
  SPATIAL: 'spatial view',
  SPATIAL_BETA: 'spatial view',
  HEATMAP: 'cell by gene heatmap',
  LAYER_CONTROLLER: 'layer controller',
  LAYER_CONTROLLER_BETA: 'layer controller',
  GENOMIC_PROFILES: 'genome browser tracks with bar plots',
  GATING: 'scatterplot of gated gene expression data',
  FEATURE_LIST: 'interactive list of features',
  OBS_SETS: 'list of potential observation sets',
  OBS_SET_SIZES: 'sizes of selected observation sets',
  OBS_SET_FEATURE_VALUE_DISTRIBUTION: 'violin plot with values',
  FEATURE_VALUE_HISTOGRAM: 'distribution of values',
};

/**
   * Method for getting the mapping of the constants assigned to view types to natural language.
   * In constants-internal, the ViewType 'OBS_SETS' might be assigned to 'obsSets'.
   * In generate-alt-text, the ViewType 'OBS_SETS' might be described as
   * 'list of potential observation sets'.
   * This method then returns a mapping including ['obsSets', 'list of potential observation sets'].
   * @returns {Map} Mapping of constants to natural language.
   */
export function getViewTypesMap() {
  const ViewTypeMap = new Map(Object.entries(ViewType));
  const KeyTextMap = new Map(Object.entries(ViewTypeToText));

  let viewTypeToTextMap = Array.from(KeyTextMap, ([key, value]) => [ViewTypeMap.get(key), value]);
  viewTypeToTextMap = viewTypeToTextMap.filter(item => item[0] !== undefined);
  viewTypeToTextMap = new Map(viewTypeToTextMap);

  return viewTypeToTextMap;
}

/**
   * Method for converting an array with strings to a natural sentence,
   * concatenating the items with commans, and the last item with 'and'.
   * @param {Object} config Vitessce config.
   * @returns {string} Natural language sentence describing config (alt-text).
   */
export function getAltText(config) {
  const componentList = config.layout.map(c => c.component);
  const viewTypeToTextMap = getViewTypesMap();
  const altText = `Vitessce grid with ${componentList.length} views, including ${arrayToString(componentList.map(c => viewTypeToTextMap.get(c)))}.`;
  return altText;
}
