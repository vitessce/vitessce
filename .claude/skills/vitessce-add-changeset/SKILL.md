---
name: vitessce-add-changeset
description: Use when the user has made changes to Vitessce packages and needs to record a changeset for the release process. Trigger on "add a changeset", "bump version", "record a change", "prepare a release", "how do I version this", "update the changelog", or any mention of CHANGELOG in this codebase.
---

# Adding a Changeset

Vitessce uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

**Never edit `CHANGELOG.md` directly.** All changelog entries are generated from changeset files.

## How to add a changeset

From the repository root:

```bash
pnpm changeset
```

This prompts you to:
1. Select which packages were changed
2. Choose a bump type (`major`, `minor`, or `patch`)
3. Write a short summary of the change

This creates a file in `.changeset/`. Commit it alongside your code changes.

## When to add a changeset

Add one whenever you change a public API in any package under `packages/`. You generally don't need one for:

- Changes to `sites/` (demo/docs websites)
- Test-only changes
- Pure internal refactors with no observable behavior change

## Release flow

Changesets are consumed during the release process (`pnpm run release`), which bumps package versions and updates `CHANGELOG.md` files automatically.
