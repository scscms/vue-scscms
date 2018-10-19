// 后台路由配置
const config = require('../config')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const common = require('../common').default
const nodemailer = require('nodemailer')

// 公用：获取客户端IP
function getClientIP (ctx) {
  let req = ctx.request
  let ip = ctx.ip ||
    req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || ''
  let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/)
  return arr ? arr[0] : ''
}

// 公用：发送邮件
function sendEmail (email, title, body) {
  return new Promise(resolve => {
    let transporter = nodemailer.createTransport(config.emailServer)
    let mailOptions = {
      from: common.web_name + '<' + config.emailServer.auth.user + '>',
      to: email,
      subject: title,
      html: body
    }
    transporter.sendMail(mailOptions, err => {
      resolve(err || null)
    })
  })
}

// 搜索文件条件
function getArticleQuery(data, arr) {
  let querying = ''
  if (data.title) {
    querying += ' and title like ?'
    arr.push('%' + data.title + '%')
  }
  if (/^\d+$/.test(data.sort_id)) {
    querying += ' and sort_id=?'
    arr.push(data.sort_id >> 0)
  }
  if (/^[1-4]$/.test(data.read_type)) {
    querying += ' and read_type=?'
    arr.push(data.read_type >> 0)
  }
  return querying
}

module.exports = {
  config,
  mysql,
  bcrypt,
  common,
  getClientIP,
  sendEmail,
  getArticleQuery
}
