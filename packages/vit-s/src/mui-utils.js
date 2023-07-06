// This function has been copied from MUI v4
// with logic related to randomness / random numbers removed.
// Reference: https://github.com/mui/material-ui/blob/0adada09/packages/mui-styles/src/createGenerateClassName/createGenerateClassName.js#L29
/**
 * This is the list of the style rule name we use as drop in replacement for the built-in
 * pseudo classes (:checked, :disabled, :focused, etc.).
 *
 * Why do they exist in the first place?
 * These classes are used at a specificity of 2.
 * It allows them to override previously defined styles as well as
 * being untouched by simple user overrides.
 */
const stateClasses = [
  'checked',
  'disabled',
  'error',
  'focused',
  'focusVisible',
  'required',
  'expanded',
  'selected',
];

const defaultPrefix = 'vit-';

export function createGenerateClassName(customPrefix) {
  return (rule, styleSheet) => {
    const {
      name: styleSheetName,
      link: styleSheetLink,
      classNamePrefix,
    } = styleSheet.options;
    const { key: ruleKey } = rule;

    const seedPrefix = customPrefix ? `${customPrefix}-` : defaultPrefix;

    // Is a global static MUI style?
    if (styleSheetName && styleSheetName.indexOf('Mui') === 0 && !styleSheetLink) {
      // We can use a shorthand class name, we never use the keys to style the components.
      if (stateClasses.indexOf(ruleKey) !== -1) {
        return `Mui-${ruleKey}`;
      }
      const prefix = `${seedPrefix}${styleSheetName}-${ruleKey}`;
      return prefix;
    }
    // Help with debuggability.
    if (classNamePrefix) {
      return `${seedPrefix}${classNamePrefix}-${ruleKey}`;
    }
    return `${seedPrefix}${ruleKey}`;
  };
}
