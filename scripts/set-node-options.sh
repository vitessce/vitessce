# When running pnpm run build-lib in packages/main/dev and packages/main/prod
# with sourcemap: true, GitHub actions runs out of memory during the build.
# Reference: https://github.com/vitejs/vite/issues/2433
V_OPTIONS="--max_old_space_size=4096"

if [[ "$1" == "--action" ]]; then
  echo "node-options=$V_OPTIONS" >> $GITHUB_OUTPUT
else
  unset NODE_OPTIONS
  export NODE_OPTIONS=$V_OPTIONS
fi