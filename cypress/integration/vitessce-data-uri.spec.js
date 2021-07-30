Cypress.on('window:before:load', (win) => {
  // Forces fallback to XHR, so cypress can mock response.
  //
  // Using this work-around:
  // https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch
  //
  // until this feature is implemented:
  // https://github.com/cypress-io/cypress/issues/95

  delete win.fetch; // eslint-disable-line no-param-reassign
});

function loadConfig(config) {
  // Without a route, Cypress tries to proxy the request,
  // and that doesn't seem to work for data URIs.
  const uri = 'data:,JSON-HERE';
  cy.route({
    url: uri,
    response: config,
  });

  cy.visit('/');
  cy.get('input[name=url]').type(uri);
  cy.get('button').click();
}

describe('Vitessce Data URIs', () => {
  beforeEach(() => {
    // Any request we do not explicitly route will return 404,
    // so we won't end up depending on outside resources by accident.
    cy.server({ force404: true });
  });

  it('loads valid data URI', () => {
    const message = 'Hello World!';
    const config = {
      version: '0.1.0',
      name: '-',
      description: '-',
      layers: [],
      staticLayout: [
        {
          component: 'description',
          props: {
            description: message,
          },
          x: 0,
          y: 0,
          w: 12,
        },
      ],
    };
    loadConfig(config);
    cy.contains(message);
  });

  it('handles errors from bad URL in config', () => {
    const config = {
      "version": "0.1.0",
      "name": "fake",
      "description": "Good schema, Bad URL",
      "layers": [
        {
          "name": "cells",
          "type": "CELLS",
          "fileType": "cells.json",
          "url": "https://example.com/bad-url.json"
        }
      ],
      "staticLayout": [
        {
          "component": "status",
          "x": 0,
          "y": 0,
          "w": 4,
          "h": 8,
        },
        {
          "component": "scatterplot",
          "props": {
            "mapping": "PCA",
          },
          "x": 4,
          "y": 0,
          "w": 4,
          "h": 8,
        }
      ]
    };
    loadConfig(config);
    cy.contains('JsonSource Error HTTP Status fetching from https://example.com/bad-url.json');
  });

  it('handles errors from bad view config v0.1.0', () => {
    const config = {'bad': 'config', 'version': '0.1.0'};
    loadConfig(config);
    cy.contains('Config validation failed');
    cy.contains('"additionalProperty": "bad"');
  });

  it('handles errors from bad view config v1.0.0', () => {
    const config = {'bad': 'config', 'version': '1.0.0'};
    loadConfig(config);
    cy.contains('Config validation failed');
    cy.contains('"additionalProperty": "bad"');
  });

  it('handles errors from bad view config missing version', () => {
    const config = {'bad': 'config'};
    loadConfig(config);
    cy.contains('Missing version');
  });
});
