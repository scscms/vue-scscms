const P = require('./public')
module.exports = register

// 用户注册
async function register (ctx) {
  const data = ctx.request.body
  let msg
  let success = false
  if (!P.common.name_reg.test(data.user_name)) {
    msg = P.common.name_txt
  } else if (!P.common.pass_reg.test(data.pass_word)) {
    msg = P.common.pass_txt
  } else if (!P.common.email_reg.test(data.user_email)) {
    msg = P.common.email_txt
  } else {
    // 先检查是否占用帐号
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT id FROM `user` where `user_name`=?', [data.user_name])
    if (rows.length > 0) {
      msg = '帐号已经被占用！'
    } else {
      const [rows] = await connection.execute('SELECT id FROM `user` where `user_email`=?', [data.user_email])
      if (rows.length > 0) {
        msg = '邮箱已经被占用！'
      } else {
        data.pass_word = P.bcrypt.hashSync(data.pass_word, P.bcrypt.genSaltSync(10))
        const result = await connection.execute('INSERT INTO `user` (user_name,pass_word,create_time,login_ip,user_email) VALUES (?,?,?,?,?)', [data.user_name, data.pass_word, new Date().toLocaleString(), P.getClientIP(ctx), data.user_email])
        success = result[0].affectedRows === 1
        msg = success ? '' : '写入数据库失败'
        if (success) {
          // 发送激活邮件
          let link = `${P.common.web_domain}/api/active/${data.user_name}/${data.pass_word.replace(/\//g, '')}`
          let body = `您好：${data.user_name} <br/>欢迎注册【${P.common.web_name}】网站，请点击<a href="${link}" target="_blank">${link}</a>链接进行激活您的帐号！<p><img src="http://www.scscms.com/images/whiteSCS.png" /></p>`
          let result = await P.sendEmail(data.user_email, P.common.web_name + '【帐号激活】', body)
          if (result) {
            await connection.end()
            ctx.body = {
              success: true,
              data: { emailErr: true },
              message: ''
            }
            return
          }
        }
      }
    }
    await connection.end()
  }
  ctx.body = {
    success: success,
    data: {},
    message: msg
  }
}
