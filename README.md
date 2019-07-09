# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest release demo](http://vitessce.io/)
- [Previous demos](demos.md)
- [Previous releases on NPM](https://www.npmjs.com/package/vitessce?activeTab=versions)

![Vitessce screenshot](https://user-images.githubusercontent.com/730388/58634506-78472580-82b9-11e9-9df8-a1362de73818.png)

## Architecture

![Architecture diagram](https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650)

For more information, see the [documentation](http://vitessce.io/prod-docs/index.html).

## Data

The demo features data from several collaborators,
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

We publish to the NPM registry by hand:
Update the version number in `package.json` and run `npm publish`.

Finally, update the CHANGELOG.md to point to the new release on NPM.

## Old Presentations

- [July 2019 lab meeting: Intern progress reports and HuBMAP collaboration](https://docs.google.com/presentation/d/10zanc_cHh-OcFvBeuJdKBpLnazjVh64pbbdD4kJQ7GY/edit?usp=sharing)
- [2019 Harvard IT Summit](https://docs.google.com/presentation/d/1eYDMedzhQtcClB2cIBo17hlaSSAu_-vzkG4LY_mGGQ8/edit#slide=id.p)
- [Map 2019 lab meeting: Misc. tools](https://docs.google.com/presentation/d/1TaC68-r6bosnwi05BZ5bNh9tzeXsxyqmBo1gFZDxhGM/edit#slide=id.p)
- [April 2019 lab meeting: Software engineering](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY/edit#slide=id.p)
