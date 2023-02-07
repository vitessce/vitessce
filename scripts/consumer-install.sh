#!/usr/bin/env bash
# Purpose: install subpackages in a directory to simulate
# a consumer package installing them from NPM.
# Also runs vite build to generate a website bundle
# which can be served and tested via a Cypress end-to-end test
# in sites/html.
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

# Get the current version of the vit-s and description sub-packages,
# which should be the same as the root package version.
LOCAL_VERSION=`cat ./package.json | jq .version | tr -d '"'`

# Delete existing packed packages
# and start from a fresh directory.
cd consumer
rm -rf *.tgz
rm -f package.json
rm -f package-lock.json
rm -rf node_modules/
# Set up new package.json in the directory
npm init -y
cd -

# Pack @vitessce/vit-s
cd packages/vit-s
pnpm pack --pack-destination ../../consumer/
cd -

# Pack @vitessce/description
cd packages/view-types/description
pnpm pack --pack-destination ../../../consumer/
cd -

# Install packed tgz
cd consumer
npm install react react-dom
npm install --save-dev vite@3.0.0
npm install ./vitessce-vit-s-$LOCAL_VERSION.tgz
npm install ./vitessce-description-$LOCAL_VERSION.tgz
# Run vite to bundle the consumer HTML/JS.
npm exec vite build