const P = require('./public')
module.exports = batchDelSort

// 批量删除分类
async function batchDelSort (ctx) {
  const data = ctx.request.body
  let result = {}
  let arr = data.ids.split(',')
  if (/^\d+(,\d+)*$/.test(data.ids)) {
    let ids = arr.map(() => '?').join(',')
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [list] = await connection.execute(`DELETE from sort where id in(${ids})`, arr)
    result = list
    await connection.end()
  }
  let affected = result.affectedRows === arr.length
  ctx.body = {
    success: affected,
    message: affected ? '' : `ids:${data.ids}分类删除失败！`,
    data: {}
  }
}
