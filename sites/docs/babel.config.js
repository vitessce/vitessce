module.exports = {
  presets: [
    require.resolve('@docusaurus/core/lib/babel/preset')
  ],
  // Reference: https://github.com/facebook/docusaurus/issues/7606#issuecomment-1153413060
  assumptions: {
    superIsCallableConstructor: false,
  }
};