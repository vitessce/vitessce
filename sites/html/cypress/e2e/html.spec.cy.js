
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
  it('Works when loaded in same page as CCF UI components', () => {
    // Tests for vitessce display
    cy.visit('/sites/html/src/ccf-ui.html');
    cy.contains('Demo of Vitessce');
    cy.contains('Scatterplot (UMAP)');
    cy.contains('523 cells'); // Not public; requires "show=all".
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
    // Labels inside the CCF UI Deck.GL viewer
    cy.contains('Left');
    cy.contains('Right');
    cy.contains('Male');
    cy.contains('Female');
    // Various metadata displayed next to CCF UI
    cy.contains('Tissue Data Providers', { timeout: 60000 });
    cy.contains('Donors');
    cy.contains('Tissue Blocks');
    cy.contains('Tissue Sections');
    cy.contains('Tissue Datasets');
    // Actions/links next to CCF UI
    cy.contains('Register Tissue');
    cy.contains('Explore Tissue');
    cy.contains('ASCT+B Reporter');
    cy.contains('HRA Portal');
    cy.contains('Online Course');
    cy.contains('Paper');
  });
  // Controlled component tests
  it('Renders when used as a controlled component', () => {
    cy.visit('/sites/html/src/controlled-component.html');
    cy.contains('First config, first view');
  });

  // Define function that can be re-used in both controlled component tests below.
  function controlConfigs() {
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
  }
  it('Controlled component: can select a different config with UIDs', () => {
    cy.visit('/sites/html/src/controlled-component.html?withUid=true');
    controlConfigs();
  });
  it('Controlled component: can select a different config without UIDs', () => {
    cy.visit('/sites/html/src/controlled-component.html?withUid=false');
    controlConfigs();
  });
  it('Animated controlled component: views update each second for five seconds', () => {
    cy.visit('/sites/html/src/animated-config.html?withSameObjectReference=false');

    // Initially renders first view
    cy.contains('Timestamp: 0');
    cy.contains('View 2').should('not.exist');

    cy.wait(1100);
    cy.contains('Timestamp: 1');
    cy.contains('View 2').should('not.exist');

    cy.wait(1100);
    cy.contains('Timestamp: 2');
    cy.contains('View 2').should('exist');
    cy.contains('View 3').should('not.exist');

    cy.wait(1100);
    cy.contains('Timestamp: 3');
    cy.contains('View 2').should('exist');
    cy.contains('View 3').should('exist');
    cy.contains('View 4').should('not.exist');

    cy.wait(1100);
    cy.contains('Timestamp: 4');
    cy.contains('View 2').should('exist');
    cy.contains('View 3').should('exist');
    cy.contains('View 4').should('exist');
    cy.contains('View 5').should('not.exist');
  });
  it('Animated controlled component: views do not update when same config object reference is used', () => {
    cy.visit('/sites/html/src/animated-config.html?withSameObjectReference=true');

    // Initially renders first view
    cy.contains('Timestamp: 0');
    cy.contains('View 2').should('not.exist');

    // Waiting should not change anything; new views should not appear.
    cy.wait(1500);
    cy.contains('Timestamp: 0');
    cy.contains('Timestamp: 1').should('not.exist');
    cy.contains('Timestamp: 2').should('not.exist');
    cy.contains('Timestamp: 3').should('not.exist');
    cy.contains('Timestamp: 4').should('not.exist');
    cy.contains('Timestamp: 5').should('not.exist');
    cy.contains('View 2').should('not.exist');
    cy.contains('View 3').should('not.exist');
    cy.contains('View 4').should('not.exist');
    cy.contains('View 5').should('not.exist');
  });
  // Consumer site tests
  it('Works for consumer site built with Vite', () => {
    cy.visit('/consumer/dist/index.html');
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
  it('Works for consumer site built with NextJS', () => {
    cy.visit('/consumer/out/index.html');
    cy.contains('Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH');
  });
});
