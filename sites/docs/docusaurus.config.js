const path = require('path');
module.exports = {
  title: 'Vitessce',
  tagline: 'Visual integration tool for exploration of spatial single cell experiments',
  url: 'http://vitessce.io',
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
    algolia: {
      appId: 'VM9PGXT4A9',
      indexName: 'vitessce',
      apiKey: process.env.ALGOLIA_API_KEY || 'none',
      contextualSearch: true,
    },
    navbar: {
      title: 'Vitessce',
      logo: {
        href: '/',
        alt: 'Vitessce Logo',
        src: 'img/logo-v.png',
      },
      items: [
        {
          href: '/#?edit=true',
          label: 'App',
          position: 'left',
        },
        {
          to: 'examples',
          label: 'Examples',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'introduction',
          label: 'Docs',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'tutorials',
          label: 'Tutorials',
          position: 'left',
        },
        {
          href: 'https://python-docs.vitessce.io/',
          label: 'For Python',
          position: 'left',
        },
        {
          href: 'https://r-docs.vitessce.io/',
          label: 'For R',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'feedback',
          label: 'Feedback',
          position: 'right',
        },
        {
          to: 'blog',
          label: 'Blog',
          position: 'right',
        },
        {
          href: 'http://ipa-reader.xyz/?text=v%C9%AAt-%C9%9Bs',
          position: 'right',
          className: 'header-pronunciation-link',
          'aria-label': 'Pronunciation',
        },
        {
          href: 'https://github.com/vitessce/',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Ecosystem',
          items: [
            {
              label: 'JavaScript',
              to: 'docs',
            },
            {
              label: 'Python',
              href: 'https://github.com/vitessce/vitessce-python',
            },
            {
              label: 'R',
              href: 'https://github.com/vitessce/vitessceR',
            },
          ],
        },
        {
          title: 'Built with',
          items: [
            {
              label: 'Viv',
              href: 'http://viv.gehlenborglab.org/',
            },
            {
              label: 'HiGlass',
              href: 'http://higlass.io',
            },
          ],
        },
        {
          title: 'Funding',
          items: [
            {
              html: 'NIH/OD Human BioMolecular Atlas Program (HuBMAP) (OT2OD026677, PI: Nils Gehlenborg)',
            },
            {
              html: 'NIH/NLM Biomedical Informatics and Data Science Research Training Program (T15LM007092, PI: Nils Gehlenborg)',
            },
            {
              html: 'Harvard Stem Cell Institute (CF-0014-17-03, PI: Nils Gehlenborg)',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="http://hidivelab.org/">HIDIVE Lab</a>.<br/> Vitessce is open source and MIT licensed. Vitessce documentation is CC BY 4.0 licensed.`,
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
