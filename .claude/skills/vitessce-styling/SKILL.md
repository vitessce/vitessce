---
name: vitessce-styling
description: Use when adding or modifying styles, CSS, visual appearance, or layout in Vitessce components. Covers the JSS-based makeStyles pattern, theme access, MUI component usage, and color conventions. Trigger on "add styles", "style this component", "change the appearance", "CSS", "theme colors", "use MUI", "add padding", "position an element", or any layout/visual change in a component.
---

# Styling in Vitessce

**Raw CSS is not allowed.** All styles use JSS via `makeStyles` from `@vitessce/styles`. Do not create `.css` files or import them.

## Basic makeStyles

```js
import { makeStyles, Typography } from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  container: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    paddingLeft: '10px',
    paddingBottom: '10px',
  },
  label: {
    marginRight: '10px',
  },
}));

export function MyComponent() {
  const { classes } = useStyles();
  return (
    <div className={classes.container}>
      <Typography className={classes.label}>Hello world</Typography>
    </div>
  );
}
```

## Accessing the Theme

Use theme tokens for colors rather than hardcoded values — this is what enables light/dark mode:

```js
const useStyles = makeStyles()(theme => ({
  container: {
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
  },
}));
```

## MUI Components and Icons

MUI components and icons are re-exported from `@vitessce/styles`. Always import from there — do not import directly from `@mui/material` or `@mui/icons-material`:

```js
import { Typography, Button, Slider, IconButton, Tooltip } from '@vitessce/styles';
import { CloseIcon, SettingsIcon } from '@vitessce/styles';
```

Reuse MUI components when possible rather than writing custom HTML elements with manual styles.

## Color Conventions

- Prefer `[r, g, b]` array format internally (e.g., `[255, 0, 0]`)
- Only convert to CSS color strings (e.g., `'rgb(255,0,0)'`) at the point of rendering
- This keeps colors compatible with deck.gl layer props, which also use `[r, g, b]`
