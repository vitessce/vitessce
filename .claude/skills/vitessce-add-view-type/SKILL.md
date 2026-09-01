---
name: vitessce-add-view-type
description: Use when creating a new Vitessce view type from scratch. Covers the two-component pattern (Subscriber + child), plugin registration, coordination hooks, data hooks, and TitleInfo wrapper. Trigger when user says "add a view", "create a view type", "new visualization panel", "new component", or "scaffold a view" in this codebase.
---

# Adding a New View Type

Every view type follows a **two-component pattern**: a Subscriber component that wires coordination
and data, and a child component that does pure rendering.

## Start with the generator

```bash
pnpm run create-view line-plot
```

Pass a kebab-case name (must match `/^[a-z][a-z0-9-]*$/`). `scripts/create-view.mjs` creates
`packages/view-types/line-plot/` (with `package.json`, `tsconfig.json`, `vitest.config`,
`LinePlot.js`, `LinePlotSubscriber.js`, `index.js`) **and** edits these existing files for you:

- root `tsconfig.json` — adds the project reference
- `packages/constants-internal/src/constants.ts` — adds the `ViewType` **and** `ViewHelpMapping` entries
- `packages/constants-internal/src/coordination.ts` — adds a `COMPONENT_COORDINATION_TYPES` entry
  seeded with `DATASET`, `OBS_TYPE`, `FEATURE_TYPE`, `FEATURE_SELECTION`
- `packages/main/all/src/base-plugins.ts` — registers the view type
- `packages/main/all/package.json` — adds the workspace dependency
- `examples/configs/src/view-configs/line-plot.js` + `examples/configs/src/index.js` — adds a
  runnable example config registered as `line-plot-example`

So do **not** hand-write those registrations after running the generator. Its printed next steps are:

```bash
pnpm install                  # pick up the new internal dependency
pnpm run start-demo           # then open http://localhost:3000/?dataset=line-plot-example
pnpm run lint-fix
```

Also add a changeset (see `vitessce-add-changeset`) — the new sub-package plus the edited packages
need one for CI to pass.

## Registration (when doing it by hand)

In `packages/main/all/src/base-plugins.ts`, entries in `baseViewTypes` use the local `makeViewType`
helper, which reads the coordination types from the constants:

```ts
makeViewType(ViewType.MY_VIEW, MyViewSubscriber)
// === new PluginViewType(name, component, COMPONENT_COORDINATION_TYPES[name])
```

So `ViewType.MY_VIEW` must exist in `packages/constants-internal/src/constants.ts` and
`COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW]` must exist in
`packages/constants-internal/src/coordination.ts` — `makeViewType` will otherwise pass `undefined`.

Registering the plugin is what makes the view name valid in a view config's `layout[].component`
(the schema's component enum is built from the registered view types), so **no schema version bump
is needed** for a new view type.

## Subscriber Component Structure

The Subscriber wires coordination and data into the child:

1. Destructure standard props: `coordinationScopes`, `theme`, `title`, `removeGridComponent`, `closeButtonVisible`, `helpText`
2. `const coordinationScopes = useCoordinationScopes(coordinationScopesRaw)`
3. `const [values, setters] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW], coordinationScopes)`
4. `const loaders = useLoaders()` — only if loading data
5. Call data hooks — see the `vitessce-add-data-hook-to-view` skill
6. `const errors = [error1, error2]`
7. `const isReady = useReady([status1, status2])`
8. `const urls = useUrls([urls1, urls2])`
9. Return `<TitleInfo>` wrapping the child

This mirrors what the generator emits (`scripts/create-view-template-functions.mjs`):

```jsx
import React from 'react';
import { TitleInfo, useCoordination, useCoordinationScopes } from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { MyView } from './MyView.js';

export function MyViewSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    removeGridComponent,
    theme,
    title = 'My View',
    helpText = ViewHelpMapping.MY_VIEW,
  } = props;

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  const [{
    obsHighlight,
  }, {
    setObsHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW], coordinationScopes);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
      helpText={helpText}
    >
      <MyView obsHighlight={obsHighlight} setObsHighlight={setObsHighlight} />
    </TitleInfo>
  );
}
```

`ViewHelpMapping.MY_VIEW` (in `packages/constants-internal/src/constants.ts`) is the help tooltip
text. The generator inserts a placeholder — replace it with a real description of the view.

## TitleInfo Props

`TitleInfo` is the standard shell for every view (title bar, spinner, error indicator, download
button, help tooltip):

```jsx
<TitleInfo
  title="My View"
  info="123 items"             // shown in title bar subtitle
  isReady={isReady}
  errors={errors}              // array; falsy entries are filtered out
  helpText={helpText}
  guideUrl="/docs/..."         // optional link to a docs guide
  removeGridComponent={removeGridComponent}
  closeButtonVisible={closeButtonVisible}     // default true
  downloadButtonVisible={downloadButtonVisible} // default true
  urls={urls}
  isScroll                     // enable scrolling in the content area
  isSpatial                    // layout variant for spatial views
  withPadding={false}          // remove default padding
  options={<MyOptions />}      // settings popover content
>
  {/* visualization content */}
</TitleInfo>
```

Those are the props `TitleInfo` actually destructures (`packages/vit-s/src/TitleInfo.js`). Most
subscribers additionally pass `theme={theme}`; `TitleInfo` itself no longer reads it (it gets the
theme from the MUI provider), so it is harmless but not load-bearing.

## Styling

Do not use raw CSS. Use `makeStyles` from `@vitessce/styles`. See the `vitessce-styling` skill —
note in particular that `makeStyles` keys must be unique across the whole monorepo.

## Tests

`vitest.workspace.ts` already globs `packages/view-types/*`, so a new view package is picked up with
no config change. Test files must live under the package's `src/` directory.

## Examples to Study

- `packages/view-types/status/src/StatusSubscriber.js` — minimal subscriber
- `packages/view-types/feature-list/` — simple subscriber/child pattern with an options popover
- `packages/view-types/scatterplot-embedding/src/EmbeddingScatterplotSubscriber.js` — subscriber with
  many data hooks (note: `packages/view-types/scatterplot/` holds only the presentational
  `Scatterplot` child component, not a subscriber)
- `sites/docs/docs/tutorial-plugin-view-type.mdx` — the same flow as an external plugin
