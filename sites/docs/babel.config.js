module.exports = {
  presets: [
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
  // Spec-compliant spread (below) needs @babel/runtime helpers. Without this,
  // Babel injects them as ESM `import`s into CommonJS files (e.g. @docusaurus/utils-common),
  // which then throw "exports is not defined". 'unambiguous' injects `require` there instead.
  sourceType: 'unambiguous',
  // Reference: https://github.com/facebook/docusaurus/issues/7606#issuecomment-1153413060
  assumptions: {
    superIsCallableConstructor: false,
    // The Docusaurus preset compiles `[...x]` loosely to `[].concat(x)`,
    // which turns `[...someSet]` into `[someSet]`. Keep spec-compliant spread.
    iterableIsArray: false,
  },
};
