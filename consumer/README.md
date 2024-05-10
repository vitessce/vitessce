This directory is intended to be used during testing to simulate a downstream "consumer" environment which attempts to install published Vitessce packages.
In particular, the ESM bundles of sub-packages (rather than the main packages).
We simulate this by using `pnpm pack`.

To test:
```sh
# From root of repo
pnpm run build
pnpm run bundle
./scripts/consumer-install.sh
pnpm run start-html
```

### Vite consumer site

Related directories/files:
- `src/`
- `vite.config.js`

Open http://localhost:3003/consumer/dist/index.html

### NextJS consumer site

Related directories/files:
- `components/`
- `pages/`
- `next.config.js`

Open http://localhost:3003/consumer/out/index.html


## How to test in portal-ui

Instructions as of 5/26/2023 (commit hash [hubmapconsortium/portal-ui#fc8a881f](https://github.com/hubmapconsortium/portal-ui/commit/fc8a881ff6f793b4a0dbbeed60f2186fe9d880c4))

```sh
pnpm run build
pnpm run bundle
./scripts/consumer-install.sh

cd ../portal-ui
conda activate portal-ui # may need to be created the first time
nvm use `cat .nvmrc` # may need to nvm install `cat .nvmrc`
cd context
npm install

npm install $(ls ../../vitessce/consumer/vitessce-*.tgz)
cd ..
./etc/dev/dev-start.sh --no-npm-install # open http://localhost:5001
```
