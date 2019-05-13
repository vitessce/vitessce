import React from 'react';
import { HiGlassComponent } from 'higlass';

/**
Provides a default export (suitable for React.lazy) which also adds
a <link> for the necessary stylesheet. Relying on the authors of the CSS
to apply sufficient namespacing to avoid style conflicts.
*/
export default function StyledHiGlass(props) {
  return (
    <React.Fragment>
      <link rel="stylesheet" href="https://unpkg.com/higlass@1.2.6/dist/hglib.css" />
      <HiGlassComponent {... props} />
    </React.Fragment>
  );
}
