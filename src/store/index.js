import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    blackTheme: false
  },
  mutations: {
    CHANGE_THEME(state) {
      state.blackTheme = !state.blackTheme;
    }
  },
  actions: {
  },
  modules: {
  }
})
