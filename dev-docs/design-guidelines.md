<!-- Inspired by https://github.com/visgl/deck.gl/blob/a58191a83c7d06526d9a7419db76d8442e83849c/dev-docs/deckgl-api-guidelines.md -->

# Vitessce Design Guidelines

An evolving set of guidelines to ensure that features remain maintainable, scalable, and consistent.

## Design Guidelines

### User experience decisions
- When making decisions that affect user experience, prefer [consistency](http://vis.pku.edu.cn/research/publication/consistency.pdf).

### Tests

- Prefer unit tests over end-to-end tests - Keep React components relatively "dumb" and put complex logic into utility functions that can be easily unit-tested.
- Test in [portal-ui](https://github.com/hubmapconsortium/portal-ui) with diverse data modalities prior to major releases

### Data types

- Prefer minimal data types - If you can imagine reasonably storing data in multiple files (e.g., using formats like CSV or JSON), then consider splitting into multiple simpler data types. [Joint file types](http://vitessce.io/docs/data-types-file-types/#joint-file-types) can be used in cases where data is stored in the same file.

### Data transformations
- Defer (in the code) expensive transformations that are mostly presentational (e.g., normalizing an expression matrix or mapping ENSEMBL IDs to gene symbols) until necessary, to be able to rely on the original representation in more places.

### Scripting for development

- Prefer NodeJS scripts over complex Shell scripts.

### Monorepo organization

- Avoid [circular dependencies](https://github.com/vitessce/vitessce/issues/1490) - If you find the need to import functions across view type- or file type- sub-packages, consider moving to a utility sub-package (i.e., `packages/utils/`).
- Avoid complex dependencies in utility sub-packages - Where possible keep dependencies in utility sub-packages small and simple (e.g., `lodash`). If a large/complex dependency is needed for a utility function, consider refactoring that function into a new utility sub-package.

### TypeScript

- Implement new sub-packages using TypeScript to avoid creating tech debt.
- Prefer [TypeScript-via-JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) now that JSDoc supports [`@import` syntax](https://github.com/microsoft/TypeScript/pull/57207).
- Consider incremental type annotations via prepending `// @ts-check` to JS files.

### JSX
- Prefer ternary with explicit null case `return (someCondition ? (<SomeComponent/>) : null)` over `return (someCondition && <SomeComponent/>)`.

### Parsing and validation of user input
- Prefer [Zod](https://zod.dev/) schema over JSON schema - This improves the TypeScript development experience and follows the ["parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) mantra.

### Coordination type schemas
- Prefer primitive values like numbers and strings over objects and arrays - Coordination values must be used entirely. Therefore, usage of objects and arrays prevent linking views on a subset of the object/array values.


## Code style guide

> A good style guide defines not only superficial elements like naming conventions or whitespace rules but also how to use the features of the given programming language. JavaScript and Perl, for example, are packed with functionality — they offer many ways to implement the same logic. A style guide defines The One True Way of doing things so that you don’t end up with half your team using one set of language features while the other half uses a totally different set of features. -- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/).

This section contains an evolving set of code style guidelines that are not currently automated via linting.

- Use MUI style utilities to define styles ([makeStyles](https://v4.mui.com/styles/api/#makestyles-styles-options-hook), at least until we migrate to MUI v5).
- Use `false`, `null`, and `undefined` as false-y values unless the corresponding truth-y value is a number (to align with [JSX boolean handling](https://legacy.reactjs.org/docs/jsx-in-depth.html#booleans-null-and-undefined-are-ignored)).
- Use `lodash/isEqual` for set path equality checks and comparisons.
- Prefer more specific naming for utility functions (despite length/verbosity) to help readability.
- Prefer event handlers to side effects (from React docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect))
  - Related: exercise caution when removing effect dependencies (from React docs: [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies))
- Web workers should be [inlined](../packages/workers/rollup.config.js) so that they do not depend on relative paths that consumer applications and libraries would need to configure.
- Use `.js` extensions for relative imports, [even in TypeScript contexts](https://github.com/microsoft/TypeScript/issues/42151#issuecomment-914472944).
- Do not use `.js` extensions for third-party packages, unless either:
  - The function or variable that needs to be accessed is not exported from the main entrypoint of the package.
  - The package is published as CommonJS or UMD rather than ESM (or the ESM build is broken as with [json2csv](https://github.com/zemirco/json2csv/issues/539) and [react-virtualized](https://github.com/bvaughn/react-virtualized/issues/1632)).


