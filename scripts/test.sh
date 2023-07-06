#!/usr/bin/env bash
set -o errexit

# linting
pnpm run lint || die 'eslint failed; try: pnpm run lint-fix'
# end linting

# unit tests
pnpm run test
# end unit tests

# end-to-end tests with Cypress
# Cypress fails randomly on GH Actions so we only run this locally.
if [[ "$1" != "--action" ]]; then
  cd sites/demo
  echo "Running cypress test. Assuming pnpm run build has been run in ./ and pnpm run build-demo has been run in ./sites/demo"
  pnpm run preview & wait-on http://localhost:3000/
  pnpm run cypress:run
  echo 'NOTE: Server is still running.'
fi
# end end-to-end tests

# tsconfig checks
# Check that the root tsconfig.json file
# references all subdirectories that contain tsconfig.json files,
# since we are using TypeScript project references.
node scripts/check-tsconfig-references.mjs
# end tsconfig checks

# Check that there are no duplicate keys in the objects
# returned in the parameter to MUI makeStyles.
pnpm run check-makestyles-keys
