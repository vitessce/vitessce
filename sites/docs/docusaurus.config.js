const path = require('path');
module.exports = {
  title: 'Vitessce-Link',
  tagline: 'Visual integration tool for exploration of spatial single cell experiments',
  url: 'http://vitessce.io/',
  // baseUrl: `${process.env.VITESSCE_DOCS_BASE_URL}#?edit=true` || '/#?edit=true',
  baseUrl: process.env.VITESSCE_DOCS_BASE_URL || '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: true,
  organizationName: 'vitessce', // Usually your GitHub org/user name.
  projectName: 'vitessce', // Usually your repo name.
  themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },
    prism: {
      theme: require('./src/pages/_prism-light-theme.cjs.js'),
      darkTheme: require('./src/pages/_prism-dark-theme.cjs.js'),
    },
    navbar: {
      title: 'VitessceLink',
      logo: {
        href: '/',
        alt: 'Vitessce Logo',
        src: 'img/logo-v.png',
      },
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/vitessce/vitessce/edit/main/sites/docs/',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            // TODO(monorepo)
            //require.resolve('../dist/esm/index.css'),
          ],
        },
      },
    ],
  ],
  plugins: [
    './plugins/vitessce-plugin',
    './plugins/monaco-editor-plugin',
    //path.resolve(__dirname, 'plugins', 'vitessce-plugin'),
  ],
  scripts: [
    {
      src: "https://www.googletagmanager.com/gtag/js?id=UA-96954979-2",
      async: true,
    }
  ],
  clientModules: [
    require.resolve('./analytics.js'),
  ],
};
