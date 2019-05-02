#!/usr/bin/env bash
set -o errexit
set -o pipefail

# Build demo and docs, and push the result to s3, under a unique URL

BRANCH=`git rev-parse --abbrev-ref HEAD`
HASH=`git rev-parse --short HEAD`
URL_PATH="vitessce-data/demos/$BRANCH/$HASH"

npm run build
DOCZ_DEST='demo/dist/docs' DOCZ_BASE="/$URL_PATH/docs/" npm run docz:build

mv demo/dist/{index,demo}.html
echo '
<html>
<head><title>Vitessce demo + docs</title></head>
<body>
  <p><a href="demo.html">Demo</a><p>
  <p><a href="docs/index">Docs</a><p>
  <p><code>branch: '"$BRANCH"'; hash: '"$HASH"'</code></p>
</body>
</html>
' > demo/dist/index.html

TARGET_URL="https://s3.amazonaws.com/$URL_PATH/docs/index"
DATE_TIME=`date "+%Y-%m-%d %H:%M:%S"`
echo "- $DATE_TIME: [`$BRANCH/$HASH`]($TARGET_URL)" >> docs/index.md

aws s3 cp --recursive demo/dist s3://$URL_PATH
open "$TARGET_URL"
