const P = require('./public')
module.exports = deleteUser

// 删除用户（只可删除比自己低级的用户）
async function deleteUser (ctx) {
  const data = ctx.request.body
  let ids = data.ids
  let msg
  if (/^\d+(,\d+)*$/.test(ids)) {
    const arr = ids.split(',')
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [result] = await connection.execute(`DELETE from user where (user_type>${ctx.state.userInfo.user_type} or user_type=0) and id in (${arr.map(() => '?').join(',')})`, arr)
    msg = result.affectedRows > 0 ? '' : '删除用户失败！'
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
