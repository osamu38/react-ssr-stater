import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import StringReplacePlugin from 'string-replace-webpack-plugin';
import { env, isDevelopment, isProduction } from 'servers/env';
import { joinPath } from 'servers/path';

function getPlugins(isAnalyze) {
  let plugins = [
    new webpack.IgnorePlugin(/webpack\.client\.babel/),
    new webpack.EnvironmentPlugin({ NODE_ENV: `${env}` }),
    new CleanWebpackPlugin([joinPath('dist/server.js')], {
      root: joinPath(),
    }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ];

  if (isAnalyze) {
    plugins = [
      ...plugins,
      ...[new BundleAnalyzerPlugin({ analyzerPort: 8889 })],
    ];
  }
  return plugins;
}

function getModule() {
  return {
    rules: [
      {
        test: /\.js$/,
        include: joinPath('src'),
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.json$/,
        include: joinPath('src'),
        exclude: /node_modules/,
        use: {
          loader: 'json-loader',
        },
      },
      ...(isProduction
        ? [
            {
              test: /src\/routes\.js$/,
              loader: StringReplacePlugin.replace({
                replacements: [
                  {
                    pattern: /import/,
                    replacement() {
                      return `import loadable from 'loadable-components';import`;
                    },
                  },
                  {
                    pattern: /import (.*?) from 'pages\/(.*?)';/g,
                    replacement(match, p1, p2) {
                      return `const ${p1} = loadable(() => import('pages/${p2}'));`;
                    },
                  },
                ],
              }),
            },
          ]
        : []),
    ],
  };
}

export default webpackEnv => {
  const isAnalyze = webpackEnv.analyze;

  return {
    mode: env,
    name: 'server',
    target: 'node',
    devtool: isDevelopment
      ? 'cheap-module-eval-source-map'
      : 'hidden-source-map',
    entry: ['@babel/polyfill', './src/server.js'],
    output: {
      path: joinPath('dist'),
      filename: 'server.js',
    },
    plugins: getPlugins(isAnalyze),
    module: getModule(),
    resolve: {
      extensions: ['.js', '.json'],
    },
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: true,
      __dirname: true,
    },
    externals: [
      nodeExternals({
        whitelist: [/\.(?!(?:json)$).{1,5}$/i],
      }),
    ],
  };
};
