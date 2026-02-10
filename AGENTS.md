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

The repository contains web apps for under `sites/`:
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


## Testing

- Uses the Vitest framework.
- Test files are co-located with source, named `*.test.js`, `*.test.ts`, `*.test.jsx`, or `*.test.tsx` (use `.jsx`/`.tsx` for files containing JSX).
- Import `{ describe, it, expect }` from `vitest`.
- Toy data fixtures are factored into co-located `*.test.fixtures.js` files.


## Code Style & Conventions

- **Language**: TypeScript (`.ts`, `.tsx`) is preferred for new code; legacy code may be `.js`/`.jsx`, with or without JSDoc comments for types.
- **React**: Functional components with hooks. No class components in new code. Prefer `useMemo` over useState/useEffect.
- **Exports**: Use named exports. Avoid default exports in new code.
- **Imports**: Avoid non-standard imports (CSS, JSON) - use JS files instead
- **Formatting**: Follow the existing ESLint rules. No separate Prettier config—ESLint handles style.
- **NO CSS ALLOWED**: Use JSS-based `makeStyles` from `@vitessce/styles` (see [Styling snippet](#styling-jss-via-makestyles) below).
- **Material UI**: MUI components and icons are re-exported from `@vitessce/styles`. Reuse MUI components when possible.
- **Colors**: Prefer `[r, g, b]` color representations, and only convert to strings at the "last second".
- **Dependency version consistency**: External dependencies via PNPM catalogs for version consistency

## Plugin Architecture

Vitessce uses a plugin system. The plugin categories are:

1. **View Types** — React components rendered as panels in the grid layout (e.g., Scatterplot, Spatial, Heatmap). Registered via `PluginViewType(name, component, coordinationTypes)`.
2. **Coordination Types** — Named properties of shared state that enable linked views (e.g., `obsSetSelection`, `spatialZoom`). Registered via `PluginCoordinationType(name, defaultValue, zodSchema)`.
3. **File Types** — Data loaders that fetch and parse files into internal data structures (e.g., `obsEmbedding.anndata.zarr`). Registered via `PluginFileType(name, dataType, loaderClass, sourceClass, zodOptionsSchema)`.

Default plugins are defined in `packages/main/all/src/base-plugins.ts`.
The type interface for plugins is defined in `packages/plugins/src/index.ts`.

### View Type Two-Component Pattern

Every view follows a **two-component pattern**:

1. **Subscriber component** (`*Subscriber.js`) - handles coordination and data loading
2. **Child component** - pure rendering logic

```jsx
<FeatureListSubscriber>
  {" "}
  {/* Handles useCoordination, data hooks */}
  <TitleInfo>
    <FeatureList /> {/* Pure component with props */}
  </TitleInfo>
</FeatureListSubscriber>
```

Subscriber components follow this structure (see [full example](#subscriber-component-example) below):
1. Destructure props (`coordinationScopes`, `theme`, `title`, `removeGridComponent`, etc.)
2. Call `useLoaders()` to get data loader instances
3. Call `useCoordinationScopes(coordinationScopesRaw)` to process raw scopes
4. Call `useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.XXX], coordinationScopes)` → returns `[values, setters]`
5. Call data hooks (e.g., `useObsEmbeddingData`, `useFeatureLabelsData`)
6. Consolidate errors into an array
7. Call `useReady([...statuses])` → single boolean
8. Call `useUrls([...urls])` → flat URL array for download
9. Return `<TitleInfo>` wrapping the presentational component

## View Config

The Vitessce layout and data sources are defined by a **view config** JSON object (see [example](#view-config-json-example) below). Key properties:

- `version`: Schema version string (e.g., `"1.0.17"`).
- `datasets`: Array of dataset definitions with `files` arrays.
- `coordinationSpace`: Object mapping coordination types to coordination scopes and their values.
- `layout`: Array of view/component definitions with grid positions and coordination scope mappings.

Zod schemas for the JSON format are defined in `packages/schemas` (versioned; use the latest).
An object-oriented `VitessceConfig` API is defined in `packages/config`.
Many configuration examples can be found in `examples/configs`.

## Coordination Model

Vitessce uses a **coordination model** for state management between components. Views communicate through a **coordination space**:

- A **coordination type** is a named parameter (e.g., `obsSetSelection`).
- A **coordination scope** is a named instance of a coordination type with a value.
- Views subscribe to scopes; when one view updates a scope's value, all other views on the same scope react.

Internally, this is implemented using Zustand.

### Key Constants (from `@vitessce/constants-internal`)

- **`CoordinationType`** — Object in `@vitessce/constants-internal` mapping `UPPER_SNAKE_CASE` keys to `camelCase` string values (e.g., `CoordinationType.OBS_SET_SELECTION` → `'obsSetSelection'`).
- **`COMPONENT_COORDINATION_TYPES`** — Maps each `ViewType` to its array of supported coordination type strings. Passed to `useCoordination`.
- **`ViewType`** — Enum of view type names (e.g., `ViewType.SCATTERPLOT`, `ViewType.HEATMAP`).

### Core Hooks (from `@vitessce/vit-s`)

| Hook | Purpose |
|---|---|
| `useCoordination(types, scopes)` | Read/write coordination state. Returns `[values, setters]`. |
| `useCoordinationScopes(raw)` | Process raw coordination scopes (handles meta-coordination). |
| `useLoaders()` | Get data loader instances for the current context. |
| `useReady(statuses[])` | Returns `true` only when all status values are not `LOADING`. |
| `useUrls(urlArrays[])` | Flattens and deduplicates URL arrays from data loaders. |

Relevant documentation sources:
- `sites/docs/docs/coordination.md`
- `sites/docs/docs/coordination-types.mdx`

## Data Loading, Data Types, and File Types

Data source and data loader classes are defined in sub-packages in `packages/file-types`.
These are instantiated by the `createLoaders` function which is defined in `packages/vit-s/src/vitessce-grid-utils.js`.
The `createLoaders` function is executed by the `<VitS/>` component which is defined in `packages/vit-s/src/VitS.js`.

React hooks for data loading (using React-Query) are defined in `packages/vit-s/src/data-hooks.js`


### DataSource / DataLoader Architecture

File type plugins follow a two-layer pattern:

| Layer | Responsibility | Examples |
|---|---|---|
| **DataSource** | Manages the connection to a remote resource (URL/store). Handles fetching, caching, and low-level I/O. | `JsonSource`, `CsvSource`, `AnnDataSource`, `OmeTiffSource` |
| **DataLoader** | Reads specific data from the source, transforms it, and returns a `LoaderResult`. Extends `AbstractTwoStepLoader`. | `ObsSetsJsonLoader`, `ObsEmbeddingCsvLoader`, `ObsLabelsAnndataLoader` |

A single DataSource (e.g., `AnnDataSource`) can be paired with many different DataLoaders, each reading different slices of the same backing store.

### Data Loading Flow

```
View Component
  → useObsEmbeddingData(loaders, dataset, ...)        [data-hooks.js — thin wrapper]
    → useDataType(DataType.OBS_EMBEDDING, ...)          [data-hook-utils.js]
      → useQuery({ queryFn: ... })                      [React Query]
        → getMatchingLoader(loaders, dataset, dataType)
        → loader.load()
        → returns { data, coordinationValues, urls }
  → returns [data, status, urls, error]
```

Relevant documentation:
- `sites/docs/docs/data-types-file-types.mdx`
- `sites/docs/docs/data-file-types.mdx`

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

- When modifying a view type, look at an existing one in `packages/view-types/` for the pattern.
- When adding a new coordination type, also update the relevant coordination type package and the plugin specification.
- Shared React hooks for data retrieval live in `packages/vit-s/src/` (e.g., `data-hooks.js`).
- The `packages/utils/` directory contains pure utility functions that should not import React.
- If you need to add a new dependency, add it to the specific sub-package's `package.json`, not the root.
- More developer documentation can be found in markdown files in the `dev-docs` directory.

## Code Snippets

### Styling (JSS via `makeStyles`)

Raw CSS is NOT allowed. Use `makeStyles` from `@vitessce/styles`, which is JSS-based:

```js
import React from 'react';
import { makeStyles, Typography } from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  channelNamesLegendContainer: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    paddingLeft: '10px',
    paddingBottom: '10px',
  },
  channelNameText: {
    marginRight: '10px',
  },
}));

export function ChannelNamesLegend(props) {
  const { classes } = useStyles();

  return (
    <div className={classes.channelNamesLegendContainer}>
        <Typography className={classes.channelNameText}>
            Hello world
        </Typography>
    </div>
  );
}
```

To access the theme (e.g., for background/foreground colors):

```js
const useStyles = makeStyles()(theme => ({
  container: {
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
  },
}));
```

### Debug mode and logging

```js
import { getDebugMode, log } from '@vitessce/globals';

if (getDebugMode()) {
    throw new Error(`In debug mode, index file is required.`);
} else {
    log.error(`Index file is missing, which can increase loading times and degrade performance.`);
}
```

### Subscriber component example

Minimal complete Subscriber (`packages/view-types/status/src/StatusSubscriber.js`):

```js
import React from 'react';
import {
  TitleInfo,
  useCoordination,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { HeatmapPlot } from './HeatmapPlot.js';

export function HeatmapPlotSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    removeGridComponent,
    theme,
    title = 'Heatmap',
    helpText = ViewHelpMapping.HEATMAP,
  } = props;

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  const [{
    obsHighlight,
    featureHighlight,
  }, {
    setObsHighlight,
    setFeatureHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.HEATMAP], coordinationScopes);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      isReady
      helpText={helpText}
    >
      <HeatmapPlot
        obsHighlight={obsHighlight}
        setObsHighlight={setObsHighlight}
        featureHighlight={featureHighlight}
        setFeatureHighlight={setFeatureHighlight}
      />
    </TitleInfo>
  );
}
```

### Data hooks usage in a Subscriber

Data hooks (defined in `packages/vit-s/src/data-hooks.js`) are wrappers around `useDataType`, which uses React Query.

```js
const loaders = useLoaders();

// Each data hook returns [data, status, urls, error]
const [{ obsEmbedding, obsEmbeddingIndex }, embeddingStatus, embeddingUrls, embeddingError]
  = useObsEmbeddingData(loaders, dataset, true, {}, {}, { obsType, embeddingType });

const [{ obsSets }, obsSetsStatus, obsSetsUrls, obsSetsError]
  = useObsSetsData(loaders, dataset, false, {}, {}, { obsType });

// Combine statuses into a single ready boolean
const isReady = useReady([embeddingStatus, obsSetsStatus]);

// Combine URLs for the download button
const urls = useUrls([embeddingUrls, obsSetsUrls]);

// Combine errors for the error indicator
const errors = [embeddingError, obsSetsError];
```

### `TitleInfo` wrapper component

`TitleInfo` is the standard shell for every view type (title bar, spinner, error indicator, download button, settings popover, help tooltip):

```jsx
<TitleInfo
  title="My View"
  info="123 items"
  theme={theme}
  isReady={isReady}
  errors={errors}
  helpText={helpText}
  removeGridComponent={removeGridComponent}
  closeButtonVisible={closeButtonVisible}
  downloadButtonVisible={downloadButtonVisible}
  urls={urls}
  isScroll
  withPadding={false}
  options={<MyOptions />}
>
  {/* Visualization content goes here */}
</TitleInfo>
```

### Unit tests

Prefer to keep business logic in utility functions, and test with inline data and straightforward assertions:

```ts
import { describe, it, expect } from 'vitest';
import { unnestMap } from './root.js';

describe('root.ts', () => {
  describe('unnestMap', () => {
    it('can flatten a Map with one level', () => {
      const m = new Map([
        ['Boxing', 1],
        ['Soccer', 2],
      ]);
      expect(unnestMap(m, ['sport', 'value'])).toEqual([
        { sport: 'Boxing', value: 1 },
        { sport: 'Soccer', value: 2 },
      ]);
    });
  });
});
```


### View config JSON structure

A view config defines datasets, coordination space, and layout:

```js
export const myConfig = {
  name: 'My visualization',
  description: 'Example config',
  version: '1.0.17',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'my-dataset',
      name: 'My Dataset',
      files: [
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://example.com/embedding.csv',
          coordinationValues: { obsType: 'cell', embeddingType: 'UMAP' },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingType: { UMAP: 'UMAP' },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: { embeddingType: 'UMAP' },
      h: 6, w: 6, x: 0, y: 0,
    },
    {
      component: 'description',
      coordinationScopes: {},
      h: 6, w: 6, x: 6, y: 0,
    },
  ],
};
```

### VitessceConfig API

- Programmatic config creation via `packages/config/src/VitessceConfig.js`
- JSON schema validation in `packages/json-schema/`

### Schema Versioning

- Increment schema version for new coordination types
- Provide upgrade functions for backward compatibility

## Common Pitfalls

- Never edit `CHANGELOG.md` directly - use changesets
- Check `COMPONENT_COORDINATION_TYPES` when adding coordination dependencies

## Examples to Study

- `packages/view-types/feature-list/` - Simple subscriber/child pattern
- `packages/file-types/csv/` - Simple data loading
- `packages/file-types/zarr/` - Complex data loading
- `packages/config/src/VitessceConfig.js` - Configuration API
- `scripts/create-view.mjs` - Code generation patterns