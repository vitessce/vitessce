<a href="http://vitessce.io">
    <img src="./img/logo-transparent.png" alt="Vitessce logo" title="Vitessce" />
</a>

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest release demo](http://vitessce.io/)
- [Previous demos](DEMOS.md)
- [Previous releases on NPM](https://www.npmjs.com/package/vitessce?activeTab=versions)

![Screenshot of Vitessce with Linnarsson data](https://user-images.githubusercontent.com/1216518/93336741-2b60c880-f7f6-11ea-8b82-7e1e0ea45e43.png)

![Same data, zoomed in to cellular scale](https://user-images.githubusercontent.com/1216518/93337080-a4f8b680-f7f6-11ea-9e53-2c73cc661b94.png)

## Integrations

Vitessce is being used in the following projects:

- [HuBMAP Data Portal](https://portal.hubmapconsortium.org)

## Architecture

[![Architecture diagram](https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650)](https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit)

For more information, see the [glossary](./GLOSSARY.md).

## Data

The demo features data from several collaborators,
with preprocessing done by [`vitessce-data`](https://github.com/hms-dbmi/vitessce-data).

You can also use the demo website for visualizing your own data via view configs passed in as url parameters.  If you are storing a `json` view configuration on a remote server, the url will look something like `http://vitessce.io/?url=https://example.com/my_config.json`.  Otherwise, if you have a view configuration that is not stored somewhere that can be accessed via a web server, you can do something like `http://vitessce.io/?url=data:,{"name":"FAKE", "version": "0.1.0", "description":"fake dataset", "layers":[], "staticLayout":[{"component":"description", "props":{"description": "Hello World"}, "x":0, "y": 0, "w": 2, "h": 2}]}` where `data:` prepends the actual view config.

## Usage

Vitessce components can be used in React projects by installing the package from NPM:

```sh
npm install vitessce
```

The following code demonstrates the `<Status/>` and `<Scatterplot/>` components.

Note the `vitessce-container` and `vitessce-theme-light` classes added to the parent `div` element.
Vitessce component styles are scoped under these classes, which means that a parent element must apply the classes in order for child components to inherit the expected styles. 

```jsx
import React from 'react';
import { Scatterplot } from 'vitessce/es/production/scatterplot.min.js';
import { Status } from 'vitessce/es/production/status.min.js';
import 'vitessce/es/production/static/css/index.css';

export default function App() {
    const view = { target: [0, 0, 0], zoom: 0.75 };
    const mapping = "PCA";
    const cells = {
        1: { mappings: { [mapping]: [0, 0] } },
        2: { mappings: { [mapping]: [1, 1] } },
        3: { mappings: { [mapping]: [1, 2] } }
    };
    const selectedCellIds = new Set();
    const dimensions = { width: '400px', height: '400px', margin: '10px' };

    return (
        <div className="vitessce-container vitessce-theme-light">
            <div className="card card-body bg-secondary" style={dimensions}>
                <Status
                    info="Hello world"
                    removeGridComponent={() => {}}
                />
            </div>
            <div className="card card-body bg-secondary" style={dimensions}>
                <Scatterplot
                    uuid="my-vitessce-scatterplot"
                    view={view}
                    mapping={mapping}
                    cells={cells}
                    selectedCellIds={selectedCellIds}
                    cellColors={null}
                    updateStatus={(message) => {}}
                    updateCellsSelection={(selectedIds) => {}}
                    updateCellsHover={(hoverInfo) => {}}
                    updateViewInfo={(viewInfo) => {}}
                    clearPleaseWait={(layerName) => {}}
                />
            </div>
        </div>
    );
}
```

If you are interested in using Vitessce in the browser as part of a `script` tag or the like, we also export a `umd` build (the above snippet uses an `es` bundle).
Note that our `es` bundles contain none of the dependencies, all of which should be installed by `npm` automatically when it reads the `package.json` file that our package ships with.
The advanatage of not bundling everything is that we can keep the size of our bundle down and avoid any upstream compilation issues or the like.

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

### Demo

To build the current branch and push to S3, first confirm that you have installed the AWS CLI and are in the appropriate AWS account:
```
$ aws iam list-account-aliases --query 'AccountAliases[0]'
"gehlenborglab"
```
and then run this script:
```
$ ./push-demo.sh
```

This will build, push to S3, and finally open the demo deployment in your browser.

### Release

If you haven't already, push a fresh demo and
do a last [manual test](TESTING.md) of the deployment.
If it looks good, copy it to vitessce.io:

```
$ ./copy-prod.sh https://{url returned by push-demo.sh}
```

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

## Related Subsidiary Projects

- [Viv](https://github.com/hms-dbmi/viv): A library for multiscale visualization of high-resolution multiplexed tissue data on the web.
- [vitessce-grid](https://github.com/hms-dbmi/vitessce-grid): Wrapper for [`react-grid-layout`](https://github.com/STRML/react-grid-layout#readme)
- [vitessce-data](https://github.com/hms-dbmi/vitessce-data): Scripts to generate sample data
- [ome-tiff-tiler](https://github.com/hms-dbmi/ome-tiff-tiler): Docker container to generate tiles from OME-TIFF

## Old Presentations

- [July 2020: Ilan Gold's lab meeting update](https://docs.google.com/presentation/d/1QzKYP6sXPefBMNfY4PW4H0AMoWVbw9HeNoweLmJg17Y/edit?usp=sharing)
- [2020 NLM Informatics Training Conference (Trevor)](https://docs.google.com/presentation/d/1eYslI4y1LbnEGwj4XHXxqYcRKpYgqc9Y2mZTd5iCzMc/edit?usp=sharing)
- [Trevor Manz's overview of multimodal imaging in Vitessce](https://docs.google.com/presentation/d/1NPYZPduymN7wzgN-NYRQwd15D-nUZYILJTgBR2oNb04/edit?usp=sharing)
- [Ilan Gold's overview of IF Imagery](https://docs.google.com/presentation/d/1BSz2JefN2WSF_RwVpOrIhYD2V8D7ZLc5b21VTy2Xmlo/edit#slide=id.p)
- [Trevor Manz's wrap-up on Arrow, Zarr, and IMS](https://docs.google.com/presentation/d/1H2hff-bW4SZ3KFD5_q0iN-Dv1yew7pVe0MbdMsA2gko/edit)
- [September 2019 HuBMAP Poster](https://drive.google.com/open?id=1pRiTN99-wZ6QuEMWzorcD4fA2Fi-7eW4)
- [August 2019 SIBMI Presentations](https://docs.google.com/presentation/d/1IRWDofdvKS3qbLY-s0a1EUijha3m-JopMYgmETOIHq0/edit?usp=sharing)
- [July 2019 lab meeting: Intern progress reports and HuBMAP collaboration](https://docs.google.com/presentation/d/10zanc_cHh-OcFvBeuJdKBpLnazjVh64pbbdD4kJQ7GY/edit?usp=sharing)
- [2019 Harvard IT Summit](https://docs.google.com/presentation/d/1eYDMedzhQtcClB2cIBo17hlaSSAu_-vzkG4LY_mGGQ8/edit#slide=id.p)
- [Map 2019 lab meeting: Misc. tools](https://docs.google.com/presentation/d/1TaC68-r6bosnwi05BZ5bNh9tzeXsxyqmBo1gFZDxhGM/edit#slide=id.p)
- [April 2019 lab meeting: Software engineering](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY/edit#slide=id.p)
