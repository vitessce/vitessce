---
id: js-overview
title: 'JavaScript API'
sidebar_label: Overview
---

The **JavaScript API** docs are intended for web developers who would like to integrate Vitessce into other web applications.

Vitessce can be integrated into [React](https://reactjs.org/) web applications as a React component.

## Installation

Installation requires [NodeJS](https://nodejs.org/) and NPM. Vitessce has been tested with NodeJS 14, and should work with versions 12, 14, and 16.

To install Vitessce from [NPM](https://www.npmjs.com/package/vitessce), go to your project folder in the terminal, and run:

```sh
npm install --save vitessce
```

## Troubleshooting

:::note

NodeJS 14 may require the `max_old_space_size` option to be increased:
```sh
export NODE_OPTIONS=--max_old_space_size=4096
```

:::