import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

import { app } from 'electron';
import isDev from 'electron-is-dev';

let fs;
if (!isDev) {
  fs = require('fs');
}

function getElectronPath() {
  if (isDev) {
    return app.getAppPath();
  } else {
    return app.getPath('exe');
  }
}

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
    },
  },
};
