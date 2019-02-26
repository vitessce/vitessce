#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }
# Race condition truncates logs on Travis: "sleep" might help.
# https://github.com/travis-ci/travis-ci/issues/6018

export CI=true

start lint
node_modules/eslint/bin/eslint.js src
end lint

start jsdoc
# TODO: Make this part of the real build process,
# and host jsdocs at unpkg, or something like that.
NEW_DOCS=/tmp/jsdocs
OLD_DOCS=docs/jsdocs
node_modules/documentation/bin/documentation.js \
  build src/index.js \
  --format html --sort-order alpha --output $NEW_DOCS
rm -rf $NEW_DOCS/assets/fonts
diff -r $OLD_DOCS $NEW_DOCS > /dev/null \
  || die "JSDocs not up-to-date: 'rm -rf $OLD_DOCS && cp -a $NEW_DOCS $OLD_DOCS'"
end jsdoc

start test
npm test
end test

start build
npm run build
end build
