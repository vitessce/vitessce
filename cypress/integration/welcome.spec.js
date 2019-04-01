Cypress.on('window:before:load', (win) => {
  // Forces fallback to XHR, so cypress can mock response.
  //
  // Use this work-around:
  // https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch
  //
  // until this feature is implemented:
  // https://github.com/cypress-io/cypress/issues/95

  delete win.fetch; // eslint-disable-line no-param-reassign
});

describe('Vitessce', () => {
  beforeEach(() => {
    const base = 'https://s3.amazonaws.com/vitessce-data/0.0.12/linnarsson-2018/';
    cy.server();
    // TODO: images, cells, molecules
    ['clusters', 'genes', 'factors', 'neighborhoods'].forEach(
      (type) => {
        cy.route(
          `${base}linnarsson.${type}.json`,
          `fixture:../../src/schemas/fixtures/${type}.good.json`,
        );
      },
    );
  });

  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/');
    cy.contains('Vitessce');
    cy.contains('This is a demo');
    cy.contains('Linnarsson - osmFISH')
      .click();
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');
    // TODO: Confirm clear.
    // TODO: Confirm new URL.
  });

  it('loads details', () => {
    cy.visit('/?dataset=linnarsson-2018');
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');
    // TODO: Confirm clear.

    cy.contains('3 cells × 3 genes');
    cy.contains('with 0 cells selected');
  });
});
