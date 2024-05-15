import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

let fs;
if (process.env.NODE_ENV !== "development") {
  fs = require("fs");
}

function getElectronPath() {
  const { app } = require("electron");
  const isDev = require("electron-is-dev");

  if (isDev) {
    return app.getAppPath();
  } else {
    return app.getPath("exe");
  }
}

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

export const rendererConfig: Configuration = {
  entry: "./src/index.ts",
  module: {
    rules,
  },
  externals: {
    electron: "commonjs electron",
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
    },
  },
};
