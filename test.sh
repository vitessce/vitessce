#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }
# Race condition truncates logs on Travis: "sleep" might help.
# https://github.com/travis-ci/travis-ci/issues/6018

export CI=true

PATH=$PATH:`npm bin`

start changelog
if [ "$TRAVIS_BRANCH" != 'master' ]; then
  diff CHANGELOG.md <(curl https://raw.githubusercontent.com/hubmapconsortium/vitessce/master/CHANGELOG.md) \
    && die 'Update CHANGELOG.md'
fi
end changelog

start lint
eslint src
end lint

start test
npm test
end test

start cypress
npm start & wait-on http://localhost:3000/
cypress run
echo 'NOTE: Server is still running.'
end cypress

start schema
./src/schemas/schema-schema.sh
end schema

BUILD_FILES=(
  es/production/index.min.js
  es/production/static/css/index.css
  es/development/index.js
  es/development/static/css/index.css
  umd/production/index.min.js
  umd/production/static/css/index.css
  umd/development/index.js
  umd/development/static/css/index.css
)

start build
npm run build
for F in ${BUILD_FILES[*]}; do
  [ -e build-lib/$F ] || die "$F is missing from build"
done
end build
