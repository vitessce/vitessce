#!/usr/bin/env bash
set -o errexit
set -o pipefail

DATE=`date "+%Y-%m-%d"`
HASH=`git rev-parse --short HEAD`

DEMO_URL_PATH="demos/$DATE/$HASH"
ROOT_DOCS_URL_PATH="docs-root/$DATE/$HASH"
VERSIONED_DOCS_URL_PATH="docs/$DATE/$HASH"

# Build library...
pnpm run build

# Build demo...
cd sites/demo
pnpm run build-demo

# Finalize demo...
DEMO_DIST_DIR='dist/'
# and add an error page for dev.vitessce.io
cp error.html $DEMO_DIST_DIR
# and add a robots.txt since we do not want to publicize dev.vitessce.io
echo 'User-agent: *
Disallow: /' > $DEMO_DIST_DIR/robots.txt

# and push to S3.
DEMO_TARGET_URL="https://s3.amazonaws.com/$BUCKET/$DEMO_URL_PATH/index.html"

cd ../..

# Build docs site...
cd sites/docs

# We need to build the docs site twice:
# 1. With baseUrl: "/" which may be copied to vitessce.io.
# 2. With baseUrl: "/docs/2020-12-19/b416e16/" for the versioned access via legacy.vitessce.io.
export VITESSCE_DOCS_BASE_URL="/"
pnpm run build-root
export VITESSCE_DOCS_BASE_URL="/$VERSIONED_DOCS_URL_PATH/"
pnpm run build-versioned
# Un-set the base url exported variable.
unset VITESSCE_DOCS_BASE_URL

# The following lines are relative to docs/ directory.
ROOT_DIST_DIR='dist-root/'
VERSIONED_DIST_DIR='dist-versioned/'

# and add an error page for vitessce.io...
cp ../demo/error.html $ROOT_DIST_DIR
cp ../demo/error.html $VERSIONED_DIST_DIR
