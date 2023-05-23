# Config schema versioning

## Motivation

In Vitessce, we make the following commitment related to backwards compatibility: JSON configurations defined against a particular config schema version must be compatible with the version of the JavaScript package in which that schema version was defined __and all future package versions__.


In addition, we need to allow the config schema to continue to evolve as development continues in the form of new and improved file types, coordination types, and view types. Sometimes, we will even need to modify the behavior of particular views, file types, or coordination types (e.g., to fix bugs).

For example, the developers of the HuBMAP Portal have written many Vitessce configs, which must remain valid despite updating the Vitessce JS package version to pull in new features or bug fixes.

__Versioning of the config schema enables us (as developers in the present) to infer the behavior of Vitessce that was assumed by the author of a particular config (as users in the past).__

## When

A new config schema version should be added when:
- behavior of a coordination type changes significantly
- the value schema for a coordination type changes
- coordination type(s) are added, removed, or renamed
- view type(s) are added, removed, or renamed

## How

Config schemas are defined using [Zod](https://zod.dev/) in the `@vitessce/schemas` sub-package of the Vitessce monorepo.

See the [README](../packages/schemas/README.md) for detailed instructions.
