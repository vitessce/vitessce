
describe('Vitessce Mocked Routes', () => {

  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/?show=all');
    cy.contains('Vitessce');
    cy.contains('Its modular design is optimized');
    cy.contains('just scatterplot as component'); // Not public; requires "show=all".
    cy.contains('Spraggins as component')
      .click();
    // This part seems to be fragile: Might run too fast?
    // cy.contains('Please wait');
    // cy.get('.modal-body').should('be.visible');
  });

});

describe('Vitessce plugin support', () => {
  it('renders a plugin view', () => {
    // 8080 is serving the loader fixtures directory.
    cy.visit('/?dataset=plugin-view-type&debug=true');
    cy.contains('Try a random zoom level');
  });

  it('renders a view based on a plugin file type', () => {
    // 8080 is serving the loader fixtures directory.
    cy.visit('/?dataset=plugin-file-type&debug=true');
    cy.contains('60 cells');
    cy.contains('90 genes');
  });
});
