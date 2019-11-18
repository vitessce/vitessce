import { renderApp } from '../../src/app/app';

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('small')) {
  renderApp('small-app');
} else {
  renderApp('full-app');
}
