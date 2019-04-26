import React from 'react';
import OpenSeadragon from 'openseadragon';

export default class OpenSeadragonComponent extends React.Component {
  constructor(props) {
    super(props);
    this.id = `id-${Math.random()}`;
  }

  render() {
    return (
      <div id={this.id} style={{ height: '100%', width: '100%' }} />
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
    const { tileSources } = this.props;
    const {
      x, y, width, height,
    } = nextProps;
    if (tileSources.length !== nextProps.tileSources.length) {
      // This assumes that tileSources are not modified in place,
      // and that all tileSources changes involve a change in length.
      this.viewer.removeAllHandlers('open');
      this.viewer.addHandler('open', () => {
        this.zoomTo(x, y, width, height);
      });
      // We need to re-add the open handler because the coordinates to zoomTo are new.
      this.viewer.open(nextProps.tileSources);
    } else {
      this.zoomTo(x, y, width, height);
    }
    return false;
  }
}
