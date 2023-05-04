<!-- Inspired by https://github.com/visgl/deck.gl/blob/a58191a83c7d06526d9a7419db76d8442e83849c/dev-docs/deckgl-api-guidelines.md -->

# Vitessce Design Guidelines

An evolving set of guidelines to ensure that features remain maintainable, scalable, and consistent.

## Design Guidelines

### Tests

- Prefer unit tests over end-to-end tests - Keep React components relatively "dumb" and put complex logic into utility functions that can be easily unit-tested.
- Test in [portal-ui](https://github.com/hubmapconsortium/portal-ui) with diverse data modalities prior to major releases

### Data types

- Prefer minimal data types - If you can imagine reasonably storing data in multiple files (e.g., using formats like CSV or JSON), then consider splitting into multiple simpler data types. [Joint file types](http://vitessce.io/docs/data-types-file-types/#joint-file-types) can be used in cases where data is stored in the same file.

### Scripting for development

- Prefer NodeJS scripts over complex Shell scripts.

### Monorepo organization

- Avoid [circular dependencies](https://github.com/vitessce/vitessce/issues/1490) - If you find the need to import functions across view type- or file type- sub-packages, consider moving to a utility sub-package (i.e., `packages/utils/`).
- Avoid complex dependencies in utility sub-packages - Where possible keep dependencies in utility sub-packages small and simple (e.g., `lodash`). If a large/complex dependency is needed for a utility function, consider refactoring that function into a new utility sub-package.
- Use `.js` extensions for all relative imports, [even in TypeScript contexts](https://github.com/microsoft/TypeScript/issues/42151#issuecomment-914472944).

### Parsing and validation of user input
- Prefer [Zod](https://zod.dev/) schema over JSON schema - This improves the TypeScript development experience and follows the ["parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) mantra.

### Coordination type schemas
- Prefer primitive values like numbers and strings over objects and arrays - Coordination values must be used entirely. Therefore, usage of objects and arrays prevent linking views on a subset of the object/array values.

