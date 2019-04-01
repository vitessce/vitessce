describe('Vitessce', () => {
  it('has title, blurb, and link', () => {
    cy.visit('/');
    cy.contains('Vitessce');
    cy.contains('This is a demo');
    cy.contains('Linnarsson - osmFISH')
      .click();
    cy.contains('Please wait');
  });
});
