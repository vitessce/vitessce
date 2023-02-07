#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }

start changelog
if [[ "$1" == "--action" ]]; then
  if [ "$GITHUB_REF" != 'refs/heads/main' ]; then
    diff CHANGELOG.md <(curl https://raw.githubusercontent.com/vitessce/vitessce/main/CHANGELOG.md) \
      && die 'Update CHANGELOG.md'
  fi
fi
end changelog

start lint
pnpm run lint || die 'eslint failed; try: pnpm run lint-fix'
end lint

start test
pnpm run test
end test

start cypress
# Cypress fails randomly on GH Actions so we only run this locally.
if [[ "$1" != "--action" ]]; then
  cd sites/demo
  echo "Running cypress test. Assuming pnpm run build has been run in ./ and pnpm run build-demo has been run in ./sites/demo"
  pnpm run preview & wait-on http://localhost:3000/
  pnpm run cypress:run
  echo 'NOTE: Server is still running.'
fi
end cypress

start schema
./packages/vit-s/src/schemas/schema-schema.sh
end schema
