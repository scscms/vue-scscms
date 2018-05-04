import Vue from 'vue'
import Vuex from 'vuex'
import userInfo from './userInfo'
Vue.use(Vuex)
module.exports = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    userInfo
  }
})
