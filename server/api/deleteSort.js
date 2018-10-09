const P = require('./public')
module.exports = deleteSort

// 删除分类
async function deleteSort (ctx) {
  const data = ctx.request.body
  let id = data.id >> 0
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [result] = await connection.execute('DELETE from `sort` where id=?', [id])
  await connection.end()
  ctx.body = {
    success: result.affectedRows === 1,
    message: result.affectedRows === 1 ? '' : `id:${id}分类删除失败！`,
    data: {}
  }
}
