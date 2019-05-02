# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest docs and demo](https://hms-dbmi.github.io/vitessce/)

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
- To develop components in a sandbox: `npm run docz:dev`

## Deployment

### Demo

Quick demos of the current branch can be pushed to S3:

```
$ ./push-demo.sh
```

### Release

New versions of the library are pushed to NPM by hand:
Update the version number in `package.json` and run `npm publish`.
