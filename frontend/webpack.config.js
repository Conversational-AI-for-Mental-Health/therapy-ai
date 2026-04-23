// Webpack configuration for the Therapy AI frontend application. This configuration sets up the entry point, output, module resolution, loaders for TypeScript and CSS, and plugins for HTML generation and environment variable management. It also configures the development server with hot reloading and proxy settings for API requests during development.
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: "./src/index.tsx",


    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname,"src")
      },
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: require.resolve("ts-loader"),
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: "asset/resource",
        }
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
      }),

      new dotenv({
        path: "./.env",
      }),

      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isDevelopment ? "development" : "production",
        ),
      }),
    ],

    devServer: {
      port: 8080,
      historyApiFallback: true,
      hot: true,
      open: true,
      proxy: isDevelopment
        ? [
            {
              context: ["/api", "/socket.io"],
              target: "http://localhost:3000",
              ws: true,
              changeOrigin: true,
            },
          ]
        : undefined,
    },
  };
};
