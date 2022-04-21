module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'introduction'
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
        'platforms'
      ],
    },
    {
      type: 'category',
      label: 'View Configs',
      items: [
        'view-config-json',
        'view-config-js',
        'constants',
        'troubleshooting'
      ],
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
        'js-react-vitessce',
      ],
    },
    {
      type: 'category',
      label: 'Developer Docs',
      items: [
        'dev-overview',
        'dev-add-component',
        'dev-plugins'
      ],
    },
    {
      type: 'doc',
      id: 'roadmap'
    },
    {
      type: 'doc',
      id: 'about'
    } 
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
