# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

## Demo

Input data is provided (for now) by a drag and drop interface.
You can download sample [input files](https://github.com/hms-dbmi/vitessce-data/tree/master/fake-files/output-expected),
or you can checkout and run [`vitessce-data`](https://github.com/hms-dbmi/vitessce-data)
to generate a full data set.

Then visit our [live demo](https://hms-dbmi.github.io/vitessce/) and add your data.

## Development

Checkout the project, `cd`, and then:

```
$ npm install
$ npm start
```

The development server will refresh the browser as you edit the code.

You can also peek at the static demos, but you'll need to comment/uncomment
script tags to run it against locally built versions which have not yet been
deployed to NPM.

## Deployment

### Live demo

The [live demo](https://hms-dbmi.github.io/vitessce/) is hosted by
GitHub Pages, with static HTML being checked into `docs/` on the
`master` branch.

### NPM

The demo pulls our Javascript from NPM, via unpkg. Right now, new versions
are pushed to NPM by hand: Update the version number in `package.json` and run
`npm publish`.
