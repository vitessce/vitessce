import { cleanFeatureId } from '@vitessce/utils';

/**
 * Use the featureLabelsMap to transform the values in the info object.
 * For example, there are cases where the info object looks like
 * { "Marker Gene ID": "ENSG00000123456.1" }
 * And we want to transform the values into Gene Symbols instead of Ensembl IDs.
 * @param {object} info
 * @param {string} featureType
 * @param {Map<string,string>} featureLabelsMap
 * @returns
 */
export function transformInfoValues(info, featureType, featureLabelsMap) {
  if (info) {
    const newInfo = Object.fromEntries(
      Object.entries(info).map(([key, value]) => {
        if (key.toLowerCase().includes(featureType.toLowerCase())) {
          const newValue = (
            featureLabelsMap?.get(value)
                        || featureLabelsMap?.get(cleanFeatureId(value))
                        || value
          );
          return [key, newValue];
        }
        return [key, value];
      }),
    );
    return newInfo;
  }
  return info;
}
