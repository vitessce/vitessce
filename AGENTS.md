# Guidelines

Background: Vitessce is a web-based tool for interactive visualization of single-cell and spatial omics data, designed for usage by biological researchers and bioinformaticians.
This repository is organized as a monorepo that contains NPM packages, websites for demos and documentation, and configuration examples.

## Key Principles

- Write clear, maintainable code over clever/short syntax
- Use functional programming patterns; avoid classes
- Favor composition over inheritance


## Naming Conventions

- **Directories**: lowercase with dashes (`view-types/feature-list/`)
- **Components**: PascalCase (`FeatureList.tsx`)
- **Variables and Props**: descriptive with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`). no negation in names (i.e., prefer `enableFeature: false` rather than `disableFeature: true`)


### Terminology

This project historically used a lot of `cell` and `gene` terminology (for variable names). We now prefer the more general `obs` ("observation") and `feature`.

## Monorepo Structure

This project uses **pnpm workspaces**. Packages live under `packages/`. Key packages include:

- `packages/vit-s` — Core framework: `<VitS/>` core component, grid layout, state and coordination management, data loader instantiation.
- `packages/view-types/*` — Individual view type plugins (scatterplot, spatial, heatmap, layer-controller, etc.)
- `packages/file-types/*` — File type / data loader plugins (zarr, csv, json, anndata, etc.)
- `packages/utils/*` — Sub-packages that define shared utility functions.
- `packages/gl` — WebGL/deck.gl layer code
- `packages/constants-internal` — Internal constants shared across packages
- `packages/schemas` — JSON schema for view configs
- `packages/styles` - Re-exports MUI components, icons, and `makeStyles` function (JSS-based CSS-in-JS).
- `packages/types` - Package for shared TypeScript type definitions.
- `packages/globals` - Defines getters and setters for global state such as debugMode and logLevel (`getDebugMode`, `getLogLevel`, `atLeastLogLevel`).
- `packages/main/all` — Meta-package that defines the base set of plugins and the top-level `<Vitessce/>` React component.

The repository contains web apps under `sites/`:
- `sites/demo/` - Development website to test demo/example Vitessce configurations.
- `sites/docs/` - Documentation website built with Docusaurus.


## Development Workflow: Essential Commands

All commands are run from the repository root unless otherwise noted.

```bash
# Setup (requires PNPM v9.5+, NodeJS v18.6.0)
pnpm install && pnpm run build && pnpm run start-demo

# Testing
./scripts/test.sh          # Full test suite (lint + unit + e2e)
pnpm run test              # Unit tests only
pnpm run lint-fix          # Fix linting issues

# Changesets (never edit CHANGELOG.md directly)
pnpm changeset             # Add changeset for changes

# Clean node_modules and start the development server
pnpm run clean-start

# Create new view type
pnpm run create-view line-plot
```

### Build System

- TypeScript compilation: `tsc --build` (root) builds all packages via project references
- Exceptions use custom Vite/Rollup configs: `@vitessce/icons`, `@vitessce/workers`, `@vitessce/dev`
- Output: `dist-tsc/` (dev), `dist/` (production bundles)

For more details, see `README.md` and `dev-docs/monorepo-and-bundling.md`.


## Code Style & Conventions

- **Language**: TypeScript (`.ts`, `.tsx`) is preferred for new code; legacy code may be `.js`/`.jsx`.
- **React**: Functional components with hooks. No class components in new code.
- **Exports**: Use named exports. Avoid default exports in new code.
- **Imports**: Avoid non-standard imports (CSS, JSON) — use JS files instead.
- **Formatting**: Follow the existing ESLint rules. No separate Prettier config.
- **Styling**: Use JSS-based `makeStyles` from `@vitessce/styles`. Raw CSS is not allowed. See the `vitessce-styling` skill.
- **Dependency version consistency**: External dependencies via PNPM catalogs for version consistency.
- If you need to add a new dependency, add it to the specific sub-package's `package.json`, not the root.


## Key Technologies

- React
- Material UI (MUI) for styling and components
- Zustand for state management via the coordination model
- Zod for schema validation
- Vitest for unit testing
- DeckGL and D3 for visualization
- React-Query (aka TanStack Query) for async data loading
- Zarrita for loading data from the Zarr format
- Lodash-ES for utilities such as `isEqual`


## File & Directory Conventions

- Each package has its own `package.json`, `vite.config.js` (or `.ts`), and `src/` directory.
- Entry points are typically `src/index.js` or `src/index.ts`.
- Package names are scoped under `@vitessce/` (e.g., `@vitessce/scatterplot`).


## Branching & PRs

- Default branch: `main`.
- Feature branches follow the pattern `username/feature-description`.
- PRs should include tests for new functionality and pass CI checks (lint + test).


## Tips for Agents

Detailed how-to guidance lives in skills under `.claude/skills/`. Use the appropriate skill for:

- **New view type**: `vitessce-add-view-type`
- **New file type / data loader**: `vitessce-add-file-type`
- **New coordination type**: `vitessce-add-coordination-type`
- **Add coordination to an existing view**: `vitessce-add-coordination-to-view`
- **Add a data hook to an existing view**: `vitessce-add-data-hook-to-view`
- **Styling / CSS-in-JS**: `vitessce-styling`
- **Create a view config**: `vitessce-create-view-config`
- **Modify a view config**: `vitessce-modify-view-config`
- **React hooks patterns**: `vitessce-react-hooks`
- **React Query internals**: `vitessce-react-query`
- **Writing tests**: `vitessce-write-tests`
- **Adding a changeset**: `vitessce-add-changeset`

General tips:
- When modifying a view type, look at an existing one in `packages/view-types/` for the pattern.
- Shared React hooks for data retrieval live in `packages/vit-s/src/` (e.g., `data-hooks.js`).
- The `packages/utils/` directory contains pure utility functions that should not import React.
- More developer documentation can be found in markdown files in the `dev-docs/` directory.
