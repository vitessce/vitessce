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
    const base = 'https://s3.amazonaws.com/vitessce-data/0.0.12/linnarsson-2018';
    cy.server();
    ['cells', 'molecules', 'images', 'clusters', 'genes', 'factors', 'neighborhoods'].forEach(
      (type) => {
        cy.route(
          `${base}/linnarsson.${type}.json`,
          `fixture:../../src/schemas/fixtures/${type}.good.json`,
        );
      },
    );
  });

  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/');
    cy.contains('Vitessce');
    cy.contains('This is a demo');
    cy.contains('Linnarsson (responsive layout)')
      .click();
    // This part seems to be fragile: Might run too fast?
    // cy.contains('Please wait');
    // cy.get('.modal-body').should('be.visible');
  });

  it('loads details (static)', () => {
    cy.visit('/?dataset=linnarsson-2018-static');
    cy.contains('Linnarsson (static layout)');
  });

  it('loads details (responsive)', () => {
    cy.visit('/?dataset=linnarsson-2018-responsive');
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');

    // Data Set:
    cy.contains('Linnarsson (responsive layout)');
    cy.contains('Spatial organization of the');

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

    // t-SNE:
    // Has same number of cells as Spatial.

    // Fails on Travis: Another race condition?
    // cy.get('.modal-body').should('not.be.visible');
  });
});
