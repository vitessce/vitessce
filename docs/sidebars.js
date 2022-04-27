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
        'entity-types',
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
      type: 'category',
      label: 'Data Preparation',
      items: [
        'data-file-types',
        'data-hosting'
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
        'dev-add-component',
        'dev-plugins',
        'troubleshooting',
        'upgrade-v1-to-v2',
      ],
    },
    {
      type: 'doc',
      id: 'roadmap',
    },
    {
      type: 'doc',
      id: 'about',
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
