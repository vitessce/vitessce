---
name: vitessce-add-changeset
description: Use when the user has made changes within this repository and needs to document the changes in preparation for semantic versioning. Trigger on "add a changeset", "bump version", "record a change", "prepare a release", "how do I version this", "update the changelog", or any mention of CHANGELOG in this codebase.
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

Changesets are required for pull request checks to pass in CI.
