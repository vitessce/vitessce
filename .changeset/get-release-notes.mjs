// Using the updated CHANGELOG.md file, get the release notes for the latest version.
// Adapted from https://github.com/changesets/action/blob/595655c3eae7136ff5ba18200406898904362926/src/utils.ts
import unified from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import mdastToString from "mdast-util-to-string";
import fs from "node:fs";

const BumpLevels = {
  none: 0,
  patch: 1,
  minor: 2,
  major: 3,
};


function getChangelogEntry(changelog, version) {
  let ast = unified().use(remarkParse).parse(changelog);

  let highestLevel = BumpLevels.none;

  let nodes = ast.children; // as Array<any>;
  let headingStartInfo; /*:
    | {
        index: number;
        depth: number;
      }
    | undefined;*/
  let endIndex; //: number | undefined;

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.type === "heading") {
      let stringified = mdastToString(node);
      let match = stringified.toLowerCase().match(/(major|minor|patch)/);
      if (match !== null) {
        let level = BumpLevels[match[0]];
        highestLevel = Math.max(level, highestLevel);
      }
      if (headingStartInfo === undefined && stringified === version) {
        headingStartInfo = {
          index: i,
          depth: node.depth,
        };
        continue;
      }
      if (
        endIndex === undefined &&
        headingStartInfo !== undefined &&
        headingStartInfo.depth === node.depth
      ) {
        endIndex = i;
        break;
      }
    }
  }
  if (headingStartInfo) {
    ast.children = ast.children.slice(
      headingStartInfo.index + 1,
      endIndex
    );
  }
  return {
    content: unified().use(remarkStringify).stringify(ast),
    highestLevel: highestLevel,
  };
}

const fullChangelog = fs.readFileSync('CHANGELOG.md', { encoding: 'utf-8' });
const rootPkgJson = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));
const latestEntry = getChangelogEntry(fullChangelog, rootPkgJson.version);
fs.writeFileSync('RELEASE_NOTES.md', latestEntry.content);