const P = require('./public')
module.exports = deleteArticle

// 管理员删除文件或会员删除自己的
async function deleteArticle (ctx) {
  const data = ctx.request.body
  let ids = data.ids
  let msg
  if (/^\d+(,\d+)*$/.test(ids)) {
    const arr = ids.split(',')
    let sql = `DELETE from article where id in (${arr.map(() => '?').join(',')})`
    const user = ctx.state.userInfo
    if (user.user_type > 2) {
      sql += ' and user_id=?'// 会员只能删除自己的
      arr.push(user.id >> 0)
    }
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [result] = await connection.execute(sql, arr)
    msg = result.affectedRows > 0 ? '' : '删除文章失败！'
    await connection.end()
  } else {
    msg = 'ID参数不合法'
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {}
  }
}
