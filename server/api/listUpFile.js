const P = require('./public')
module.exports = listUpFile

// 上传文件列表
async function listUpFile (ctx) {
  const data = ctx.request.body
  let pageSize = Math.abs(data.pageSize >> 0) || 10
  let page = Math.abs(data.page >> 0) || 1// 当前页码
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `upload`', [])
  const total = rows[0].total// 总数量
  const pages = Math.ceil(total / pageSize)
  if (page > pages) {
    page = Math.max(1, pages)// 以防没数据
  }
  console.log((page - 1) * pageSize, page * pageSize)
  const [list] = await connection.execute('SELECT a.*,u.`user_name` FROM upload as a LEFT JOIN user as u on a.user_id = u.id LIMIT ?, ?', [(page - 1) * pageSize, pageSize])
  await connection.end()
  list.forEach(obj => {
    obj.full_path = P.common.web_domain + obj.file_path.replace(/\\/g, '/').replace('dist/', '/')
  })
  ctx.body = {
    success: true,
    message: '',
    data: {
      page, total, data: list
    }
  }
}
