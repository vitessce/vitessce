
describe('Inclusion of Vitessce in plain HTML pages', () => {
  it('Works for development UMD bundle', () => {
    cy.visit('/sites/html/src/umd.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
  it('Works for production UMD bundle', () => {
    cy.visit('/sites/html/src/umd.min.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
  it('Works for development ES bundle', () => {
    cy.visit('/sites/html/src/es.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
  it('Works for production ES bundle', () => {
    cy.visit('/sites/html/src/es.min.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
});
