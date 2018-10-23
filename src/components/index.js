import Vue from 'vue'

let array = ['./index.js', './public.js']
const requireComponent = require.context('.', false, /\.vue$/)
requireComponent.keys().forEach(fileName => {
  if (!array.includes(fileName)) {
    const componentConfig = requireComponent(fileName)
    const componentName = fileName.replace(/.+?(\w)(\w+)\.vue/i, (s, a, b) => {
      return a.toUpperCase() + b
    })
    Vue.component(componentName, componentConfig.default || componentConfig)
  }
})
