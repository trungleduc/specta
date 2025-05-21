// Copyright (c) Jupyter Development Team.
// Copyright (c) Voila Development Team.
// Distributed under the terms of the Modified BSD License.

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge').default;
const { ModuleFederationPlugin } = webpack.container;
const Build = require('@jupyterlab/builder').Build;
const baseConfig = require('@jupyterlab/builder/lib/webpack.config.base');

const data = require('./package.json');

const NAME = 'specta';
/**
 * A helper for filtering deprecated webpack loaders, to be replaced with assets
 */
function filterDeprecatedRule(rule) {
  if (typeof rule.use === 'string' && rule.use.match(/^(file|url)-loader/)) {
    return false;
  }
  return true;
}

baseConfig.module.rules = [
  {
    test: /\.json$/,
    use: ['json-loader'],
    type: 'javascript/auto'
  },
  ...baseConfig.module.rules.filter(filterDeprecatedRule)
];

const names = Object.keys(data.dependencies).filter(name => {
  const packageData = require(path.join(name, 'package.json'));
  return packageData.jupyterlab !== undefined;
});

// Ensure a clear build directory.
const buildDir = path.resolve(__dirname, 'build');
if (fs.existsSync(buildDir)) {
  fs.removeSync(buildDir);
}
fs.ensureDirSync(buildDir);

// Copy files to the build directory
const libDir = path.resolve(__dirname, 'lib');

fs.copySync(libDir, buildDir);

const distRoot = path.resolve(__dirname, 'specta', 'static', 'build');

const extras = Build.ensureAssets({
  packageNames: names,
  output: buildDir,
  staticOutput: path.resolve(distRoot)
});

if (process.env.NODE_ENV === 'production') {
  baseConfig.mode = 'production';
}

// Make a bootstrap entrypoint

const entryPoint = `./build/bootstrap.js`;
fs.copySync('./jupyterlite-script/bootstrap.js', entryPoint);

const publicPath = `./build/publicpath.js`;
fs.copySync('./jupyterlite-script/publicpath.js', publicPath);
const allEntryPoints = {};
allEntryPoints[`${NAME}/bundle`] = entryPoint;
allEntryPoints[`${NAME}/publicpath`] = publicPath;
console.log('#############, allEntryPoints', allEntryPoints);
module.exports = [
  merge(baseConfig, {
    mode: 'development',
    devtool: 'source-map',
    resolve: {
      fallback: {
        util: false
      }
    },
    entry: allEntryPoints,
    output: {
      path: distRoot,
      library: {
        type: 'var',
        name: ['_JUPYTERLAB', 'CORE_OUTPUT']
      },
      filename: '[name].js',
      chunkFilename: 'specta_[name].js',
      assetModuleFilename: 'specta_[name][ext][query]',
    },
    module: {
      rules: [
        // just keep the woff2 fonts from fontawesome
        {
          test: /fontawesome-free.*\.(svg|eot|ttf|woff)$/,
          loader: 'ignore-loader'
        },
        {
          test: /\.(jpe?g|png|gif|ico|eot|ttf|map|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource'
        },
        {
          resourceQuery: /text/,
          type: 'asset/resource',
          generator: {
            filename: '[name][ext]'
          }
        }
      ]
    },
    optimization: {
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          jlab_core: {
            test: /[\\/]node_modules[\\/]@(jupyterlab|lumino(?!\/datagrid))[\\/]/,
            name: 'jlab_core'
          }
        }
      }
    },
    plugins: [
      new ModuleFederationPlugin({
        library: {
          type: 'var',
          name: ['_JUPYTERLAB', 'CORE_LIBRARY_FEDERATION']
        },
        name: 'CORE_FEDERATION',
        shared: {
          ...data.dependencies
        }
      })
    ]
  })
].concat(extras);
