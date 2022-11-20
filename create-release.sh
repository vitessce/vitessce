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

if ! command -v aws &> /dev/null
then
    die "Requires the AWS CLI (aws)."
fi

AWS_ACCT=$(aws iam list-account-aliases --query 'AccountAliases[0]')
# Need to check for substring.
# Some AWS CLI implementations print gehlenborglab while others print "gehlenborglab"
if [[ "$AWS_ACCT" != *"gehlenborglab"* ]]; then
    die "Deployment requires authentication with the lab account in the AWS CLI (aws)."
fi

BRANCH=`git rev-parse --abbrev-ref HEAD`
if [[ "$BRANCH" != "main" ]]; then
    read -p "You are not on the main branch. Are you sure you want to make a release from this branch? [y/n]" -n 1 -r
    echo # move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "Continuing the release"
    else
        exit
    fi
fi

DATE=`date "+%Y-%m-%d"`

# Bump the version.
NEXT_VERSION_WITH_V=$( npm version "$1" --no-git-tag-version )
NEXT_VERSION=${NEXT_VERSION_WITH_V:1}

# Check whether the version is the only change for the meta-updater to perform in every subpackage.
# Error if there are additional changes.
pnpm run meta-version-only
# The above command would have exited with a non-zero code if it found non-version changes.
# If we reach this point we can proceed with the meta-updater, which will update the version field of the package.json in all sub-packages to match the root package.json. 
pnpm run meta-update

# Make a new branch for the release.
git checkout -b "release-$NEXT_VERSION_WITH_V"

# Update CHANGELOG
printf '%s\n%s\n' "
### Added

### Changed

## [$NEXT_VERSION](https://www.npmjs.com/package/vitessce/v/$NEXT_VERSION) - $DATE

" "$(cat CHANGELOG.md)" > CHANGELOG.md

git add CHANGELOG.md pnpm-lock.yaml package.json **/package.json
git commit -m "Release for $NEXT_VERSION_WITH_V. Commit by create-release.sh"

# Push dev and docs site.
bash ./push-demos.sh

git add version.json DEMOS.md DOCS.md
git commit -m "Demo for $NEXT_VERSION_WITH_V. Commit by create-release.sh"

# Make a pull request.
gh pr create --draft --base main --title "Release $NEXT_VERSION_WITH_V"
