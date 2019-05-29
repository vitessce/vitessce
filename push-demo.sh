#!/usr/bin/env bash
set -o errexit
set -o pipefail

BRANCH=`git rev-parse --abbrev-ref HEAD`
DATE=`date "+%Y-%m-%d"`
HASH=`git rev-parse --short HEAD`
DEMO_URL_PATH="vitessce-data/demos/$DATE/$HASH"

die() { set +v; echo "$*" 1>&2 ; exit 1; }
git diff --quiet || die 'Uncommitted changes: Stash or commit before pushing demo.'

# Build demo ...
npm run build
# and docs ...
# (Because the DOCZ_BASE is baked in, we need to do this twice,
# once with the long staging path, and once with the short production path.
# I am open to alternative proposals!)
DIST_DIR='demo/dist/'
STAGING_DIR='staging-docs'
DOCZ_DEST="$DIST_DIR$STAGING_DIR" DOCZ_BASE="/$DEMO_URL_PATH/$STAGING_DIR/" npm run docz:build
PROD_DIR='prod-docs'
DOCZ_DEST="$DIST_DIR$PROD_DIR" DOCZ_BASE="/$PROD_DIR/" npm run docz:build
# and add an error page for vitessce.io...
cp error.html $DIST_DIR
# and push to S3.
aws s3 cp --recursive $DIST_DIR s3://$DEMO_URL_PATH
TARGET_URL="https://s3.amazonaws.com/$DEMO_URL_PATH/$STAGING_DIR/index.html"

echo "- $DATE: [$BRANCH]($TARGET_URL)" >> demos.md

echo '
<html>
<head><meta http-equiv="refresh" content="2; url='"$TARGET_URL"'"></head>
<body>
Redirecting to latest version.
</body>
</html>
' > docs/dev.html

# Open in browser and see if it works:
open "$TARGET_URL"
