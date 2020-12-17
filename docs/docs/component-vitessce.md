---
id: component-vitessce
title: Vitessce Component
slug: /component-vitessce
---

The top-level `<Vitessce/>` component can be used as one would any other React component.

```js
import React from 'react';
import { Vitessce } from 'vitessce';
import myViewConfig from './my-view-config';
import 'vitessce/dist/es/production/static/css/index.css';
import './index.css';

export default function MyApp() {
    return (
        <Vitessce
            config={myViewConfig}
            height={800}
            theme="light"
        />
    );
}
```

## Required props

### `config`
- Type: `object`

This parameter takes a Vitessce view config as a JSON object. Please visit our [view config](./view-config-json) documentation pages for more details.

### `height`
- Type: `number`

The height in pixels that the Vitessce grid will fill on the page.

## Optional props

### `theme`
- Type: `string`

The theme, used for styling the components. By default, `dark`.

|Value| Notes|
|-----|------|
| `light` | The light theme |
| `dark` | The dark theme |

### `onConfigChange`
- Type: `function`

A callback for view config updates.

### `validateOnConfigChange`
- Type: `boolean`

Whether to validate
against the view config schema when publishing changes. Use for debugging
purposes only, as this has a performance impact.