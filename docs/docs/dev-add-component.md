---
id: dev-add-component
title: View type implementation
---

This page walks through the steps required to create a new visualization component.
Vitessce components are React components which conform to certain conventions, and may be implemented with libraries such as Vega-Lite, D3, DeckGL or plain JavaScript code.

## The parent component

All of the core Vitessce components consist of at least two React components: an outer "parent" component and an inner "child" component.
By convention, we add the suffix `Subscriber` to the name of the parent component.

The parent ("subscriber") component typically carries out the following:
- get and set values from the coordination space with the [`useCoordination`](https://github.com/vitessce/vitessce/blob/main/src/app/state/hooks.js#L196) hook function.
- should render the [`TitleInfo`](https://github.com/vitessce/vitessce/blob/main/src/components/TitleInfo.js) component as a parent of its "plain" component.
- load data from files specified in the view config with [data hook](https://github.com/vitessce/vitessce/blob/main/src/components/data-hooks.js) functions.

A React subtree for a component called `GenesSubscriber` would look like:

```jsx
<GenesSubscriber>
  <TitleInfo>
    <Genes />
  </TitleInfo>
</GenesSubscriber>
```

A full example of a parent component can be found in [GenesSubscriber](https://github.com/vitessce/vitessce/blob/main/src/components/genes/GenesSubscriber.js).

:::note
The usage of the term "subscriber" here comes from prior usage of a pub-sub pattern in Vitessce. Now we use the `[values, setters]` returned by the custom `useCoordination` hook to manage state in a more `React.useState`-like pattern (instead of pub-sub).
:::

## The child component

The child component may take data and callback functions as props from its parent subscriber function, and should use its props to render a visualization or controller component. The plain component should not use the `useCoordination` hook or any of the `use___Data` hook functions.

A full example of a child component can be found in [Genes](https://github.com/vitessce/vitessce/blob/main/src/components/genes/Genes.js).

:::note
In theory, we could perform both the parent- and child-component tasks in one component.
However, using two components helps us to separate concerns and split up code.
Making the child component agnostic to the state management and data loading implementations helps facilitate usage of child components in [other projects](https://github.com/vitessce/vitessce/discussions/1232).
:::

## The view type registry

There must be a mapping between a **view type** name and the actual React component function to facilitate usage of the view type as a string ([`layout[].component`](/docs/view-config-json/#layout)) in the JSON view config. The [view type registry](https://github.com/vitessce/vitessce/blob/main/src/app/component-registry.js) maps view types to JavaScript functions.

:::tip
The plugin analog of the view type registry is the [`registerPluginViewType`](/docs/dev-plugins/#plugin-view-types) function.
:::

## Component coordination types

In order for a component to access or change values in the coordination space, the mapping from the view type name to a subset of coordination types must be defined in [`COMPONENT_COORDINATION_TYPES`](https://github.com/vitessce/vitessce/blob/main/src/app/state/coordination.js).
This helps to avoid unnecessary component re-rendering events (i.e., if we know that the heatmap does not depend on the `spatialZoom` coordination type, we can omit this from the list of coordination types used by the heatmap component, and the heatmap will not re-render upon `spatialZoom` updates).

:::tip
The plugin analog of `COMPONENT_COORDINATION_TYPES` is the `coordinationTypes` parameter of the [`registerPluginViewType`](/docs/dev-plugins/#plugin-view-types) function.
:::