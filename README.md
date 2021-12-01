<a href="http://vitessce.io">
    <img src="./img/logo-transparent.png" alt="Vitessce logo" title="Vitessce" />
</a>

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest release demo](http://vitessce.io/)
- [Previous demos](DEMOS.md)
- [Previous releases on NPM](https://www.npmjs.com/package/vitessce?activeTab=versions)

![Screenshot of Vitessce with Linnarsson data](https://user-images.githubusercontent.com/1216518/93336741-2b60c880-f7f6-11ea-8b82-7e1e0ea45e43.png)

![Same data, zoomed in to cellular scale](https://user-images.githubusercontent.com/1216518/93337080-a4f8b680-f7f6-11ea-9e53-2c73cc661b94.png)


You can also use the demo website for visualizing your own data via view configs passed in as url parameters.  If you are storing a `json` view configuration on a remote server, the url will look something like `http://vitessce.io/?url=https://example.com/my_config.json`.  Otherwise, if you have a view configuration that is not stored somewhere that can be accessed via a web server, you can do something like `http://vitessce.io/?url=data:,{"name":"FAKE", "version": "0.1.0", "description":"fake dataset", "layers":[], "staticLayout":[{"component":"description", "props":{"description": "Hello World"}, "x":0, "y": 0, "w": 2, "h": 2}]}` where `data:` prepends the actual view config.

## Usage

Vitessce components can be used in React projects by installing the package from NPM:

```sh
npm install vitessce
```

For more details, please visit the [documentation](http://beta.vitessce.io/docs/).

## Development

First check your NodeJS version: It should work with NodeJS 8, 10, 12, 13, or 14.
```
$ node --version
v14.0.0
```

Note: NodeJS 14 may require the `max_old_space_size` option to be increased ([apparently due to a different heap management strategy](https://stackoverflow.com/a/59572966)):
```sh
export NODE_OPTIONS=--max_old_space_size=4096
```

Checkout the project, `cd`, and then:

```
$ npm install
$ npm start
```

The development server will refresh the browser as you edit the code.

- To run all the Travis checks: `./test.sh`
- To run just the unit tests: `npm run test:watch`

## Deployment

Before running any of the deployment scripts, confirm that you have installed the AWS CLI and are in the appropriate AWS account:
```
$ aws iam list-account-aliases --query 'AccountAliases[0]'
"gehlenborglab"
```

### Staging

To build the current branch and push the "minimal" demo and docs sites to S3, run this script:
```
$ ./push-demos.sh
```

This will build the demo and docs, push both to S3, and finally open the docs deployment in your browser.

### Release: Dev

If you haven't already, push a fresh demo site with `./push-dev.sh` and
do a last [manual test](TESTING.md) of the deployment.
If it looks good, copy it to dev.vitessce.io:

```
$ ./copy-dev.sh https://{url returned by push-demo.sh}
```

### Release: Docs

If you haven't already, push a fresh docs site with `./push-docs.sh`.
If it looks good, copy it to vitessce.io:

```
$ ./copy-docs.sh https://{url returned by push-docs.sh}
```

### Release: NPM package

The `vitessce` package is published to the NPM registry by Travis when the version in `package.json` has been updated and pushed to the `master` branch. To perform this update:
- Check out a new branch for the release,
    - Update the CHANGELOG.md to remove the "in progress" text from the current version heading.
    - Update the version by running `npm version [major | minor | patch]` (note: this will add a git commit and a git tag).
- Make a pull request to merge from the release branch into `master`.

Travis uses the `NPM_EMAIL` and `NPM_TOKEN` variables that can be set using the [web interface](https://travis-ci.org/github/vitessce/vitessce/settings) (Settings -> Environment Variables).

## Bundling

Vitessce provides a pure ESM export intended for bundlers (e.g. Vite, Webpack, Rollup).
Most modern bundlers should work out of the box, however bundling with legacy Webpack (<5.0) 
requires adding the following [resolution alias](https://webpack.js.org/configuration/resolve/#resolvealias)
to your `webpack.config.js`.

```javascript
module.exports = {
  //...
  resolve: {
    alias: {
      'txml/txml': 'txml/dist/txml'
    },
  },
};
```

This fix is temporary and will no longer be necessary after the [next release of Viv](https://github.com/vitessce/vitessce/pull/1049#issuecomment-939520471).

## Related repositories

- [Viv](https://github.com/hms-dbmi/viv): A library for multiscale visualization of high-resolution multiplexed tissue data on the web.
- [HiGlass](https://github.com/higlass/higlass): A library for multiscale visualization of genomic data on the web.
- [vitessce-python](https://github.com/vitessce/vitessce-python): Python API and Jupyter widget.
- [vitessce-r](https://github.com/vitessce/vitessce-r): R API and R htmlwidget.
- [vitessce-data](https://github.com/hms-dbmi/vitessce-data): Scripts to generate sample data

## Old presentations

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
