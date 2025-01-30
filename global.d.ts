import type { Theme } from '@mui/material/styles';

declare module '@mui/material-pigment-css' {
    interface ThemeArgs {
      theme: Theme;
    }

}

declare module '@mui/material/styles' {
  interface Palette {
    gridLayoutBackground: string;
    tooltipText: string;
  }

  interface BaseTheme {
    palette: Palette;
  }
}

declare global {
  namespace React {
    interface HTMLAttributes<T> {
      sx?: SxProps<Theme>;
    }
    interface SVGProps<T> {
      sx?: SxProps<Theme>;
    }
  }
}
