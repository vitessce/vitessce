#!/usr/bin/env bash
set -o errexit

start() { echo travis_fold':'start:$1; echo $1; }
end() { echo travis_fold':'end:$1; }
die() { set +v; echo "$*" 1>&2 ; sleep 1; exit 1; }
# Race condition truncates logs on Travis: "sleep" might help.
# https://github.com/travis-ci/travis-ci/issues/6018

export CI=true

PATH=$PATH:`npm bin`

start lint
eslint src
end lint

start jsdoc
NEW_DOCS=/tmp/jsdocs
OLD_DOCS=docs/jsdocs
documentation build src/index.js \
  --format html --sort-order alpha --output $NEW_DOCS
rm -rf $NEW_DOCS/assets/fonts
diff -r $OLD_DOCS $NEW_DOCS > /dev/null \
  || die "JSDocs not up-to-date: 'rm -rf $OLD_DOCS && cp -a $NEW_DOCS $OLD_DOCS'"
end jsdoc

start test
npm test
end test

start cypress
npm start & wait-on http://localhost:3000/
cypress run
echo 'NOTE: Server is still running.'
end cypress

start build
npm run build
end build
