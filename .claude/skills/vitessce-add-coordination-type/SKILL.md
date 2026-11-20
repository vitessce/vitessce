---
name: vitessce-add-coordination-type
description: Use when adding a brand new coordination type to Vitessce — a new named piece of shared state that synchronizes multiple views. Covers the CoordinationType constant, Zod schema, default value, and plugin registration. Trigger when user says "add a coordination type", "new shared state", "new coordination parameter", "link views by X", or "register a coordination type".
---

# Adding a New Coordination Type

A **coordination type** is a named parameter (e.g., `obsSetSelection`, `spatialZoom`) that views share.
When one view updates the value, all views on the same scope react. Backed by Zustand
(`packages/vit-s/src/state/`).

## Steps

### 1. Add the constant

In `packages/constants-internal/src/constants.ts`:

```ts
export const CoordinationType = {
  // ...existing...
  MY_NEW_TYPE: 'myNewType',
} as const;
```

Use `UPPER_SNAKE_CASE` for the key, `camelCase` for the string value.

### 2. Register the plugin

In `packages/main/all/src/base-plugins.ts`, add to the `baseCoordinationTypes` array:

```ts
new PluginCoordinationType(
  CoordinationType.MY_NEW_TYPE,
  defaultValue,    // initial value when a scope is auto-created
  z.string(),      // Zod schema for the value type
)
```

The constructor is `(name, defaultValue, valueSchema)` — see `packages/plugins/src/index.ts`.
Most existing types use a one-line form, e.g.
`new PluginCoordinationType(CoordinationType.OBS_TYPE, 'cell', z.string())`. Types whose default is
absent use `null` plus a `.nullable()` schema.

### 3. Update COMPONENT_COORDINATION_TYPES

In `packages/constants-internal/src/coordination.ts`, add the new type to each view that should use it:

```ts
export const COMPONENT_COORDINATION_TYPES = {
  [ViewType.SCATTERPLOT]: [
    // ...existing...
    CoordinationType.MY_NEW_TYPE,
  ],
};
```

### 4. No schema version bump is needed

This is a common misconception. `packages/schemas/src/schema-builders.ts` builds the
`coordinationSpace` sub-schema **dynamically** from the registered `PluginCoordinationType`
instances, so registering the plugin in step 2 is what makes the new key valid in a view config.

Schema versions (`packages/schemas/src/previous-config-schemas.ts`, currently latest `1.0.18`) are
incremented only for **structural** changes to the config format — e.g. `1.0.16` introduced
`coordinationScopesBy`, `1.0.17` nested file `options` under a per-data-type key. Those are the
cases that need a new `configSchema1_0_N` and an `upgradeFrom1_0_N-1` function in
`previous-config-upgraders.ts`.



## Using it in a view

In the subscriber component:

```ts
const [{ myNewType }, { setMyNewType }] = useCoordination(
  COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW],
  coordinationScopes,
);
```

For wiring an existing view to a coordination type it doesn't currently use, see the
`vitessce-add-coordination-to-view` skill instead.

## Documentation

- `sites/docs/docs/coordination.md`
