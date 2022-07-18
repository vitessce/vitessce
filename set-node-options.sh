unset NODE_OPTIONS
FULL_VERSION=`node --version`
MAJOR_VERSION_WITH_V=${FULL_VERSION%.*.*}
MAJOR_VERSION=${MAJOR_VERSION_WITH_V:1}
if [ "$MAJOR_VERSION" -lt "17" ]; then
  echo "Set node options for <17"
  export NODE_OPTIONS="--max_old_space_size=4096"
else
  echo "Set node options for >=17"
  export NODE_OPTIONS="--max_old_space_size=4096 --openssl-legacy-provider"
fi