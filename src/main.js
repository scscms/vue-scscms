import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import './assets/style.css'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import store from './store/index'
// 本地存储
import utils from './utils/index'
import routes from './router.js'

// 页面顶部进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(Vuex)
Vue.use(ElementUI, { size: 'small' })
Vue.use(VueRouter)

const router = new VueRouter(routes)

router.beforeEach((to, from, next) => {
  window.scroll(0, 0)
  NProgress.start()
  utils.storage.get('userInfo', obj => {
    if (to.meta.verify && !obj.token) {
      Vue.prototype.$message({
        'message': '无权访问，请先登录！', 'type': 'warning'
      })
      next({ path: '/login', query: { url: to.fullPath } })// 无权访问
    } else if (to.meta.grade && to.meta.grade < obj.userInfo.user_type) {
      Vue.prototype.$message({
        'message': '无权访问此页面！', 'type': 'warning'
      })
      NProgress.done()
    } else if (to.path === '/login' && obj.token) {
      next({ path: '/article/list' })// 已经登录不准进入登录界面
    } else {
      next()
    }
  })
})

router.afterEach(() => {
  NProgress.done()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
