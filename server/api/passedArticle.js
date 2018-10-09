const P = require('./public')
module.exports = passedArticle

// 审核文章
async function passedArticle (ctx) {
  const data = ctx.request.body
  const passed = data.passed === '1' ? 1 : 0
  let ids = data.ids
  let msg
  if (/^\d+(,\d+)*$/.test(ids)) {
    const arr = ids.split(',')
    ids = new Array(arr.length).fill('?').join(',')
    arr.unshift(passed)
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [result] = await connection.execute(`UPDATE article SET passed=? where id in (${ids})`, arr)
    msg = result.affectedRows > 0 ? '' : '审核文章失败！'
    await connection.end()
  } else {
    msg = 'ID参数不合法'
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: { passed }
  }
}
