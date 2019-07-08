module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'vitessce',
      externals: {
        react: 'React',
      },
    },
  },
  babel: {
    presets: [
      [
        'env',
        {
          exclude: ['transform-es2015-classes'],
        },
      ],
    ],
  },
  webpack: {
    html: {
      template: 'demo/src/index.html',
    },
    rules: {
      svg: {
        loader: '@svgr/webpack',
      },
    },
  },
};
