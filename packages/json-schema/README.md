This directory contains NodeJS scripts for converting the Zod schemas from `@vitessce/schemas` (located in `packages/schemas/`) to JSON schema.

These JSON schemas are not intended to be used at runtime within any Vitessce JS sub-package.
Instead, they are intended to be uploaded to NPM/CDN where they can be accessed from Python or R to perform validation in the absence of JavaScript.

- `config-<version>.schema.json`: plugin-agnostic schema for each config version. File definition `options`, view `component` names, and coordination values are not checked.
- `config-<latestVersion>.base-plugins.schema.json`: schema for the latest config version, built with the base plugins from `packages/main/all/src/base-plugins.ts` (the same schema used to validate configs in `<Vitessce/>` when no additional plugins are provided). File definition `options`, view `component` names, and coordination values are checked.

Note: unlike the Zod schemas, which silently remove unrecognized object properties, these JSON schemas reject them (`additionalProperties: false`).


From the root of the monorepo, run:

```sh
pnpm run build-json-schema
```