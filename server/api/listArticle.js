const P = require('./public')
module.exports = listArticle

// 文章列表
async function listArticle (ctx) {
  const data = ctx.request.body
  let pageSize = Math.abs(data.pageSize >> 0) || 10// 分页率
  let page = Math.abs(data.page >> 0) || 1// 当前页码
  const arr = []
  let querying = P.getArticleQuery(data,arr)
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `article`' + querying.replace('and', 'where'), arr)
  const total = rows[0].total// 总数量
  const pages = Math.ceil(total / pageSize)
  if (page > pages) {
    page = Math.max(1, pages)// 以防没数据
  }
  querying += ' order by a.id desc LIMIT ?, ?'
  arr.push((page - 1) * pageSize, pageSize)
  const [list] = await connection.execute('SELECT a.id,a.title,a.sort_id,a.user_id,a.passed,a.read_type,a.create_time,u.`user_name`,s.`sort_name` FROM article as a LEFT JOIN user as u on a.user_id = u.id LEFT JOIN sort as s on a.sort_id = s.id' + querying.replace('and', 'where'), arr)
  await connection.end()
  ctx.body = {
    success: true,
    message: '',
    data: {
      page, total, data: list
    }
  }
}
