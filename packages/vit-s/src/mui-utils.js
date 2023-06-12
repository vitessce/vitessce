// This function has been copied from MUI v4
// with logic related to randomness / random numbers removed.
// Reference: https://github.com/mui/material-ui/blob/0adada09/packages/mui-styles/src/createGenerateClassName/createGenerateClassName.js#L29
export function createGenerateClassName() {
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

  const seedPrefix = 'vit-';
  const disableGlobal = false;

  return (rule, styleSheet) => {
    const {
      name: styleSheetName,
      link: styleSheetLink,
      classNamePrefix,
    } = styleSheet.options;

    // Is a global static MUI style?
    if (styleSheetName && styleSheetName.indexOf('Mui') === 0 && !styleSheetLink && !disableGlobal) {
      // We can use a shorthand class name, we never use the keys to style the components.
      if (stateClasses.indexOf(rule.key) !== -1) {
        return `Mui-${rule.key}`;
      }
      const prefix = `${seedPrefix}${styleSheetName}-${rule.key}`;
      return prefix;
    }
    const suffix = rule.key;
    // Help with debuggability.
    if (classNamePrefix) {
      return `${seedPrefix}${classNamePrefix}-${suffix}`;
    }
    return `${seedPrefix}${suffix}`;
  };
}
