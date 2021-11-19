#!/usr/bin/env bash
set -o errexit
set -o pipefail

die() { set +v; echo "$*" 1>&2 ; exit 1; }

git diff --quiet || die 'Uncommitted changes: Stash or commit before pushing.'

(( $# == 1 )) || die "Requires one argument, the NPM version type (major | minor | patch); Instead got $#."

if ! command -v gh &> /dev/null
then
    die "Requires the GitHub CLI (gh)."
fi

BRANCH=`git rev-parse --abbrev-ref HEAD`

if [[ "$BRANCH" != "master" ]]; then
    read -p "You are not on the master branch. Are you sure you want to make a release from this branch? [y/n]" -n 1 -r
    echo # move to a new line
    if ! [[ $REPLY =~ ^[Yy]$ ]]
    then
        exit
    fi
fi

DATE=`date "+%Y-%m-%d"`

# Bump the version.
NEXT_VERSION_WITH_V=$( npm version "$1" )
NEXT_VERSION=${NEXT_VERSION_WITH_V:1}

# Update CHANGELOG
printf '%s\n%s\n' "
### Added

### Changed

## [$NEXT_VERSION](https://www.npmjs.com/package/vitessce/v/$NEXT_VERSION) - $DATE

" "$(cat CHANGELOG.md)" > CHANGELOG.md

# Make a new branch for the release.
git checkout -b "release-$NEXT_VERSION_WITH_V"
git add CHANGELOG.md package.json package-lock.json
git commit -m "Release for $NEXT_VERSION_WITH_V. Commit by create-release.sh"

# Push dev and docs site.
bash ./push-demos.sh

git add src/version.json DEMOS.md DOCS.md
git commit -m "Demo for $NEXT_VERSION_WITH_V. Commit by create-release.sh"

# Make a pull request.
#gh pr create --draft --base master --title "Release $NEXT_VERSION_WITH_V"
