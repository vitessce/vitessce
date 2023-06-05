## How to add a new schema version

The following checklist can be used when adding a new schema version.

- __Upgrade function__: Each schema version must be accompanied by an upgrade function that facilitates automatically upgrading configs from the directly preceding schema version.
  - Define this in [previous-config-upgraders.ts](https://github.com/vitessce/vitessce/blob/main/packages/schemas/src/previous-config-upgraders.ts)
- __Zod schema__: Each schema version must be accompanied by a Zod schema.
  - Define this in [previous-config-schemas.ts](https://github.com/vitessce/vitessce/blob/main/packages/schemas/src/previous-config-schemas.ts)
    - [Where possible](https://github.com/vitessce/vitessce/blob/a4a919d86f84d9e837f41013110918ab77092ebd/packages/schemas/src/previous-base-schemas.ts#L46), [.extend](https://zod.dev/?id=extend) from the previous schema.
- Config version meta-information: in [previous-config-meta.ts](https://github.com/vitessce/vitessce/blob/main/packages/schemas/src/previous-config-meta.ts)
  - Set the newly-defined schema as the value of `latestConfigSchema`.
  - Add the newly-defined schema type to the `AnyVersionConfig` union type.
  - Append the newly-defined schema and upgrade function to the `SCHEMA_HANDLERS` array.
- Update the list of config versions on the [View Configs via JSON](http://vitessce.io/docs/view-config-json/) documentation page.

### If the reasoning for the new version is NOT for _only_ coordination type or behavioral changes:
- Update the schema constructed by `buildConfigSchema` to match the "generic" (i.e., non-plugin-specific) schema in `latestConfigSchema`.


