import { renderApp } from '../app/app';

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('small')) {
  renderApp('small-app', 100);
} else {
  renderApp('full-app');
}
