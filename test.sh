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
diff CHANGELOG.md <(curl https://raw.githubusercontent.com/hubmapconsortium/vitessce/master/CHANGELOG.md) \
  && die 'Update CHANGELOG.md'
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

start build
npm run build
for F in vitessce.js vitessce.min.js main.css; do
  [ -e umd/$F ] || die "$F is missing from UMD build"
done
end build
