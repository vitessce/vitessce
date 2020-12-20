module.exports = {
  title: 'Vitessce',
  tagline: 'Visual integration tool for exploration of spatial single cell experiments',
  url: 'http://vitessce.io',
  baseUrl: process.env.VITESSCE_DOCS_BASE_URL || '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'vitessce', // Usually your GitHub org/user name.
  projectName: 'vitessce', // Usually your repo name.
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: ['docusaurus-plugin-sass'],
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    navbar: {
      title: 'Vitessce',
      logo: {
        href: '/index.html',
        alt: 'Vitessce Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'app/index.html',
          label: 'App',
          position: 'left',
        },
        {
          to: 'demos/index.html',
          label: 'Demos',
          position: 'left',
        },
        {
          to: 'docs/index.html',
          activeBasePath: 'docs',
          label: 'Core Docs',
          position: 'left',
        },
        {
          href: 'https://vitessce.github.io/vitessce-python/',
          label: 'Python Docs',
          position: 'left',
        },
        {
          href: 'https://vitessce.github.io/vitessce-r/',
          label: 'R Docs',
          position: 'left',
        },
        /* // TODO: uncomment when the blog contains something interesting
        {to: 'blog', label: 'Blog', position: 'right'},
        */
        {
          href: 'https://github.com/vitessce/',
          label: 'GitHub',
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
              to: 'docs/index.html',
            },
            {
              label: 'Python',
              href: 'https://github.com/vitessce/vitessce-python',
            },
            {
              label: 'R',
              href: 'https://github.com/vitessce/vitessce-r',
            },
          ],
        },
        {
          title: 'Built with',
          items: [
            {
              label: 'Viv',
              href: 'https://github.com/hms-dbmi/viv',
            },
            {
              label: 'HiGlass',
              href: 'https://github.com/higlass/higlass',
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
      copyright: `Copyright © ${new Date().getFullYear()} Gehlenborg Lab`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/vitessce/vitessce/edit/master/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/vitessce/vitessce/edit/master/docs/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
