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
cd -

# Pack all sub-packages
pnpm -r exec pnpm pack --pack-destination $(pwd)/consumer/


# Install packed tgz
cd consumer
npm install react react-dom
npm install --save-dev vite@3.0.0
npm install $(ls ./vitessce-*.tgz)
# Run vite to bundle the consumer HTML/JS.
npm exec vite build

echo "Done vite build. Starting NextJS build."

# Delete existing packed packages
# and start from a fresh directory.
cd ../consumer-nextjs
rm -f package.json
rm -f package-lock.json
rm -rf node_modules/
# Set up new package.json in the directory
npm init -y

# Install packed tgz
npm install react react-dom
npm install next@13
# Assumes ./consumer-install.sh has been run already.
npm install $(ls ../consumer/vitessce-*.tgz)
# Run build and export to bundle the HTML/JS as a static site.
npm exec next build
npm exec next export