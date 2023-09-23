
function loadConfig(config) {
  // Visit the demo by using the config object as a data URI.
  const uri = `data:,${JSON.stringify(config)}`;
  cy.visit(`/?url=${uri}`);
}

describe('Vitessce Data URIs', () => {
  beforeEach(() => {
    // Any request we do not explicitly route will return 404,
    // so we won't end up depending on outside resources by accident.
    // Removed in Cypress v12
    // Reference: https://github.com/cypress-io/cypress/issues/9358#issuecomment-750231567
    // cy.server({ force404: true });
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
    cy.intercept('https://example.com/bad-url.json').as('badUrl');
    // Wait for initial request by react-query
    cy.wait('@badUrl');
    // We use a retry: 2 and the default exponential backoff function,
    // so we wait 1s here for that second request to be triggered
    // after which the error will be rendered.
    cy.wait(1000);
    cy.contains('JsonSource Error HTTP Status fetching from https://example.com/bad-url.json');
  });

  it('handles errors from bad view config v0.1.0', () => {
    const config = {'bad': 'config', 'version': '0.1.0'};
    loadConfig(config);
    cy.contains('Config validation or upgrade failed');
  });

  it('handles errors from bad view config v1.0.0', () => {
    const config = {'bad': 'config', 'version': '1.0.0'};
    loadConfig(config);
    cy.contains('Config validation or upgrade failed');
  });

  it('handles errors from bad view config missing version', () => {
    const config = {'bad': 'config'};
    loadConfig(config);
    cy.contains('Missing version');
  });
});
