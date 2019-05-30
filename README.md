# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest stable release](https://hms-dbmi.github.io/vitessce/)
- [Latest development release](https://hms-dbmi.github.io/vitessce/dev.html)

![Vitessce screenshot](https://user-images.githubusercontent.com/730388/58634506-78472580-82b9-11e9-9df8-a1362de73818.png)

## Data

The demo currently features data from the
[Linnarsson Lab](http://linnarssonlab.org/osmFISH/availability/),
with preprocessing done by [`vitessce-data`](https://github.com/hms-dbmi/vitessce-data).

## Development

Checkout the project, `cd`, and then:

```
$ npm install
$ npm start
```

The development server will refresh the browser as you edit the code.

- To run all the Travis checks: `./test.sh`
- To run just the unit tests: `npm run test:watch`
- To generate documentation: `npm run docz:dev`

## Deployment

### App and docs

To build the current branch and push to S3:

```
$ ./push-demo.sh
```

If it looks good, copy it to vitessce.io:

```
$ ./copy-prod.sh https://s3.amazonaws.com/vitessce-data/demos/YOUR-DEMO-PATH
```

### NPM Release

New versions of the library are pushed to NPM by hand:
Update the version number in `package.json` and run `npm publish`.

## Old Presentations

- [2019 Harvard IT Summit](https://docs.google.com/presentation/d/1eYDMedzhQtcClB2cIBo17hlaSSAu_-vzkG4LY_mGGQ8/edit#slide=id.p)
- [Map 2019 lab meeting: Misc. tools](https://docs.google.com/presentation/d/1TaC68-r6bosnwi05BZ5bNh9tzeXsxyqmBo1gFZDxhGM/edit#slide=id.p)
- [April 2019 lab meeting: Software engineering](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY/edit#slide=id.p)
