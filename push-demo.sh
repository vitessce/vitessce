#!/usr/bin/env bash
set -o errexit
set -o pipefail

BRANCH=`git rev-parse --abbrev-ref HEAD`
DATE=`date "+%Y-%m-%d"`
HASH=`git rev-parse --short HEAD`
URL_PATH="vitessce-data/demos/$DATE/$HASH"

# Build demo ...
npm run build
# and docs ...
DOCZ_DEST='demo/dist/docs' DOCZ_BASE="/$URL_PATH/docs/" npm run docz:build
# and push to S3.
TARGET_URL="https://s3.amazonaws.com/$URL_PATH/docs/index.html"
aws s3 cp --recursive demo/dist s3://$URL_PATH

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
