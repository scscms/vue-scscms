const P = require('./public')
module.exports = updateSort

// 新添或编辑分类
async function updateSort (ctx) {
  const data = ctx.request.body
  data.id = data.id >> 0
  data.sort_name = data.sort_name.slice(0, 50)
  data.sort_type = data.sort_type.slice(0, 10)
  data.parent_id = data.parent_id >> 0
  let err
  const obj = {
    sort_name: '分类名称',
    sort_type: '分类类别'
  }
  for (let key in obj) {
    if (!data[key]) {
      err = obj[key] + '不能为空！'
      break
    }
  }
  const array = [data.sort_name, data.sort_type, data.parent_id]
  if (!err) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    if (data.id > 0) {
      array.push(data.id)
      const [result] = await connection.execute('UPDATE `sort` SET `sort_name`=?,`sort_type`=?,`parent_id`=? where `id`=?', array)
      err = result.affectedRows === 1 ? '' : '分类修改失败'
    } else {
      const [result] = await connection.execute('INSERT INTO `sort` (sort_name,sort_type,parent_id) VALUES (?,?,?)', array)
      err = result.affectedRows === 1 ? '' : '分类添加失败'
      data.id = result.insertId// 插入数据库的ID
    }
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err,
    data: {
      data
    }
  }
}
