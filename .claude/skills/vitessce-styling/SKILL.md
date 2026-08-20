---
name: vitessce-styling
description: Use when adding or modifying styles, CSS, visual appearance, or layout in Vitessce components. Covers the JSS-based makeStyles pattern, theme access, MUI component usage, and color conventions. Trigger on "add styles", "style this component", "change the appearance", "CSS", "theme colors", "use MUI", "add padding", "position an element", or any layout/visual change in a component.
---

# Styling in Vitessce

**Raw CSS is not allowed.** All styles go through `makeStyles` from `@vitessce/styles` (which
re-exports `tss-react/mui`). Do not create `.css` files or import them.

## Basic makeStyles

```js
import { makeStyles, Typography } from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  myComponentContainer: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    paddingLeft: '10px',
    paddingBottom: '10px',
  },
  myComponentLabel: {
    marginRight: '10px',
  },
}));

export function MyComponent() {
  const { classes } = useStyles();
  return (
    <div className={classes.myComponentContainer}>
      <Typography className={classes.myComponentLabel}>Hello world</Typography>
    </div>
  );
}
```

Note the double call: `makeStyles()(...)`. The first set of parens takes tss-react options.

## makeStyles keys must be globally unique

**This is enforced in CI and is the most common styling mistake.** `pnpm run check-makestyles-keys`
uses an ast-grep rule (`scripts/ast-grep-rules/makestyles-keys-*.yaml`) to collect every key of every
`makeStyles()(...)` return object across the monorepo and fails if any key appears in more than one
file. `scripts/test.sh` runs it as part of the local check.

So do not name a class `container`, `label`, `root`, or `title` — those are already taken. Prefix
keys with the component or view name (`heatmapContainer`, `layerControllerLabel`). To verify:

```bash
pnpm run check-makestyles-keys
```

It prints the conflicting key and both file paths.

## Accessing the theme

Use theme tokens for colors rather than hardcoded values — this is what enables light/dark mode:

```js
const useStyles = makeStyles()(theme => ({
  myComponentContainer: {
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
  },
}));
```

Vitessce extends the standard MUI palette with its own keys (`primaryBackground`,
`primaryForeground`, `primaryBackgroundLight`, `gridLayoutBackground`, `tooltipText`, …), defined
per light/dark theme in `packages/vit-s/src/shared-mui/styles.js`. Read that file for the current
set before inventing a token. Outside a `makeStyles` callback, get the theme with the `useTheme`
hook, also exported from `@vitessce/styles`.

## MUI components and icons

MUI components and icons are re-exported from `@vitessce/styles` so that MUI upgrades happen in one
place. Always import from there — never directly from `@mui/material` or `@mui/icons-material`:

```js
import { Typography, Button, Slider, IconButton, Tooltip } from '@vitessce/styles';
```

Icons are re-exported under their **bare MUI names**, without an `Icon` suffix, so alias them at the
import site (this is the house convention):

```js
import { Close as CloseIcon, Settings as SettingsIcon } from '@vitessce/styles';
```

`LinkIcon` is the one exception — `Link` was already taken by the MUI `Link` component, so it is
exported pre-suffixed. If the icon you want isn't re-exported yet, add the `export { default as X }
from '@mui/icons-material/X';` line to `packages/styles/src/index.ts` rather than importing MUI
directly.

Reuse MUI components when possible rather than writing custom HTML elements with manual styles.

## Color conventions

- Prefer `[r, g, b]` array format internally (e.g., `[255, 0, 0]`)
- Only convert to CSS color strings (e.g., `'rgb(255,0,0)'`) at the point of rendering
- This keeps colors compatible with deck.gl layer props, which also use `[r, g, b]`
