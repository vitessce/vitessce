This directory contains NodeJS scripts for converting the Zod schemas from `@vitessce/schemas` (located in `packages/schemas/`) to JSON schema.

These JSON schemas are not intended to be used at runtime within any Vitessce JS sub-package.
Instead, they are intended to be uploaded to NPM/CDN where they can be accessed from Python or R to perform validation in the absence of JavaScript.


From the root of the monorepo, run:

```sh
pnpm run build-json-schema
```