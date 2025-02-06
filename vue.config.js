const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './' // Rutas relativas para evitar errores en GitHub Pages
});
