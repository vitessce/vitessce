
describe('Inclusion of Vitessce in plain HTML pages', () => {
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
  it('Works for ES bundle with dynamic importmap', () => {
    cy.visit('/sites/html/src/dynamic-importmap.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
  it('Works for dynamic import of HiGlass', () => {
    cy.visit('/sites/html/src/higlass.html');
    cy.contains('Demo of Vitessce');
    cy.contains('HiGlass');
    cy.get('.higlass .tiled-plot-div', { timeout: 5000 });
  });
  it('Works for consumer package', () => {
    cy.visit('/consumer/dist/index.html');
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
});
