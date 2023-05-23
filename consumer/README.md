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