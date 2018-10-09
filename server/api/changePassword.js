const P = require('./public')
module.exports = changePassword

// 修改密码
async function changePassword (ctx) {
  const data = ctx.request.body
  let err
  const obj = {
    old_password: '旧密码',
    pass_word: '新密码',
    pass_words: '确认密码'
  }
  for (let key in obj) {
    if (!P.common.pass_reg.test(data[key])) {
      err = obj[key] + '格式不正确！'
      break
    }
  }
  if (!err && data.old_password === data.pass_words) {
    err = '旧密码不能与新密码相同！'
  } else if (!err && data.pass_word !== data.pass_words) {
    err = '新密码与确认密码不相同！'
  }
  if (!err) {
    const user = ctx.state.userInfo// 获取用户信息
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT `pass_word` FROM `user` where `id`=?', [user.id])
    if (user.id === 9) {
      err = '此帐号禁止修改密码！'
    } else if (rows.length && P.bcrypt.compareSync(data.old_password, rows[0].pass_word)) {
      const password = P.bcrypt.hashSync(data.pass_word, P.bcrypt.genSaltSync(10))// 加密新密码
      const result = await connection.execute('update `user` set `pass_word`=? where `id`=?', [password, user.id])
      err = result.affectedRows === 0 ? '修改密码失败！' : ''
    } else {
      err = '旧密码不正确！'
    }
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err,
    data: {}
  }
}
