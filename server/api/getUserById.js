const P = require('./public')
module.exports = getUserById

// 获取用户信息
async function getUserById (ctx) {
  let id = ctx.request.body.id >> 0
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [list] = await connection.execute('SELECT * FROM user where id=?', [id])
  const success = list.length === 1
  await connection.end()
  ctx.body = {
    success,
    message: success ? '' : '查无此用户',
    data: success ? list[0] : {}
  }
}
