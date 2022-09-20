REMOTE_VERSION=`npm view vitessce --json | jq .version`
LOCAL_VERSION=`cat ./package.json | jq .version`

function version { echo "$@" | awk -F. '{ printf("%d%03d%03d%03d\n", $1,$2,$3,$4); }'; }

if [ $(version $LOCAL_VERSION) -gt $(version $REMOTE_VERSION) ]; then
  echo "::set-output name=needs-deploy::true"
else
  echo "::set-output name=needs-deploy::false"
fi

