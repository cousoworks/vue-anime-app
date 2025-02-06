const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './' // Esto evita problemas de rutas en GitHub Pages
});
