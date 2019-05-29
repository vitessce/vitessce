#!/usr/bin/env bash
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

(( $# == 1 )) || die "Requires one argument, the staging URL to be copied to vitessce.io; Instead got $#."
S3_BASE='//s3.amazonaws.com/'
S3_BUCKET='vitessce-data'
S3_PATH='/demos/'
RE="$S3_BASE$S3_BUCKET$S3_PATH"
[[ "$@" =~ "$RE" ]] || die "Expected URL to match $RE"
# The regexes here are flexible, so it should work
# whether you give it the app URL, or the doc URL
S3_SRC_PATH=$( echo "$@" | perl -pne 's{^.*'"$S3_BASE"'}{}; s{/index.html}{}; s{/docs}{}; s{/$}{}' )

S3_SRC="s3://$S3_SRC_PATH"
S3_TARGET='s3://vitessce.io'

read -p "Are you sure you want to copy $S3_SRC to $S3_TARGET? " -n 1 -r
echo # move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  aws s3 cp --quiet \
            --acl public-read \
            --recursive \
            $S3_SRC $S3_TARGET
  open http://vitessce.io
fi
