---
name: vitessce-add-coordination-type
description: Use when adding a brand new coordination type to Vitessce — a new named piece of shared state that synchronizes multiple views. Covers the CoordinationType constant, Zod schema, default value, plugin registration, and schema versioning. Trigger when user says "add a coordination type", "new shared state", "new coordination parameter", "link views by X", or "register a coordination type".
---

# Adding a New Coordination Type

A **coordination type** is a named parameter (e.g., `obsSetSelection`, `spatialZoom`) that views share. When one view updates the value, all views on the same scope react. Implemented with Zustand internally.

## Steps

### 1. Add the constant

In `packages/constants-internal/src/coordination-types.ts`:

```ts
export const CoordinationType = {
  // ...existing...
  MY_NEW_TYPE: 'myNewType',
} as const;
```

Use `UPPER_SNAKE_CASE` for the key, `camelCase` for the string value.

### 2. Register the plugin

In `packages/main/all/src/base-plugins.ts`:

```ts
new PluginCoordinationType(
  CoordinationType.MY_NEW_TYPE,
  defaultValue,    // initial value when a scope is auto-created
  z.string(),      // Zod schema for the value type
)
```

### 3. Update COMPONENT_COORDINATION_TYPES

In `packages/constants-internal/src/component-coordination-types.ts`, add the new type to each view that should use it:

```ts
export const COMPONENT_COORDINATION_TYPES = {
  [ViewType.SCATTERPLOT]: [
    // ...existing...
    CoordinationType.MY_NEW_TYPE,
  ],
};
```

### 4. Update the JSON schema

Increment the schema version in `packages/schemas` and add the new coordination type field. Add an upgrade function for backward compatibility.

## Using it in a view

In the subscriber component:

```ts
const [{ myNewType }, { setMyNewType }] = useCoordination(
  COMPONENT_COORDINATION_TYPES[ViewType.MY_VIEW],
  coordinationScopes,
);
```

For wiring an existing view to use a coordination type it doesn't currently use, see the `vitessce-add-coordination-to-view` skill instead.

## Documentation

- `sites/docs/docs/coordination.md`
- `sites/docs/docs/coordination-types.mdx`
