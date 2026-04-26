const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  configureWebpack: {
    devtool: 'source-map', // Must be enabled
  },
  transpileDependencies: true,
  devServer: {
    server: 'http',
    host: 'localhost',
    hot: true,
    port: 8080, // Specify a custom port if needed
  },
})