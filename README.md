
## Development

First install [PNPM](https://pnpm.io/installation) v9.5. We develop and test against NodeJS `v18.6.0` and NPM `8.13.2`.

> **Note**
> NodeJS may require the [`max_old_space_size`](https://stackoverflow.com/a/59572966) value to be increased.
  ```sh
  . ./scripts/set-node-options.sh
  ```

Checkout the project, `cd`, and then:

```sh
pnpm install
pnpm run build
pnpm run start-docs
```

The development server will refresh the browser as you edit the code.

<!-- ### Changesets

We use [changesets](https://github.com/changesets/changesets) to manage the changelog.
Therefore, when making code changes, do not edit `CHANGELOG.md` directly.
Instead, run `pnpm changeset`, follow the prompts, and commit the resulting markdown files along with the code changes. -->

### Branches

Please use one of the following naming conventions for new branches:
- `{github-username}/{feature-name}`
- `{github-username}/fix-{issue-num}`

### Pull requests

We use squash merging for pull requests.

### Monorepo organization

See `pnpm-workspace.yaml` for more information.
We are using PNPM [catalogs](https://pnpm.io/catalogs) which are available from v9.5.0 of PNPM.

<!-- ### Testing

For the end-to-end tests, they depend on 
```sh
cd sites/demo && pnpm run build-demo
```

- To run all the tests, both unit and e2e: `./scripts/test.sh`
- To run just the unit tests: `pnpm run test` -->

### Linting

```sh
pnpm run lint
```

To allow the linter to perform automated fixes during linting: `pnpm run lint-fix`

### Troubleshooting

The following commands can be helpful in case the local environment gets into a broken state:

- `pnpm install`
- `pnpm run clean`: removes build/bundle directories and all `tsconfig.tsbuildinfo` files (used by TypeScript's Project References). 
  - `pnpm run build`: need to re-build subpackages after this type of cleanup.
- `pnpm run clean-deps`: removes all `node_modules` directories, including those nested inside subpackages.
  - `pnpm install`: need to re-install dependencies after this type of cleanup.


### Notes:
Vitessce Dependencies:
'@vitessce/example-configs';
'@vitessce/config';
'@vitessce/schemas';
 