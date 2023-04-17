#!/usr/bin/env bash
set -o errexit
set -o pipefail

if [[ "$1" != "--action" ]]; then
  if ! command -v gh &> /dev/null
  then
      die "Requires the GitHub CLI (gh)."
  fi
fi

pnpm publish --filter='./packages/**' --no-git-checks --access public
git tag v$(cat ./package.json | jq -r .version)
git push --follow-tags
node .changeset/get-release-notes.mjs

if [[ "$1" == "--action" ]]; then
  # If this was running from within the changesets/action action,
  # then we know that there should be a release.
  echo "should-release=true" >> $GITHUB_OUTPUT
else
  # Need to create a GitHub release from the command line.
  TAG_NAME=v$(cat ./package.json | jq -r .version)

  gh release create $TAG_NAME -F RELEASE_NOTES.md

fi
