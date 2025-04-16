#!/usr/bin/env bash
set -o errexit
set -o pipefail

BRANCH=`git rev-parse --abbrev-ref HEAD`
DATE=`date "+%Y-%m-%d"`
HASH=`git rev-parse --short HEAD`
PKG_VERSION=`npm pkg get version | tr -d '"'`

BUCKET="temp-vitessce-data"

DEMO_URL_PATH="demos/$DATE/$HASH"
ROOT_DOCS_URL_PATH="docs-root/$DATE/$HASH"
VERSIONED_DOCS_URL_PATH="docs/$DATE/$HASH"

die() { set +v; echo "$*" 1>&2 ; exit 1; }
git diff --quiet || die 'Uncommitted changes: Stash or commit before pushing.'

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
aws s3 cp --recursive $DEMO_DIST_DIR s3://$BUCKET/$DEMO_URL_PATH
DEMO_TARGET_URL="https://s3.amazonaws.com/$BUCKET/$DEMO_URL_PATH/index.html"

cd ../..
echo "- $DATE: [$BRANCH]($DEMO_TARGET_URL)" >> DEMOS.md

echo "Deployed dev site"


# Build docs site...
cd sites/docs

# We need to build the docs site twice:
# 1. With baseUrl: "/" which may be copied to vitessce.io (by running ./copy-prod.sh).
# 2. With baseUrl: "/vitessce-data/docs/2020-12-19/b416e16/" for the staging and versioned access.
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
# and push to S3.
aws s3 cp --recursive $ROOT_DIST_DIR s3://$BUCKET/$ROOT_DOCS_URL_PATH
aws s3 cp --recursive $VERSIONED_DIST_DIR s3://$BUCKET/$VERSIONED_DOCS_URL_PATH
VERSIONED_TARGET_URL="http://data-1.vitessce.io/$VERSIONED_DOCS_URL_PATH/"
COPY_TARGET_URL="https://s3.amazonaws.com/$BUCKET/$ROOT_DOCS_URL_PATH/index.html"

cd ../..
echo "- $DATE: [$BRANCH]($VERSIONED_TARGET_URL)" >> DOCS.md

echo "Deployed docs site"
echo "Copy dev to $DEMO_TARGET_URL"
echo "Copy docs to $COPY_TARGET_URL"
# Open in browser and see if it works:
open "$VERSIONED_TARGET_URL"
