<a href="http://vitessce.io">
    <img src="./img/logo-transparent.png" alt="Vitessce logo" title="Vitessce" />
</a>

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest demos and documentation](http://vitessce.io/)
- [Sandbox environment](http://vitessce.io/#?edit=true)
- [Older demos](DEMOS.md)
- [Older releases on NPM](https://www.npmjs.com/package/vitessce?activeTab=versions)

<table><tr>
<td>    
<img src="https://user-images.githubusercontent.com/1216518/93336741-2b60c880-f7f6-11ea-8b82-7e1e0ea45e43.png" width="500" alt="Screenshot of Vitessce with Linnarsson data" />
</td>
<td>
<img src="https://user-images.githubusercontent.com/1216518/93337080-a4f8b680-f7f6-11ea-9e53-2c73cc661b94.png" width="500" alt="Same data, zoomed in to cellular scale" />
</td>
</tr></table>

## Why Vitessce

### Interactive

Vitessce consists of reusable interactive views including a scatterplot, spatial+imaging plot, genome browser tracks, statistical plots, and control views, built on web technologies such as WebGL.

### Integrative

Vitessce enables visual analysis of multi-modal assay types which probe biological systems through techniques such as microscopy, genomics, and transcriptomics.

### Serverless

Visualize large datasets stored in static cloud object stores such as AWS S3. No need to manage or pay for expensive compute infrastructure for visualization purposes.

## Usage

Vitessce can be used in React projects by installing the package from NPM:

```sh
npm install vitessce
```

For more details, please visit the [documentation](http://vitessce.io/docs/js-overview/).

## How to Contribute

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.


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
pnpm run start-demo
```

The development server will refresh the browser as you edit the code.

To get started creating a new view:

```sh
pnpm run create-view line-plot
```

Further details for internal developers can be found within [dev-docs](./dev-docs/).

### Changesets

We use [changesets](https://github.com/changesets/changesets) to manage the changelog.
Therefore, when making code changes, do not edit `CHANGELOG.md` directly.
Instead, run `pnpm changeset`, follow the prompts, and commit the resulting markdown files along with the code changes.

### Branches

Please use one of the following naming conventions for new branches:
- `{github-username}/{feature-name}`
- `{github-username}/fix-{issue-num}`

### Pull requests

We use squash merging for pull requests.

### Monorepo organization

See `pnpm-workspace.yaml` for more information.
We are using PNPM [catalogs](https://pnpm.io/catalogs) which are available from v9.5.0 of PNPM.

### Testing

For the end-to-end tests, they depend on 
```sh
cd sites/demo && pnpm run build-demo
```

- To run all the tests, both unit and e2e: `./scripts/test.sh`
- To run just the unit tests: `pnpm run test`

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

## Deployment

Before running any of the deployment scripts, confirm that you have installed the AWS CLI and are in the appropriate AWS account:
```
$ aws iam list-account-aliases --query 'AccountAliases[0]'
"hdv-vitessce"
```

### Staging

To build the current branch and push the "minimal" demo and docs sites to S3, run this script:
```sh
./scripts/push-demos.sh
```

This will build the demo and docs, push both to S3, and finally open the docs deployment in your browser.

#### Publish staged development site

After doing a [manual test](TESTING.md) of the deployment of the dev site,
if it looks good, copy it to dev.vitessce.io:

```sh
./scripts/copy-dev.sh https://{url returned by scripts/deploy-release.sh or scripts/push-demos.sh}
```

Note: if you need to obtain this URL later:

```
Copy dev to https://legacy.vitessce.io/demos/$DATE/$HASH/index.html
```

#### Publish staged docs to vitessce.io

After doing a manual test of the deployment of the docs,
if it looks good, copy it to vitessce.io:

```sh
./scripts/copy-docs.sh https://{url returned by scripts/deploy-release.sh or scripts/push-demos.sh}
```

Note: if you need to obtain this URL later:

```
Copy docs to https://data-1.vitessce.io/docs-root/$DATE/$HASH/index.html
```

## Release

Releasing refers to publishing all sub-packages to NPM and creating a corresponding GitHub release.

Note: releasing does not currently result in automatic deployment of the documentation or development sites (see the [Deployment](#deployment) section above).

### From GitHub Actions

When there are changesets on the `main` branch, the [`changesets/action`](https://github.com/changesets/action) bot will run `./scripts/changeset-version.sh --action` and make a pull request titled "Create release".

- This pull request remains open until ready to make a release. The bot will update the pull request as new changesets are added to `main`.

Once this "Create release" pull request is merged, the next time `release.yml` is executed on GitHub Actions, the following will occur:
- [`changesets/action`](https://github.com/changesets/action) will run `./scripts/changeset-publish.sh --action`, which:
  - publishes to NPM
  - creates a new git tag for the release
- [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release) will generate a GitHub release based on the git tag, using the latest changelog entries for the release notes.

### From local machine

```sh
pnpm run build
pnpm run bundle
pnpm run build-json-schema

./scripts/changeset-version.sh
./scripts/changeset-publish.sh # runs pnpm publish internally
```

## Version bumps

In this project we try to follow semantic versioning.
The following are examples of things that would require a major, minor, or patch type of bump.

### Patch version bumps

Bug fixes, minor feature improvements, additional view types, additional coordination types, and additional file type implementations are possible in a patch version bump.

When a coordination type is added, it must be reflected by a new view config JSON schema with an incremented `version` property, and a new view config upgrade function to enable previous view config versions to remain compatible.
The default schema version parameter of the `VitessceConfig` constructor may also change to reflect the new schema version.

### Minor version bumps

An exported helper function or React component for plugin views had a change in props or function signature.
Major feature improvements or additions.

### Major version bumps

The exported constant values changed, such as view types and coordination types, such that previous code using these values may no longer run successfully.
React props of the main `<Vitessce />` component changed.
Major behavior changes or interface updates.
Changes to the directory structure or filenames in the `dist/` directory that could result in broken import statements.


## Related repositories

- [Viv](https://github.com/hms-dbmi/viv): A library for multiscale visualization of high-resolution multiplexed tissue data on the web.
- [HiGlass](https://github.com/higlass/higlass): A library for multiscale visualization of genomic data on the web.
- [vitessce-python](https://github.com/vitessce/vitessce-python): Python API and Jupyter widget.
- [vitessce-r](https://github.com/vitessce/vitessce-r): R API and R htmlwidget.
- [vitessce-data](https://github.com/hms-dbmi/vitessce-data): Scripts to generate sample data

## Old presentations

- [May 2022: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1qfd0rc6bF9nFIvOMp2YacpbJ7F8_UYhSYjLn26AlH7k/edit?usp=sharing)
- [February 2022: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1J4lcWxD1GRGLBm0RLkGmEGcuQvXX9yBVBsQo2rXPTVM/edit?usp=sharing)
- [October 2021: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1bibMLiR5aW_MgXn6ydhXWJsEN3tG5gJSw9xuYa49x5U/edit?usp=sharing)
- [September 2021: HuBMAP Consortium Sci-Tech Webinar (Mark)](https://docs.google.com/presentation/d/1iPXSGEGT9HNNSrXT5uu0x_9Jq6L3cnhrpaz1Pge5O50/edit?usp=sharing)
- [June 2021: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1P--F_MLeWK2n3JrY21mGn9FBgI2u60nQGN_XZtniSnc/edit?usp=sharing)
- [April 2021: Spatial Biology Europe (Mark)](https://docs.google.com/presentation/d/1s33dKMCdE3LtC43IWBw48ZDmmtYJarDPtUOhH9T3D6Q/edit?usp=sharing)
- [January 2021: Ilan Gold's lab meeting update](https://docs.google.com/presentation/d/10kmjLxQh5ji-4TVMq06KRpXek3uje_fQpTXBqjFj0p4/edit?usp=sharing)
- [December 2020: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1rG0s5eH_NrFSk3_7lpmc9dsaUPFvnakYD59ff9D-G1M/edit?usp=sharing)
- [November 2020: Ilan Gold's lab meeting update](https://docs.google.com/presentation/d/1egAwCR8UwdRCWiGYVRelebwNDH9boBX1nJIX5auvf1w/edit?usp=sharing)
- [October 2020: Mark Keller's lab meeting update](https://docs.google.com/presentation/d/1M8dGbIGA_cfa3uZnGLnk3iMzMNVbxzza33OKBqwwlNQ/edit?usp=sharing)
- [July 2020: Ilan Gold's lab meeting update](https://docs.google.com/presentation/d/1QzKYP6sXPefBMNfY4PW4H0AMoWVbw9HeNoweLmJg17Y/edit?usp=sharing)
- [June 2020: NLM Informatics Training Conference (Trevor)](https://docs.google.com/presentation/d/1eYslI4y1LbnEGwj4XHXxqYcRKpYgqc9Y2mZTd5iCzMc/edit?usp=sharing)
- [May 2020: Trevor Manz's overview of multimodal imaging in Vitessce](https://docs.google.com/presentation/d/1NPYZPduymN7wzgN-NYRQwd15D-nUZYILJTgBR2oNb04/edit?usp=sharing)
- [January 2020: Ilan Gold's overview of IF Imagery](https://docs.google.com/presentation/d/1BSz2JefN2WSF_RwVpOrIhYD2V8D7ZLc5b21VTy2Xmlo/edit#slide=id.p)
- [January 2020: Trevor Manz's wrap-up on Arrow, Zarr, and IMS](https://docs.google.com/presentation/d/1H2hff-bW4SZ3KFD5_q0iN-Dv1yew7pVe0MbdMsA2gko/edit)
- [September 2019: HuBMAP Poster](https://drive.google.com/open?id=1pRiTN99-wZ6QuEMWzorcD4fA2Fi-7eW4)
- [August 2019: SIBMI Presentations](https://docs.google.com/presentation/d/1IRWDofdvKS3qbLY-s0a1EUijha3m-JopMYgmETOIHq0/edit?usp=sharing)
- [July 2019: Intern progress reports and HuBMAP collaboration](https://docs.google.com/presentation/d/10zanc_cHh-OcFvBeuJdKBpLnazjVh64pbbdD4kJQ7GY/edit?usp=sharing)
- [May 2019: Harvard IT Summit](https://docs.google.com/presentation/d/1eYDMedzhQtcClB2cIBo17hlaSSAu_-vzkG4LY_mGGQ8/edit#slide=id.p)
- [May 2019: Misc. tools](https://docs.google.com/presentation/d/1TaC68-r6bosnwi05BZ5bNh9tzeXsxyqmBo1gFZDxhGM/edit#slide=id.p)
- [April 2019: Software engineering](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY/edit#slide=id.p)

## Citation

To cite Vitessce in your work, please use:

```bibtex
@article{keller2024vitessce,
  title = {{Vitessce: integrative visualization of multimodal and spatially resolved single-cell data}},
  author = {Keller, Mark S. and Gold, Ilan and McCallum, Chuck and Manz, Trevor and Kharchenko, Peter V. and Gehlenborg, Nils},
  journal = {Nature Methods},
  year = {2024},
  month = sep,
  doi = {10.1038/s41592-024-02436-x}
}
```

If you use the image rendering functionality, please additionally cite Viv:

```bibtex
@article{manz2022viv,
  title = {{Viv: multiscale visualization of high-resolution multiplexed bioimaging data on the web}},
  author = {Manz, Trevor and Gold, Ilan and Patterson, Nathan Heath and McCallum, Chuck and Keller, Mark S. and Herr, II, Bruce W. and Börner, Kay and Spraggins, Jeffrey M. and Gehlenborg, Nils},
  journal = {Nature Methods},
  year = {2022},
  month = may,
  doi = {10.1038/s41592-022-01482-7}
}
```
