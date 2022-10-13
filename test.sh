#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }
# Race condition truncates logs on Travis: "sleep" might help.
# https://github.com/travis-ci/travis-ci/issues/6018

PATH=$PATH:`npm bin`

start changelog
if [ "$GITHUB_REF" != 'refs/heads/main' ]; then
  diff CHANGELOG.md <(curl https://raw.githubusercontent.com/vitessce/vitessce/main/CHANGELOG.md) \
    && die 'Update CHANGELOG.md'
fi
end changelog

start lint
eslint src || die 'eslint failed; try: npm run lint-fix'
end lint

start test
pnpm run test
end test

start cypress
# Cypress fails randomly on GH Actions so we only run this locally.
if [ "$CI" != 'true' ]; then
  cd sites/demo
  pnpm start & wait-on http://localhost:3000/
  pnpm run cypress:run
  echo 'NOTE: Server is still running.'
fi
end cypress

start schema
./packages/vit-s/src/schemas/schema-schema.sh
end schema

if [[ "$1" == "--deploy-action" ]]; then
  echo "Not running npm run build:prod because it will be run as part of prepublishOnly"
else
  start build
  pnpm run build
  end build
fi

