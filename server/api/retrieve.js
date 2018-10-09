const P = require('./public')
module.exports = retrieve

// 找回密码
async function retrieve (ctx) {
  const data = ctx.request.body
  let err
  const obj = {
    user_email: '邮箱',
    pass_word: '新密码',
    pass_words: '确认密码'
  }
  for (let key in obj) {
    if (!P.common[key === 'user_email' ? 'email_reg' : 'pass_reg'].test(data[key])) {
      err = obj[key] + '格式不正确！'
      break
    }
  }
  if (!err && data.pass_word !== data.pass_words) {
    err = '新密码与确认密码不相同！'
  }
  if (!err) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT `user_name`,`user_extend` FROM `user` where `user_email`=?', [data.user_email])
    if (rows.length) {
      let extend = {}
      try {
        extend = JSON.parse(rows[0].user_extend || '{}')
      } catch (e) {
      }
      extend.password = P.bcrypt.hashSync(data.pass_word, P.bcrypt.genSaltSync(10))// 加密新密码
      const [result] = await connection.execute('UPDATE `user` set `user_extend`=? where `user_email`=?', [JSON.stringify(extend), data.user_email])
      if (result.affectedRows === 1) {
        // 发激活邮件
        let link = `${P.common.web_domain}/api/findPassword/${data.user_email}/${extend.password.replace(/\//g, '')}`
        let body = `您好：${rows[0].user_name} <br/>欢迎使用【${P.common.web_name}】网站密码找回功能，请点击<a href="${link}" target="_blank">${link}</a>链接进行重设您的新密码为：【${data.pass_word}】！<p><img src="http://www.scscms.com/images/whiteSCS.png" /></p>`
        let result = await P.sendEmail(data.user_email, P.common.web_name + '【密码找回】', body)
        if (result) {
          await connection.end()
          ctx.body = {
            success: true,
            data: { findErr: true },
            message: ''
          }
          return
        }
      } else {
        err = '找回密码失败！'
      }
    } else {
      err = '邮箱不正确！'
    }
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err,
    data: {}
  }
}
