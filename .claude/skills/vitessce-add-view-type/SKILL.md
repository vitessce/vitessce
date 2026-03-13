---
name: vitessce-add-view-type
description: Use when creating a new Vitessce view type from scratch. Covers the two-component pattern (Subscriber + child), plugin registration, coordination hooks, data hooks, and TitleInfo wrapper. Trigger when user says "add a view", "create a view type", "new visualization panel", "new component", or "scaffold a view" in this codebase.
---

# Adding a New View Type

Every view type follows a **two-component pattern**: a Subscriber component that wires coordination and data, and a child component that does pure rendering.

Start with the generator:

```bash
pnpm run create-view line-plot
```

This scaffolds the right file structure under `packages/view-types/`.

## Registration

In `packages/main/all/src/base-plugins.ts`:

```ts
new PluginViewType(ViewType.MY_VIEW, MyViewSubscriber, COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW])
```

Add `ViewType.MY_VIEW` to `@vitessce/constants-internal` and add a `COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW]` entry listing which coordination types the view uses.

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

```jsx
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

## TitleInfo Props

`TitleInfo` is the standard shell for every view (title bar, spinner, error indicator, download button, help tooltip):

```jsx
<TitleInfo
  title="My View"
  info="123 items"           // shown in title bar subtitle
  theme={theme}
  isReady={isReady}
  errors={errors}
  helpText={helpText}
  removeGridComponent={removeGridComponent}
  closeButtonVisible={closeButtonVisible}
  urls={urls}
  isScroll                   // enable scrolling in the content area
  withPadding={false}        // remove default padding
  options={<MyOptions />}    // settings popover content
>
  {/* visualization content */}
</TitleInfo>
```

## Styling

Do not use raw CSS. Use `makeStyles` from `@vitessce/styles`. See the `vitessce-styling` skill.

## Examples to Study

- `packages/view-types/feature-list/` — simple subscriber/child pattern
- `packages/view-types/status/src/StatusSubscriber.js` — minimal subscriber
- `packages/view-types/scatterplot/` — subscriber with data hooks
