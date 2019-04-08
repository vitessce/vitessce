#!/usr/bin/env bash
set -o errexit
set -o pipefail

# Build, and push the result to s3, under a unique URL

npm run build
BRANCH=`git rev-parse --abbrev-ref HEAD`
HASH=`git rev-parse --short HEAD`
PATH="vitessce-data/demos/$BRANCH/$HASH"
aws s3 cp --recursive demo/dist s3://$PATH
open https://s3.amazonaws.com/$PATH
