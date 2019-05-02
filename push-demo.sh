#!/usr/bin/env bash
set -o errexit
set -o pipefail

BRANCH=`git rev-parse --abbrev-ref HEAD`
HASH=`git rev-parse --short HEAD`
URL_PATH="vitessce-data/demos/$BRANCH/$HASH"

# Build demo ...
npm run build
# and docs ...
DOCZ_DEST='demo/dist/docs' DOCZ_BASE="/$URL_PATH/docs/" npm run docz:build
# and push to S3.
TARGET_URL="https://s3.amazonaws.com/$URL_PATH/docs/index.html"
aws s3 cp --recursive demo/dist s3://$URL_PATH
open "$TARGET_URL"

# Update the list of demos:
DATE_TIME=`date "+%Y-%m-%d %H:%M:%S"`
echo "- $DATE_TIME: [`$BRANCH/$HASH`]($TARGET_URL)" >> demos.md

# Update github pages to point to latest:
echo '
<html>
<head><meta http-equiv="refresh" content="2; url='"$TARGET_URL"'"></head>
<body>
Redirecting to latest version.
</body>
</html>
' > docs/index.html
