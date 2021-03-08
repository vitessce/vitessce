import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import { createApp } from '../app';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('small')) {
  renderComponent(createApp({ rowHeight: 100 }), 'small-app');
} else {
  renderComponent(createApp({ showBetaHeader: true }), 'full-app');
}
