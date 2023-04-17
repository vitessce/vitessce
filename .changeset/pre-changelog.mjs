// Because we only want a single changelog for the entire monorepo,
// we will manually edit the changeset frontmatter.
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

