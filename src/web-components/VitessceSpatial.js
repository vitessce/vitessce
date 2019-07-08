import React from 'react';
import ReactDOM from 'react-dom';
import Spatial from '../components/spatial/Spatial';

class VitessceSpatial extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    const cells = this.getAttribute('cells');
    const view = this.getAttribute('view');
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    // TODO: Port more props.

    mountPoint.style.width = `${width}px`;
    mountPoint.style.height = `${height}px`;
    mountPoint.style.border = '1px solid black';

    ReactDOM.render(
      <p>hello?</p>,
      // <Spatial cells={cells} view={view} />,
      mountPoint,
    );
  }
}
customElements.define('vitessce-spatial', VitessceSpatial);
