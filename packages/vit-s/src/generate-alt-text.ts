function arrayToString(arr: (string | undefined)[]): string {
  arr = arr.filter(item => item !== undefined);
  if (arr.length === 0) {
    return '';
  }
  if (arr.length === 1) {
      return arr[0] as string;
  } else {
      return arr.slice(0, -1).join(', ') + ' and ' + arr.slice(-1);
  } 
}

const viewTypesToText = new Map([['scatterplot', 'scatterplot with embeddings'], ['gating', 'scatterplot of gated gene expression data'], ['heatmap', 'cell by gene heatmap'], ['spatial', 'spatial view'], ['area', 'area displayed'], ['layerController', 'layer controller'], ['genomicProfiles', 'genome browser tracks with bar plots'], ['featureList', 'interactive list of features'], ['obsSets', 'list of potential observation sets'], ['obsSetSizes', 'sizes of selected observation sets'], ['description', 'description'], ['status', 'status view for debugging'], ['obsSetFeatureValueDistribution', 'violin plot with values'], ['featureValueHistogram', 'distribution of values']]);

export function getAltText(config: any) {
  let componentList = [] as string[];
  for (let c of config.layout) {
    componentList.push(c.component);
  }

  const altText = 'Vitessce view with ' + componentList.length + ' views, including ' + arrayToString(componentList.map(c => (viewTypesToText.get(c)))) + '.';
  return altText;
}