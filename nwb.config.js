module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'vitessce',
      externals: {
        react: 'React',
        'react-dom': 'ReactDom',
        higlass: 'HiGlass',
        'pixi.js': 'PIXI',
      },
    },
  },
  webpack: {
    html: {
      template: 'demo/src/index.html',
    },
  },
};
