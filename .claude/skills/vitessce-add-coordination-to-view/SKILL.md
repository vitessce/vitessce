---
name: vitessce-add-coordination-to-view
description: Use when wiring an existing coordination type into an existing Vitessce subscriber component — making a view read or write a piece of shared state it doesn't currently use. Trigger on "add coordination to a view", "wire up coordination", "make this view respond to a new property", "subscribe to a coordination type", "add a coordination scope to a view", or "link this view to shared state".
---

# Adding a Coordination Type to an Existing View

This covers the case where the coordination type already exists and you're connecting it to a view
that doesn't currently use it. To register a brand-new coordination type, see
`vitessce-add-coordination-type` first.

## 1. Update COMPONENT_COORDINATION_TYPES

In `packages/constants-internal/src/coordination.ts`, add the type to the view's array:

```ts
export const COMPONENT_COORDINATION_TYPES = {
  [ViewType.MY_VIEW]: [
    CoordinationType.OBS_TYPE,       // existing
    CoordinationType.MY_NEW_TYPE,    // add this
  ],
};
```

This is the most commonly missed step. `useCoordination` only returns the parameters it is passed,
and every subscriber passes `COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW]` — so if the type isn't
listed here it will come back `undefined`.

## 2. Destructure in useCoordination

In the subscriber component, add the new value and setter:

```ts
const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

const [{
  obsType,
  myNewType,        // add
}, {
  setObsType,
  setMyNewType,     // add setter if the view should be able to change this value
}] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW], coordinationScopes);
```

Setter names are derived mechanically as `set` + capitalized parameter name, so no registration is
needed for the setter itself.

Note that `coordinationScopes` must be the output of `useCoordinationScopes(coordinationScopesRaw)`,
not the raw prop — that hook resolves `metaCoordinationScopes` indirection.

## 3. Pass to the child component

```jsx
<MyView
  obsType={obsType}
  myNewType={myNewType}
  setMyNewType={setMyNewType}
/>
```

## 4. Update the view config

Add the coordination scope to any layout entries that use this view, and declare its value in
`coordinationSpace`:

```js
coordinationSpace: {
  // ...existing...
  myNewType: { A: defaultValue },
},
layout: [
  {
    component: 'myView',
    coordinationScopes: {
      obsType: 'A',
      myNewType: 'A',   // add
    },
    ...
  },
],
```

With `initStrategy: 'auto'` you can omit this — Vitessce will auto-assign a scope holding the
coordination type's registered default value — but explicit is clearer when you want a specific
initial value.

## Per-layer / per-channel coordination

If the coordination type is scoped per layer or per channel (as in the spatial and layer-controller
views), the values live in `coordinationScopesBy` rather than `coordinationScopes`, and the
subscriber reads them via `useCoordinationScopesBy` plus the multi-level variants in
`packages/vit-s/src/state/hooks.js` (e.g. `useMultiCoordinationScopes`,
`useMultiCoordinationScopesSecondary`) instead of a plain `useCoordination` call. Follow the pattern in
`packages/view-types/spatial-beta/src/SpatialSubscriber.js` for that case.
