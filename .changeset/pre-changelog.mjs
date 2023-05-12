// Because we only want a single changelog for the entire monorepo,
// we will manually edit the changeset frontmatter.

/*
The issue is that (in the monorepo case) each changeset can potentially list
multiple different sub-packages, each sub-package with its own bump type.
Reference: https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#i-am-in-a-multi-package-repository-a-mono-repo

For example:

```markdown
---
'@vitessce/sets-utils': patch
'@vitessce/spatial-utils': minor
---

Something changed blah blah...
```

A changeset like this will cause changesets, by default, to write to two different CHANGELOG.md files:
- `packages/utils/sets-utils/CHANGELOG.md` will get a new section titled `Patch Changes`
- `packages/utils/spatial-utils/CHANGELOG.md` will get a new section titled `Minor Changes`

This script script converts the above changeset markdown file to:

```markdown
---
vitessce: minor
---

Something changed blah blah... (`@vitessce/sets-utils`, `@vitessce/spatial-utils`)
```

using the greatest bump-type as the one assigned to the `mainPkgName`
(in this case `vitessce`) in the frontmatter.

This effectively "tricks" changesets to write to a single `CHANGELOG.md`
file at the root of the repo, despite being in a monorepo.

This is what I meant by changesets being "too monorepo-oriented for my liking":
I would prefer a single CHANGELOG despite the monorepo setup,
but there is not a built-in option to do something like this.
*/
import matter from 'gray-matter';
import fs from 'node:fs';
import { join } from 'node:path';
import { MAIN_PACKAGE_DIR } from './constants.mjs';

const BUMP_TYPE = {
  'none': 0,
  'patch': 1,
  'minor': 2,
  'major': 3,
};

const mainPkgJson = JSON.parse(fs.readFileSync(join(MAIN_PACKAGE_DIR, 'package.json'), { encoding: 'utf-8' }));
const mainPkgName = mainPkgJson.name;

// Get all .md files in the .changeset directory.
fs.readdirSync('.changeset').forEach(file => {
  if(file.endsWith('.md')) {
    const filePath = join('.changeset', file);
    const changeset = matter.read(filePath);
    // Get the greatest common denominator.
    const gcd = Math.max(
      ...Object.values(changeset.data)
        .map(str => BUMP_TYPE[str])
    );
    const gcdStr = Object.keys(BUMP_TYPE).find(key => BUMP_TYPE[key] === gcd);

    // Append the affected packages to the first line of the content.
    const contentLines = changeset.content.split('\n');
    const packageInfo = Object.keys(changeset.data).map(name => '`' + name + '`').join(', ');
    contentLines[1] = `${contentLines[1]} (${packageInfo})`;
    changeset.content = contentLines.join('\n');

    // Overwrite the affected package names, replacing with the root package name.
    changeset.data = { [mainPkgName]: gcdStr };
    // Write the changeset back to the file with the updated frontmatter.
    fs.writeFileSync(filePath, matter.stringify(changeset.content, changeset.data));
  }
});

