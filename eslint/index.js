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