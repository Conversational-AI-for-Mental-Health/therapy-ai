const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: "./src/index.tsx",

    // Output configuration remains the same...
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },

    // Resolve extensions remains the same...
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    module: {
      rules: [
        // FIX: Use require.resolve() to guarantee Webpack finds the hoisted ts-loader
        {
          test: /\.tsx?$/,
          use: {
            loader: require.resolve("ts-loader"),
          },
          exclude: /node_modules/,
        },
        // Rule for handling CSS files (add if not present)
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", 'postcss-loader'],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
      }),

      // Rely solely on dotenv-webpack to load variables like REACT_APP_API_URL
      new dotenv({
        path: "./.env",
      }),

      // Define NODE_ENV explicitly to be consumed by React/JS code
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
