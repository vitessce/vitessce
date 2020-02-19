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
      "name": "fake",
      "description": "Good schema, Bad URL",
      "layers": [
        {
          "name": "cells",
          "type": "CELLS",
          "url": "https://example.com/bad-url"
        }
      ],
      "staticLayout": [
        {
          "component": "status",
          "x": 0,
          "y": 0,
          "w": 12
        }
      ]
    };
    loadConfig(config);
    cy.contains('Error HTTP status from cells.');
  });

  it('handles errors from bad view config', () => {
    const config = {'bad': 'config'};
    loadConfig(config);
    cy.contains('Config validation failed');
    cy.contains('"additionalProperty": "bad"');
  });
});
