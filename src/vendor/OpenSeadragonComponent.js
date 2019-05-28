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

  zoomTo(x, y, width, height, sample = 1) {
    // TODO: We sometimes get TypeErrors... Some kind of race condition?
    // Until I understand the problem better, just exit early
    // if the data we need is not available.
    if (!this.viewer.world.getItemAt) return;
    const tiledImage = this.viewer.world.getItemAt(0);
    // TODO: ... and we also got a TypeError here.
    if (!tiledImage) return;
    const rect = tiledImage.imageToViewportRectangle(
      x / sample, y / sample, width / sample, height / sample,
    );
    this.viewer.viewport.fitBounds(rect, true);
  }

  initSeaDragon() {
    const {
      tileSources, sample,
      x, y, width, height,
    } = this.props;
    this.viewer = OpenSeadragon({
      id: this.id,
      showNavigationControl: false,
      // OSD default is to change zoom on resize: Not what we want.
      // See "setTimeout" below, and https://github.com/hms-dbmi/vitessce/issues/182
      preserveImageSizeOnResize: true,
      tileSources,
    });
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
      x, y, width, height, sample,
    } = nextProps;
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
      // OSD does its own resizing as the div is resized, except their heuristic is different:
      // They change the zoom, and try to preserve the content on screen.
      // With a 0-timeout, we can zoom the "right" way after they zoom the "wrong" way.
      // See "preserveImageSizeOnResize" above, and https://github.com/hms-dbmi/vitessce/issues/182
      setTimeout(() => { this.zoomTo(x, y, width, height, sample); }, 0);
    }
    // React should not re-render the component:
    return false;
  }
}
