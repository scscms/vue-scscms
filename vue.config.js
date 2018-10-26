module.exports = {
  baseUrl: '/',
  outputDir: 'dist',
  configureWebpack: {
    externals: {
      vue: "Vue",
      vuex: "Vuex",
      "vue-router": "VueRouter",
      "element-ui": "ELEMENT"
    }
  },
  devServer: {
    proxy: {
      '/api': {
        //target: 'http://103.27.4.146:3001',
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}
