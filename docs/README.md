# Vitessce Documentation

This documentation website was built using [Docusaurus 2](https://v2.docusaurus.io/).

## Prepare

This documentation site depends on the Vitessce production library located in `../dist/`.

```sh
cd ..
npm install
npm run build-lib:prod
npm link docs/node_modules/react
cd docs
```

## Installation

Install the docusaurus dependencies.

```sh
npm install
```

## Local Development

```sh
npm run start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```sh
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Troubleshooting

When importing the `<Vitessce/>` component into the documentation site via `../dist`, you need to link the React version used by the Vitessce _library_ to the React version in `docs/node_modules`:

```sh
npm link docs/node_modules/react
```

See the discussion about `npm link` causing the "duplicate/incompatible reacts" warning [here](https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react).