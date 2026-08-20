---
name: vitessce-add-changeset
description: Use when the user has made changes within this repository and needs to document the changes in preparation for semantic versioning. Trigger on "add a changeset", "bump version", "record a change", "prepare a release", "how do I version this", "update the changelog", or any mention of CHANGELOG in this codebase.
---

# Adding a Changeset

Vitessce uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

**Never edit any `CHANGELOG.md` directly.** All changelog entries are generated from changeset files.

## Write the changeset file directly

`pnpm changeset` is an interactive prompt, so it is not usable non-interactively. Create the
markdown file in `.changeset/` yourself instead. The filename is arbitrary (the CLI generates
`adjective-noun-verb.md`); only the contents matter:

```markdown
---
"@vitessce/vit-s": patch
---

Add skills and refactor use-memo-custom-comparison into vit-s.
```

- Front matter maps package names (from each sub-package's `package.json` `name` field) to a bump
  type: `major`, `minor`, or `patch`.
- The body is the changelog entry. One sentence, imperative or descriptive, ending with a period.
- List every sub-package you changed. Commit the file alongside your code changes.


## When to add a changeset

## CI check

`.github/workflows/test.yml` runs `pnpm run changeset-status`, which is
`changeset status --since=origin/main`. It fails the PR when a package was modified relative to
`main` but has no changeset covering it. To check locally before pushing:

```bash
pnpm run changeset-status
```

Private packages (`docs`, `@vitessce/example-configs`, the sites) are still versioned and still
appear in changeset front matter — see `.changeset/*.md` for existing examples.
