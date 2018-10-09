const P = require('./public')
module.exports = updateArticle

// 新添或编辑文章
async function updateArticle (ctx) {
  const data = ctx.request.body
  let err
  const obj = {
    title: '文章标题',
    description: '文章概要',
    read_type: '阅读权限',
    content: '文章内容'
  }
  for (let key in obj) {
    if (!data[key]) {
      err = obj[key] + '不能为空！'
      break
    }
  }
  const array = [
    data.title.slice(0, 100),
    data.description.slice(0, 255),
    data.read_type >> 0,
    data.sort_id >> 0,
    data.content,
    data.article_extend
  ]
  if (!err) {
    const user = ctx.state.userInfo// 获取用户信息
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    if (data.id > 0) {
      // 编辑文章
      if (user.user_type > 2) {
        // 非管理员需要验证是否为自己的文章(同时普通管理员也可修改超管文章)
        const [rows] = await connection.execute('SELECT `id` FROM `article` where `id`=? and passed=1 and `user_id`=?', [data.id, user.id])
        if (!rows.length) {
          ctx.body = {
            success: false,
            message: '无权编辑此文章',
            data: {}
          }
          return
        }
      }
      array.push(data.id)
      const [result] = await connection.execute('UPDATE `article` SET `title`=?,`description`=?,`read_type`=?,`sort_id`=?,`content`=?,`article_extend`=? where `id`=?', array)
      err = result.affectedRows === 1 ? '' : '文章修改失败'
    } else {
      // 添加文章
      let d = new Date()
      let createTime = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
      array.push(createTime)// 添加日期
      array.push(user.user_type < 3 ? 1 : 0)// 是否通过审核
      array.push(user.id)// 用户信息
      const [result] = await connection.execute('INSERT INTO `article` (title,description,read_type,sort_id,content,article_extend,create_time,passed,user_id) VALUES (?,?,?,?,?,?,?,?,?)', array)
      err = result.affectedRows === 1 ? '' : '文章添加失败'
    }
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err,
    data: {}
  }
}
