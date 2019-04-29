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

  zoomTo(x, y, width, height, sample) {
    // TODO: We sometimes get TypeErrors... Some kind of race condition.
    // Until I understand the problem better, just exit early
    // if the data we need is not available.
    if (!this.viewer.world.getItemAt) return;
    const tiledImage = this.viewer.world.getItemAt(0);
    if (!tiledImage) return;
    const rect = tiledImage.imageToViewportRectangle(
      x / sample, y / sample, width / sample, height / sample,
    );
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
    const sample = 8; // TODO: pull from config
    this.viewer.addHandler('open', () => {
      // Callback is necessary: If invoked immediately, it doesn't work.
      this.zoomTo(x, y, width, height, sample);
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
    const sample = 8; // TODO: pull from config
    if (tileSources.length !== nextProps.tileSources.length) {
      // This assumes that tileSources are not modified in place,
      // and that all tileSources changes involve a change in length.
      this.viewer.removeAllHandlers('open');
      this.viewer.addHandler('open', () => {
        this.zoomTo(x, y, width, height, sample);
      });
      // We need to re-add the open handler because the coordinate to zoomTo are new.
      this.viewer.open(nextProps.tileSources);
    } else {
      this.zoomTo(x, y, width, height, sample);
    }
    return false;
  }
}
