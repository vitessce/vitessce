#!/usr/bin/env bash
# Purpose: install subpackages in a directory to simulate
# a consumer package installing them from NPM.
# Also runs vite build to generate a website bundle
# which can be served and tested via a Cypress end-to-end test
# in sites/html.
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

# Delete existing packed packages
# and start from a fresh directory.
cd consumer
rm -rf *.tgz
rm -f package.json
rm -f package-lock.json
rm -rf node_modules/
# Set up new package.json in the directory
npm init -y
# Set private: true to prevent changesets from trying to publish this as a package.
# Reference: https://stackoverflow.com/a/61049639
contents="$(jq '.private = true' package.json)" && echo -E "${contents}" > package.json

cd -

# Pack all sub-packages
pnpm -r exec pnpm pack --pack-destination $(pwd)/consumer/


# Install packed tgz
cd consumer
npm install react@^18.0.0 react-dom@^18.0.0
npm install --save-dev vite@3.0.0
npm install $(ls ./vitessce-*.tgz)
# Run Vite build to bundle the consumer HTML/JS.
npm exec vite build


echo "Done vite build. Starting NextJS build."
npm install next@13
# Run NextJS build to bundle the consumer HTML/JS.
npm exec next build

# -----------------------------------
# React 19 consumer install test
# -----------------------------------
echo "Testing React 19 consumer install..."
cd -
cd consumer

# Clean and re-init for React 19 test
rm -f package.json
rm -f package-lock.json
rm -rf node_modules/
npm init -y
contents="$(jq '.private = true' package.json)" && echo -E "${contents}" > package.json

# Install with React 19
npm install react@^19.0.0 react-dom@^19.0.0
npm install --save-dev vite@7
npm install $(ls ./vitessce-*.tgz)
# Run Vite build to verify the bundle works with React 19.
# Output to a separate directory so as not to overwrite the React 18 dist/
# that the Cypress test depends on.
npm exec vite build -- --outDir dist-react19
echo "React 19 consumer install test passed."
