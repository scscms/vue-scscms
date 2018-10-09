const P = require('./public')
module.exports = findPassword

// 激活找回密码
async function findPassword (ctx) {
  const data = ctx.params
  let code = 'succeed'
  if (data.email && data.code) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT `user_extend` FROM `user` where `user_email`=?', [data.email])
    if (rows.length) {
      let extend = {}
      try {
        extend = JSON.parse(rows[0].user_extend)
      } catch (e) {
      }
      if (extend.password && extend.password.replace(/\//g, '') === data.code) {
        let password = extend.password
        delete extend.password
        const [list] = await connection.execute('UPDATE `user` SET `pass_word`=?,`user_extend`=? where `user_email`=?', [password, JSON.stringify(extend), data.email])
        code = list.affectedRows === 1 ? 'success' : 'failed'
      } else {
        code = 'errCode'
      }
    } else {
      code = 'nobody'
    }
    await connection.end()
  } else {
    code = 'lack'
  }
  ctx.redirect(P.common.web_domain + '/Login?find=' + code)
}
