let fs = require('fs')
let readDir = fs.readdirSync('./server/api/')
let obj = {}
let exclude = ['index.js', 'public.js'] // 排除文件
readDir.forEach(function (file) {
  if (file.endsWith('.js') && !exclude.includes(file)) {
    obj[file.replace('.js', '')] = require('./' + file)
  }
})
module.exports = obj
