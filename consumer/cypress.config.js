import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3003',
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/*.spec.cy.js',
    supportFile: false,
  },
  video: false,
});
