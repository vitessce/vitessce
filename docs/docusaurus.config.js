module.exports = {
  title: 'Vitessce',
  tagline: 'Visual integration tool for exploration of spatial single cell experiments',
  url: 'http://vitessce.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'vitessce', // Usually your GitHub org/user name.
  projectName: 'vitessce', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Vitessce',
      logo: {
        alt: 'Vitessce Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'demos/',
          label: 'Demos',
          position: 'left',
        },
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'JavaScript Docs',
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
        {to: 'blog', label: 'Blog', position: 'right'},
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
              to: 'docs/',
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
          title: 'More',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/vitessce',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/vitessce/vitessce/discussions',
            },
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
