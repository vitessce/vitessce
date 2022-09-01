FULL_VERSION=`node --version`
MAJOR_VERSION_WITH_V=${FULL_VERSION%.*.*}
MAJOR_VERSION=${MAJOR_VERSION_WITH_V:1}

V_OPTIONS="--max_old_space_size=8192"
if [ "$MAJOR_VERSION" -gt "17" ]; then
  echo "Set node options for >=17"
  V_OPTIONS="--max_old_space_size=8192 --openssl-legacy-provider"
fi

if [[ "$1" == "--action" ]]; then
  echo "::set-output name=node-options::$V_OPTIONS"
else
  unset NODE_OPTIONS
  export NODE_OPTIONS=$V_OPTIONS
fi