export function createGenerateClassName() {
  // Reference: https://github.com/mui/material-ui/blob/0adada09dde36e98e1c8616305cbcfb62d98b8bb/packages/mui-styles/src/createGenerateClassName/createGenerateClassName.js#L29

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
  
  // https://github.com/mui/material-ui/blob/0adada09dde36e98e1c8616305cbcfb62d98b8bb/packages/mui-private-theming/src/ThemeProvider/nested.js#L1
  const hasSymbol = typeof Symbol === 'function' && Symbol.for;
  const nested = hasSymbol ? Symbol.for('mui.nested') : '__THEME_NESTED__';

  const seedPrefix = 'vit-';
  const disableGlobal = false;
  
  return (rule, styleSheet) => {
    const name = styleSheet.options.name;

    // Is a global static MUI style?
    if (name && name.indexOf('Mui') === 0 && !styleSheet.options.link && !disableGlobal) {
      // We can use a shorthand class name, we never use the keys to style the components.
      if (stateClasses.indexOf(rule.key) !== -1) {
        return `Mui-${rule.key}`;
      }

      const prefix = `${seedPrefix}${name}-${rule.key}`;

      /*
      if (!styleSheet.options.theme[nested]) {
        return prefix;
      }
      */

      //return `${prefix}-${getNextCounterId()}`;
      return prefix;
    }

    /*
    if (process.env.NODE_ENV === 'production') {
      return `${seedPrefix}${productionPrefix}${getNextCounterId()}`;
    }
    */

    //const suffix = `${rule.key}-${getNextCounterId()}`;
    const suffix = rule.key;

    // Help with debuggability.
    if (styleSheet.options.classNamePrefix) {
      return `${seedPrefix}${styleSheet.options.classNamePrefix}-${suffix}`;
    }

    return `${seedPrefix}${suffix}`;
  };
}