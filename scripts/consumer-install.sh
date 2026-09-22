#!/usr/bin/env bash
# Purpose: install subpackages in a directory to simulate
# a consumer package installing them from NPM.
# Also runs vite build to generate a website bundle
# which can be served and tested via a Cypress end-to-end test
# in sites/html.
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

# Install the same exact react version the monorepo builds against (the
# pinned catalog: value in pnpm-workspace.yaml). A range here would resolve to
# whatever react is newest at install time, which breaks as soon as a peer
# caps it: @react-three/fiber 9.7.0 requires react ">=19 <19.3", so an
# unpinned ^19.0.0 started resolving react 19.3.0 and failing with ERESOLVE.
REACT_VERSION="$(node -p "require('react/package.json').version")"
[ -n "${REACT_VERSION}" ] || die "Could not determine the monorepo react version; run pnpm install first."

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
# Set type: module so the ESM source files (pages, components, next.config.js)
# match the package's module format (Next.js 15.5+/16 reject the mismatch that
# `npm init -y`'s default "type": "commonjs" would otherwise cause).
contents="$(jq '.private = true | .type = "module"' package.json)" && echo -E "${contents}" > package.json

cd -

# Pack all sub-packages
pnpm -r exec pnpm pack --pack-destination $(pwd)/consumer/


# Install packed tgz
cd consumer
npm install --save-exact react@"${REACT_VERSION}" react-dom@"${REACT_VERSION}"
# Install @react-three peer deps for 3D views (fiber v9 + drei v10 + xr v6 for React 19)
npm install @react-three/fiber@^9.0.0 @react-three/drei@^10.0.0 @react-three/xr@^6.0.0 three@">=0.162.0"
npm install --save-dev vite@7
npm install $(ls ./vitessce-*.tgz)
# Run Vite build to bundle the consumer HTML/JS.
npm exec vite build


echo "Done vite build. Starting NextJS build."
npm install next@16
# Run NextJS build to bundle the consumer HTML/JS.
npm exec next build
