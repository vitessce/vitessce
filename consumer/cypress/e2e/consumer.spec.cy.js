
describe('Inclusion of Vitessce in plain HTML pages', () => {
  it('Works for consumer package', () => {
    cy.visit('/consumer/dist/index.html');
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
});
