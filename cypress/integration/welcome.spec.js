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
  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/');
    cy.contains('Vitessce');
    cy.contains('This is a demo');
    cy.contains('Linnarsson - osmFISH')
      .click();
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');
    // TODO: Mock API response and confirm clear.
  });

  it('loads details', () => {
    cy.visit('/?dataset=linnarsson-2018');
    cy.contains('Please wait');
    cy.get('.modal-body').should('be.visible');
    // TODO: Mock API response and confirm clear.
  });
});
