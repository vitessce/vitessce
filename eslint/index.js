// Thanks to https://medium.com/neighborhoods-com-engineering-blog/custom-eslint-rules-for-faster-refactoring-2095e69bde08
// for the tutorial.
module.exports.rules = {
  'prevent-pubsub-import': function (context) {
    return {
      ImportDeclaration(node) {
        node.specifiers &&
          node.specifiers.map((item) => {
            if (item.local.name === "PubSub") {
              return context.report(
                node,
                item.loc,
                `Do not use ${item.local.name} outside of subscriber components`
              );
            }
            return null;
          });
      },
    };
  }
};