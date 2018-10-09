const P = require('./public')
module.exports = getArticleById

// 获取文章详情（管理员获取所有；会员获取自己的或者是审核通过的）
async function getArticleById (ctx) {
  const data = ctx.request.body
  let id = data.id >> 0
  let msg
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [list] = await connection.execute('SELECT a.*,u.`user_name`,s.`sort_name` FROM article as a LEFT JOIN user as u on a.user_id = u.id LEFT JOIN sort as s on a.sort_id = s.id where a.id=?', [id])
  const obj = list[0]
  if (list.length === 1) {
    const user = ctx.state.userInfo
    obj.xx = JSON.stringify(user)
    if (user.user_type > 2 && user.id !== obj.user_id) {
      if (obj.passed === 0) {
        obj.content = '<div class="no_access">文章仍在审核中<d>'
      } else if (user.user_type > obj.read_type) {
        obj.content = '<div class="no_access">您无权查看此内容<d>'
      }
    }
  } else {
    msg = '查无此文章'
  }
  // 扩展上一条下一条数据
  let [prev] = await connection.execute('SELECT `id`,`title` FROM article where id<? order by id desc limit 1', [id])
  let [next] = await connection.execute('SELECT `id`,`title` FROM article where id>? order by id asc limit 1', [id])
  obj.prev = prev.length ? prev[0] : {}
  obj.next = next.length ? next[0] : {}
  await connection.end()
  ctx.body = {
    success: !msg,
    message: msg,
    data: !msg ? obj : {}
  }
}
