REMOTE_VERSION=`npm view vitessce --json | jq .version`
LOCAL_VERSION=`cat ./package.json | jq .version`

# Reference: https://stackoverflow.com/a/37939589
# Reference: https://stackoverflow.com/a/26314887
function version { echo "$@" | tr -d '"' | awk -F. '{ printf("%d%03d%03d%03d\n", $1,$2,$3,$4); }'; }

if [ $(version $LOCAL_VERSION) -gt $(version $REMOTE_VERSION) ]; then
  echo "needs-deploy=true" >> $GITHUB_OUTPUT
else
  echo "needs-deploy=false" >> $GITHUB_OUTPUT
fi

