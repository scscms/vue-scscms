const P = require('./public')
module.exports = listUser

// 用户列表
async function listUser (ctx) {
  let data = ctx.request.body
  let pageSize = Math.abs(data.pageSize >> 0) || 10// 分页率
  let page = Math.abs(data.page >> 0) || 1// 当前页码
  const arr = []
  let querying = ''
  if (data.user_name) {
    querying += ' and user_name like ?'
    arr.push('%' + data.user_name + '%')
  }
  if (data.user_email) {
    querying += ' and user_email like ?'
    arr.push('%' + data.user_email + '%')
  }
  if (/^[1-4]$/.test(data.user_type)) {
    querying += ' and user_type=?'
    arr.push(data.user_type >> 0)
  }
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `user`' + querying.replace('and', 'where'), arr)
  const total = rows[0].total// 总数量
  const pages = Math.ceil(total / pageSize)
  if (page > pages) {
    page = Math.max(1, pages)// 以防没数据
  }
  querying += ' order by id desc LIMIT ?, ?'
  arr.push((page - 1) * pageSize, pageSize)
  const [list] = await connection.execute('SELECT * FROM `user`' + querying.replace('and', 'where'), arr)
  await connection.end()
  list.forEach(obj => {
    obj.user_email = '****' + obj.user_email.slice(4)// 过滤邮箱地址
    obj.user_pass = ''
  })
  ctx.body = {
    success: true,
    data: {
      page, total, data: list
    }
  }
}
