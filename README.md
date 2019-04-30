# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

## Demo

The [demo](https://hms-dbmi.github.io/vitessce/demos) features data from
the [Linnarsson Lab](http://linnarssonlab.org/osmFISH/availability/).

## Development

Checkout the project, `cd`, and then:

```
$ npm install
$ npm start
```

The development server will refresh the browser as you edit the code.

To run all the Travis checks: `./test.sh`;
to run just the unit tests: `npm run test:watch`.

## Deployment

### Demos

Quick demos of the current branch can be pushed to S3:

```
$ ./push-demo.sh
```

The official release [demo](https://hms-dbmi.github.io/vitessce/demos) is hosted by
GitHub Pages, with static HTML being checked into `docs/` on the
`master` branch. (Before release, you can preview it locally
by commenting and uncommenting the CSS and the script tag in `index.html`.)

### NPM

The demo pulls our Javascript from NPM, via jsdelivr.net.
New versions are pushed to NPM by hand:
Update the version number in `package.json` and run `npm publish`.

## Documentation

### Overview

JSDocs and simple examples of the library in use are available in the
[documentation](https://hms-dbmi.github.io/vitessce/).

### Presentations
- [Lab group presentation](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY): focusses on software engineering choices.
