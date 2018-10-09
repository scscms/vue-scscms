const P = require('./public')
module.exports = active

// 用户激活
async function active (ctx) {
  const data = ctx.params
  let code = 'succeed'
  if (data.name && data.code) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT id,pass_word FROM `user` where `user_name`=? and `user_type`=?', [data.name, 0])
    if (rows.length) {
      if (rows[0].pass_word.replace(/\//g, '') !== data.code) {
        code = 'errCode'
      } else {
        const [list] = await connection.execute('UPDATE `user` SET `user_type`=? where `id`=?', [4, rows[0].id])
        code = list.affectedRows === 1 ? 'success' : 'failed'
      }
    } else {
      code = 'nobody'
    }
    await connection.end()
  } else {
    code = 'lack'
  }
  ctx.redirect(P.common.web_domain + '/Login?active=' + code)
}
