const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const settings = require("./build-settings.cjs");

module.exports = (_env, argv) => ({
  mode: argv.mode,
  target: ["web", "es5"],
  entry: settings.entry,
  output: {
    path: path.resolve(__dirname, argv.mode === "development" ? ".webpack-dev" : "dist"),
    filename: "assets/app.js",
    publicPath: "auto",
    clean: true,
    environment: { arrowFunction: false, const: false, destructuring: false, dynamicImport: false },
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"],
    alias: {
      vue$: require.resolve("vue/dist/vue.runtime.esm.js"),
      "core-js": path.dirname(require.resolve("core-js/package.json")),
    },
  },
  stats: "errors-warnings",
  module: {
    rules: [
      { test: /\.vue$/, loader: "vue-loader" },
      {
        test: /\.(?:m?js|ts)$/,
        // 真机开发客户端和库依赖同样需要降级；core-js 本身已经提供旧内核实现。
        exclude: /node_modules[\\/]core-js[\\/]/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            sourceType: "unambiguous",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: settings.legacyTarget,
                  modules: false,
                },
              ],
              ["@babel/preset-typescript", { ignoreExtensions: true }],
            ],
          },
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      templateContent: () =>
        require("node:fs")
          .readFileSync(path.resolve(__dirname, "index.html"), "utf8")
          .replace(/<script type="module" src="\/src\/main.ts"><\/script>/, ""),
    }),
  ],
  devtool: argv.mode === "development" ? "source-map" : false,
  devServer: {
    host: "0.0.0.0",
    port: settings.port,
    allowedHosts: "all",
    headers: { "X-vuepg-project": settings.projectId },
    hot: true,
    liveReload: true,
    client: { overlay: false, logging: "warn" },
    devMiddleware: { writeToDisk: true },
  },
});
