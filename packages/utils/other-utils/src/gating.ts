// Originally in src/components/gating/utils.js
export const VALUE_TRANSFORM_OPTIONS = [
  { name: 'None', value: null },
  { name: 'Log', value: 'log1p' },
  { name: 'ArcSinh', value: 'arcsinh' },
];
/**
 * Get a feature value transform function such as
 * log1p or arcsinh.
 * @param {string} featureValueTransform The function name.
 * @param {number} coefficient The transform coefficient.
 * @returns {function} The function which takes one number
 * as a parameter and returns the transformed number
 * (or the original number in the identity case).
 */
export function getValueTransformFunction(featureValueTransform: 'log1p' | 'arcsinh' | null, coefficient: number) {
  // Set transform function
  let transformFunction;
  switch (featureValueTransform) {
    case 'log1p':
      transformFunction = (v: number) => Math.log(1 + v * coefficient);
      break;
    case 'arcsinh':
      transformFunction = (v: number) => Math.asinh(v * coefficient);
      break;
    default:
      transformFunction = (v: number) => v;
  }
  return transformFunction;
}
