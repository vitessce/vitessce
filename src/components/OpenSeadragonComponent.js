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
      const rect = this.viewer.viewport.imageToViewportRectangle(x, y, width, height);
      this.viewer.viewport.fitBounds(rect, true);
    });
  }

  componentDidMount() {
    this.initSeaDragon();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      x, y, width, height,
    } = nextProps;
    const rect = this.viewer.viewport.imageToViewportRectangle(x, y, width, height);
    this.viewer.viewport.fitBounds(rect, true);
    return false;
  }
}
