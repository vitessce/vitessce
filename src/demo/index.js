import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import { createApp } from '../app';

function renderComponent(react, id) {
  ReactDOM.render(react, document.getElementById(id));
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('small')) {
  renderComponent(createApp(100, false), 'small-app');
} else {
  renderComponent(createApp(null, true), 'full-app');
}
