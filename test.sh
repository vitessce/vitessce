#!/usr/bin/env bash
set -o errexit

# changelog check
if [[ "$1" == "--action" ]]; then
  if [ "$GITHUB_REF" != 'refs/heads/main' ]; then
    diff CHANGELOG.md <(curl https://raw.githubusercontent.com/vitessce/vitessce/main/CHANGELOG.md) \
      && die 'Update CHANGELOG.md'
  fi
fi
# end changelog check

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

# schema checks
./packages/vit-s/src/schemas/schema-schema.sh
# end schema checks

# tsconfig checks
node scripts/check-tsconfig-references.mjs
# end tsconfig checks
