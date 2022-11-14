We want to store our icons in their original SVG files, but we want to use them as React components.

Typescript alone cannot do this: we need a build step to convert each SVG file into a React component, and then export each React component from the package.

Then, we can simply import from `@vitessce/icons` in our consumer packages.

```sh
pnpm run build
```