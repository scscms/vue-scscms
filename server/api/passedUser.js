const P = require('./public')
module.exports = passedUser

// 审核用户
async function passedUser(ctx) {
  let data = ctx.request.body
  let ids = data.ids
  let msg
  if (/^\d+(,\d+)*$/.test(ids)) {
    const arr = ids.split(',')
    ids = new Array(arr.length).fill('?').join(',')
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [result] = await connection.execute(`UPDATE user SET user_type=4 where id in (${ids})`, arr)
    msg = result.affectedRows > 0 ? '' : '审核用户失败！'
    await connection.end()
  } else {
    msg = 'ID参数不合法'
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {passed: 4}
  }
}
