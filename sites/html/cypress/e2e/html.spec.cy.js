
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
  // Controlled component tests
  it('Renders when used as a controlled component', () => {
    cy.visit('/sites/html/src/controlled-component.html');
    cy.contains('First config, first view');
  });
  it('Controlled component: can select a different config', () => {
    cy.visit('/sites/html/src/controlled-component.html');

    // Initially renders first config
    cy.contains('First config, first view');

    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'width', '780px');
    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'height', '780px');

    // Upon selection of second config, first config is no longer rendered.
    cy.get('select').select(1); // Select the second config ("Config 1").
    cy.contains('First config, first view').should('not.exist');

    // Second config is rendered.
    cy.contains('Second config, first view');
    cy.contains('Second config, second view');
    cy.contains('Second config, third view');

    // Widths of views are as expected.
    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'width', '388px');
    cy.get('.react-grid-layout .react-grid-item').eq(1).should('have.css', 'width', '388px');
    cy.get('.react-grid-layout .react-grid-item').eq(2).should('have.css', 'width', '388px');

    // Heights of views are as expected.
    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'height', '388px');
    cy.get('.react-grid-layout .react-grid-item').eq(1).should('have.css', 'height', '388px');
    cy.get('.react-grid-layout .react-grid-item').eq(2).should('have.css', 'height', '388px');

    // Upon selection of third config, second config is no longer rendered.
    cy.get('select').select(2); // Select the third config ("Config 2").
    cy.contains('Second config, first view').should('not.exist');
    cy.contains('Second config, second view').should('not.exist');
    cy.contains('Second config, third view').should('not.exist');

    // Third config is rendered.
    cy.contains('Third config, first view');
    cy.contains('Third config, second view');

    // Widths of views are as expected.
    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'width', '191px');
    cy.get('.react-grid-layout .react-grid-item').eq(1).should('have.css', 'width', '191px');

    // Heights of views are as expected.
    cy.get('.react-grid-layout .react-grid-item').eq(0).should('have.css', 'height', '780px');
    cy.get('.react-grid-layout .react-grid-item').eq(1).should('have.css', 'height', '780px');
  });


  it('Works for consumer package', () => {
    cy.visit('/consumer/dist/index.html');
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
});
