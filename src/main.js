import Vue from 'vue'
import ElementUI from 'element-ui';
import VueClipboard from 'vue-clipboard2'
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/atom-one-dark.css'
 
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api'
Vue.prototype.$api = api;

Vue.use(ElementUI);
Vue.use(VueClipboard)
Vue.use(VueHighlightJS)


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
