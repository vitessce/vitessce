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

### Live demo

The [demo](https://hms-dbmi.github.io/vitessce/demos) is hosted by
GitHub Pages, with static HTML being checked into `docs/` on the
`master` branch. (Before release, you can preview it locally
by commenting and uncommenting the CSS and the script tag in `index.html`.)

### NPM

The demo pulls our Javascript from NPM, via jsdelivr.net.
New versions are pushed to NPM by hand:
Update the version number in `package.json` and run `npm publish`.

## Documentation

### Overview

[<img alt="Component diagram" src="https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=996&h=532">](https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit)

- List of data sets is hardcoded in `app.js`.
- [`vitessce-data`](https://github.com/hms-dbmi/vitessce-data) puts files on S3, and `LayerManagerPublisher` pulls them down and checks that they conform to schema.
- Rather than being a single React app, each component is independent, with communication facilitated by PubSubJS.
- `Publisher`/`Subscriber` components could be reused in a separate application which would use the same PubSubJS events...
- or the wrapped components could be reused in other React apps.

JSDocs and simple examples of the library in use are available in the
[documentation](https://hms-dbmi.github.io/vitessce/).

### Presentations
- [Lab group presentation](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY): focusses on software engineering choices.
