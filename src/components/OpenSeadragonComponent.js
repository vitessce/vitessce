import React from 'react';
import OpenSeadragon from 'openseadragon';

export default class OpenSeadragonComponent extends React.Component {
  constructor(props) {
    super(props);
    this.id = `id-${Math.random()}`;
    this.myRef = React.createRef();
  }

  render() {
    return (
      <div id={this.id} style={{ height: '100%', width: '100%' }} ref={this.myRef} />
    );
  }

  zoomTo(x, y, width, height) {
    const rect = this.viewer.viewport.imageToViewportRectangle(x, y, width, height);
    this.viewer.viewport.fitBounds(rect, true);
  }

  initSeaDragon() {
    const {
      tileSources,
      x, y, width, height,
    } = this.props;
    this.viewer = OpenSeadragon({
      id: this.id,
      showNavigationControl: false,
      tileSources,
    });
    this.viewer.addHandler('open', () => {
      // Callback is necessary: If invoked immediately, it doesn't work.
      this.zoomTo(x, y, width, height);
    });
  }

  componentDidMount() {
    this.initSeaDragon();
  }

  shouldComponentUpdate(nextProps) {
    const {
      x, y, width, height,
    } = nextProps;
    this.zoomTo(x, y, width, height);
    return false;
  }
}
