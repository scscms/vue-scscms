// 后台路由配置
const config = require('../config')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const common = require('../common')
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

module.exports = {
  config,
  mysql,
  bcrypt,
  common,
  getClientIP,
  sendEmail
}
