import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import userInfo from './userInfo'
module.exports = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        userInfo
    }
});
