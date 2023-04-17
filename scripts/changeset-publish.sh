#!/usr/bin/env bash
set -o errexit
set -o pipefail

pnpm publish --filter='./packages/**' --no-git-checks --access public
git tag v$(cat ./package.json | jq -r .version)
git push --follow-tags
node .changeset/get-release-notes.mjs

if [[ "$1" == "--action" ]]; then
  echo \"should-release=true\" >> $GITHUB_OUTPUT
fi
