module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'introduction',
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'components',
        'data-types-file-types',
        'coordination',
        'coordination-types',
        'platforms',
      ],
    },
    {
      type: 'doc',
      id: 'view-config-json',
    },
    {
      type: 'doc',
      id: 'default-config-json',
    },
    {
      type: 'category',
      label: 'Data Preparation',
      items: [
        'data-file-types',
        'data-hosting',
        'data-troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'JavaScript API',
      items: [
        'js-overview',
        'view-config-js',
        'constants',
        'js-react-vitessce',
        'dev-plugins',
        'troubleshooting',
        'upgrade-guide',
      ],
    },
    {
      type: 'doc',
      id: 'showcase',
    },
    {
      type: 'doc',
      id: 'about',
    },
    {
      type: 'link',
      label: 'Roadmap',
      href: 'https://github.com/orgs/vitessce/projects/7',
    },
    {
      type: 'link',
      label: 'Changelog',
      href: 'https://github.com/vitessce/vitessce/tree/main/CHANGELOG.md',
    },
  ],
  tutorials: [
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: [
        'tutorials',
        'tutorial-visium',
        'tutorial-gh-pages',
        'tutorial-plugin-view-type',
        'tutorial-plugin-coordination-type',
        'tutorial-plugin-file-type',
      ],
    },
  ],
};
