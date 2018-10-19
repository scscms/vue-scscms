module.exports = {
  baseUrl: '/',
  outputDir: 'dist',
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
