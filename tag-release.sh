LOCAL_VERSION=`cat ./package.json | jq .version`

# Reference: https://stackoverflow.com/a/37939589
# Reference: https://stackoverflow.com/a/26314887
function version { echo "v$@" | tr -d '"'; }

TAG_NAME=`version $LOCAL_VERSION`

git tag $TAG_NAME

echo "::set-output name=tag-name::$TAG_NAME"
