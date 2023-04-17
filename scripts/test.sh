#!/usr/bin/env bash
set -o errexit


pnpm run lint || die 'eslint failed; try: pnpm run lint-fix'

pnpm run test

# Cypress fails randomly on GH Actions so we only run this locally.
if [[ "$1" != "--action" ]]; then
  cd sites/demo
  echo "Running cypress test. Assuming pnpm run build has been run in ./ and pnpm run build-demo has been run in ./sites/demo"
  pnpm run preview & wait-on http://localhost:3000/
  pnpm run cypress:run
  echo 'NOTE: Server is still running.'
fi

./packages/vit-s/src/schemas/schema-schema.sh

node scripts/check-tsconfig-references.mjs
