const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')

module.exports = defineConfig({
  configureWebpack: {
    devtool: 'source-map', // Must be enabled
  },
  transpileDependencies: true,
  devServer: {
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync('./certs/localhost-key.pem'),
        cert: fs.readFileSync('./certs/localhost.pem'),
      },
    },
    host: 'localhost',
    hot: true,
    port: 8080, // Specify a custom port if needed
  },
})