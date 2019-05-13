import React from 'react';
import DeckGL, { OrthographicView, TextLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { HiGlassComponent } from 'higlass';


/**
Provides a default export (suitable for React.lazy) which also adds
a <link> for the necessary stylesheet. Relying on the authors of the CSS
to apply sufficient namespacing to avoid style conflicts.
*/
export default function WrappedStyledHiGlass(props) {
  const deckProps = {
    views: [new OrthographicView()],
    initialViewState: {
      zoom: 1,
    },
    layers: [
      new TextLayer({
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: [[0, 0]],
        getPosition: d => d,
        getText: () => 'This is a DeckGL layer on top!',
      }),
    ],
  };
  return (
    <React.Fragment>
      <link rel="stylesheet" href="https://unpkg.com/higlass@1.2.6/dist/hglib.css" />
      <DeckGL {...deckProps}>
        <HiGlassComponent {... props} />
      </DeckGL>
    </React.Fragment>
  );
}
