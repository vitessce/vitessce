export declare const VALUE_TRANSFORM_OPTIONS: ({
    name: string;
    value: null;
} | {
    name: string;
    value: string;
})[];
/**
 * Get a feature value transform function such as
 * log1p or arcsinh.
 * @param {string} featureValueTransform The function name.
 * @param {number} coefficient The transform coefficient.
 * @returns {function} The function which takes one number
 * as a parameter and returns the transformed number
 * (or the original number in the identity case).
 */
export declare function getValueTransformFunction(featureValueTransform: 'log1p' | 'arcsinh' | null, coefficient: number): (v: number) => number;
//# sourceMappingURL=gating.d.ts.map