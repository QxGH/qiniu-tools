const path = require('path');

let config = {
	publicPath: "./",
	outputDir: "dist",
	lintOnSave: false,
	runtimeCompiler: false,
	productionSourceMap: false,
	devServer: {
		host: "0.0.0.0",
		port: 8082,
		https: false,
		disableHostCheck: true
	},
	configureWebpack: {
		externals: {
			vue: "Vue",
			vuex: "Vuex",
			'vue-router': 'VueRouter',
			'axios': 'axios',
			'element-ui': 'ELEMENT'
		}
	}
};

module.exports = config;