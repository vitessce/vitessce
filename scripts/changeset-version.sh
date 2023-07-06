#!/usr/bin/env bash
set -o errexit
set -o pipefail

node .changeset/pre-changelog.mjs

if [[ "$1" != "--action" ]]; then
  export GITHUB_TOKEN=$(gh auth token)
fi

pnpm exec changeset version
node .changeset/post-changelog.mjs
