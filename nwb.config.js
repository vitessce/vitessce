module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'vitessce',
      externals: {
        react: 'React',
        openseadragon: 'openseadragon',
        // TODO: Confirm that our package is not bloated.
      },
    },
  },
  webpack: {
    html: {
      template: 'demo/src/index.html',
    },
  },
};
