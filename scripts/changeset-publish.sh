#!/usr/bin/env bash
set -o errexit
set -o pipefail

if [[ "$1" != "--action" ]]; then
  if ! command -v gh &> /dev/null
  then
      die "Requires the GitHub CLI (gh)."
  fi
fi

# Temporarily copy the root README.md to packages/main/prod/README.md,
# since the file at packages/main/prod will be shown for the main 'vitessce'
# package on NPM.
mv ./packages/main/prod/README.md ./packages/main/prod/README.temp.md
cp ./README.md ./packages/main/prod/README.md

# Publish all sub-packages to NPM.
pnpm publish --filter='./packages/**' --no-git-checks --access public

# Revert the copied README
rm ./packages/main/prod/README.md
mv ./packages/main/prod/README.temp.md ./packages/main/prod/README.md

# Tag this as the release commit.
git tag v$(cat ./package.json | jq -r .version)
# Push the tag to GitHub.
git push --follow-tags

# Create RELEASE_NOTES.md from the latest entries in CHANGELOG.md.
node .changeset/get-release-notes.mjs

# Either indicate to softprops/action-gh-release that there should be a release,
# or create a release from the command line.
if [[ "$1" == "--action" ]]; then
  echo "should-release=true" >> $GITHUB_OUTPUT
else
  # Need to create a GitHub release from the command line.
  TAG_NAME=v$(cat ./package.json | jq -r .version)
  # Use the GitHub CLI to create a release.
  gh release create $TAG_NAME -F RELEASE_NOTES.md
fi
