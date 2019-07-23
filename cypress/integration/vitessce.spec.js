import { urlPrefix } from '../../src/app/api';

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

describe('Vitessce', () => {
  beforeEach(() => {
    // Any request we do not explicitly route will return 404,
    // so we won't end up depending on outside resources by accident.
    cy.server({ force404: true });
    ['cells', 'molecules', 'images', 'clusters', 'genes', 'factors', 'neighborhoods'].forEach(
      (type) => {
        cy.route(
          `${urlPrefix}/linnarsson/linnarsson.${type}.json`,
          `fixture:../../src/schemas/fixtures/${type}.good.json`,
        );
      },
    );
  });

  it('loads data URI', () => {
    // The order of this test matters; if put after "has title, blurb...",
    // it will fail. Maybe later look into how second test changes things globally.
    const message = 'Hello World!';
    const config = {
      name: '-',
      description: '-',
      layers: [],
      responsiveLayout: {
        columns: { 1000: [0, 1] },
        components: [
          {
            component: 'Description',
            props: {
              description: message,
            },
            x: 0,
            y: 0,
          },
        ],
      },
    };
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
    cy.contains(message);
  });

  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/?show=all');
    cy.contains('Vitessce');
    cy.contains('This is a demo');
    cy.contains('(static layout)'); // Not public; requires "show=all".
    cy.contains('Linnarsson (responsive layout)')
      .click();
    // This part seems to be fragile: Might run too fast?
    // cy.contains('Please wait');
    // cy.get('.modal-body').should('be.visible');
  });

  it('loads details (static)', () => {
    cy.visit('/?dataset=linnarsson-2018-static');
    cy.contains('Linnarsson (static layout): Spatial organization');
  });

  it('loads details (responsive)', () => {
    cy.visit('/?dataset=linnarsson-2018');
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');

    // Data Set:
    cy.contains('Linnarsson: Spatial organization');

    // Status:
    // Contents will depend on load order, so not sure how to make a good test
    // that won't have race condition problems.

    // Spatial:
    cy.contains('1 cells');
    cy.contains('1 molecules');
    cy.contains('3 locations');

    // Heatmap:
    cy.contains('3 cells × 3 genes');
    cy.contains('with 0 cells selected');

    // Factors:
    cy.contains('2 factors');
    cy.contains('subcluster');

    // Expression Levels:
    cy.contains('2 genes');
    cy.contains('Slc32a1');

    // Scatterplots:
    cy.contains('Scatterplot (t-SNE)');
    cy.contains('Scatterplot (PCA)');

    // Fails on Travis: Another race condition?
    // cy.get('.modal-body').should('not.be.visible');
  });

  it('loads a warning message for undefined dataset config', () => {
    cy.visit('/?dataset=nonexistent-dataset');
    cy.contains('No such dataset');
  });
});
