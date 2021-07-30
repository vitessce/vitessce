#!/usr/bin/env bash
set -o errexit

die() { set +v; echo "$*" 1>&2 ; exit 1; }

# This is a totally ad-hoc script to ensure some consistency in our schemas.
# We want to be sure that each "properties" also specifies "additionalProperties" and "required".

FAILURES=$(
  SCHEMA_DIR=`dirname $0`
  for SCHEMA in $SCHEMA_DIR/*.schema.json; do
    export SCHEMA
    grep -B2 '"properties"' $SCHEMA \
      | perl -pne 's/\n//; s/\s+/ /g; s/--/\n/;' \
      | perl -ne 'next unless /properties/; print "$ENV{SCHEMA}: $_" unless /"additionalProperties".*"(required|oneOf|allOf|anyOf)".*"properties"/;'
  done
)

if [[ $FAILURES ]]; then
  die "Check that 'additionalProperties' & 'required' & 'properties' are provided:
$FAILURES"
fi
