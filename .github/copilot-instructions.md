# Vitessce AI Coding Assistant Instructions

Vitessce is a visual integration tool for exploration of spatial single-cell experiments, built as a React component library with WebGL visualization capabilities. This is a complex monorepo with specific architectural patterns that require understanding to be productive.

## Architecture Overview

### Monorepo Structure

- `packages/` - NPM packages organized by purpose: `view-types/`, `file-types/`, `utils/`, `main/`
- `sites/` - Web applications (`demo/`, `docs/`)
- Uses PNPM workspaces with TypeScript project references
- Three build phases: **build** (dev transforms via `tsc`), **start** (hot-reload), **bundle** (NPM publishing)

### Core Coordination Pattern

Vitessce uses a **coordination model** for state management between components:

```javascript
// All components follow this pattern
import { useCoordination } from "@vitessce/vit-s";
const [obsFilter, setObsFilter] = useCoordination(CoordinationType.OBS_FILTER);
```

- State is managed via `CoordinationType` constants (in `packages/constants-internal/src/coordination.ts`)
- Components declare dependencies in `COMPONENT_COORDINATION_TYPES` mapping
- Use Zustand for state management with `useCoordination` hook

### Component Architecture

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

## Development Workflows

### Essential Commands

```bash
# Setup (requires PNPM v9.5+, NodeJS v18.6.0)
pnpm install && pnpm run build && pnpm run start-demo

# Create new view type
pnpm run create-view line-plot

# Testing
./scripts/test.sh           # Full test suite (lint + unit + e2e)
pnpm run test              # Unit tests only
pnpm run lint-fix          # Fix linting issues

# Changesets (never edit CHANGELOG.md directly)
pnpm changeset             # Add changeset for changes
```

### Build System

- TypeScript compilation: `tsc --build` (root) builds all packages via project references
- Exceptions use custom Vite/Rollup configs: `@vitessce/icons`, `@vitessce/workers`, `@vitessce/dev`
- Output: `dist-tsc/` (dev), `dist/` (production bundles)

## Data Loading & File Types

### Data Hook Pattern

```javascript
// In subscriber components
const [cells] = useCells(loaders, dataset, { obsFilter, obsSetFilter });
const [obsLabels] = useObsLabels(loaders, dataset, false);
```

- Data hooks are in `packages/vit-s/src/data-hooks.js`
- File type loaders in `packages/file-types/*/src/`
- Abstract loader classes provide consistent interfaces

### File Type Implementation

- Extend `AbstractTwoStepLoader` or similar base classes
- Register in `packages/main/all/src/base-plugins.ts`
- Support multiple formats: AnnData, OME-Zarr, CSV, JSON, SpatialData

## Plugin System

### View Type Registration

```typescript
// Register in base-plugins.ts
const pluginViewTypes = [
  new PluginViewType(
    ViewType.SCATTERPLOT,
    ScatterplotSubscriber,
    coordinationTypes
  ),
];
```

### File Type Registration

```typescript
const pluginFileTypes = [
  new PluginFileType(FileType.OBS_EMBEDDING_CSV, ObsEmbeddingCsvLoader, schema),
];
```

## Configuration System

### VitessceConfig API

- Programmatic config creation via `packages/config/src/VitessceConfig.js`
- JSON schema validation in `packages/json-schema/`
- Supports coordination spaces, datasets, and layouts

### Schema Versioning

- Increment schema version for new coordination types
- Provide upgrade functions for backward compatibility
- Default schema version in `VitessceConfig` constructor

## Key Conventions

### Coordination Types

- Define in `packages/constants-internal/src/constants.ts`
- Map component dependencies in `COMPONENT_COORDINATION_TYPES`
- Use semantic naming: `EMBEDDING_TARGET_X`, `SPATIAL_ZOOM`

### Material-UI Styling

- Use `makeStyles` hook pattern, avoid CSS imports
- Global selectors for third-party integration
- Shared styles in `packages/styles/`

### Testing Patterns

- Unit tests colocated with source files
- E2E tests with Playwright (requires `pnpm run build-demo`)
- Vitest workspace configuration covers all packages

## Import Guidelines

- Avoid non-standard imports (CSS, JSON) - use JS files instead
- External dependencies via PNPM catalogs for version consistency
- Three.js/React-Three-Fiber pinned to avoid multiple copies

## Common Pitfalls

- Never edit `CHANGELOG.md` directly - use changesets
- Include 3+ lines context in `replace_string_in_file` operations
- Use absolute file paths for all tools
- Check `COMPONENT_COORDINATION_TYPES` when adding coordination dependencies
- Bundle size limit: 50MB per package for CDN compatibility

## Examples to Study

- `packages/view-types/feature-list/` - Simple subscriber/child pattern
- `packages/file-types/zarr/` - Complex data loading
- `packages/config/src/VitessceConfig.js` - Configuration API
- `scripts/create-view.mjs` - Code generation patterns
