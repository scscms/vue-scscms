const P = require('./public')
module.exports = listSort

// 分类列表
async function listSort (ctx) {
  const data = ctx.request.body
  let sql = 'SELECT s.*,a.counts from `sort` as s LEFT JOIN (SELECT sort_id,count(*) as counts FROM `article` GROUP BY sort_id) as a on a.sort_id = s.id'
  let arr = []
  if (data.type) {
    sql += ' where s.sort_type = ?'
    arr.push(data.type)
  }
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [list] = await connection.execute(sql, arr)
  await connection.end()
  ctx.body = {
    success: true,
    message: '',
    data: {
      data: list
    }
  }
}
