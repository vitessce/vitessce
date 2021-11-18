module.exports = {
  presets: [
    require.resolve('@docusaurus/core/lib/babel/preset')
  ],
  assumptions: {
    constantSuper: true,
    noClassCalls: true,
    setClassMethods: true,
    superIsCallableConstructor: false
  }
};
