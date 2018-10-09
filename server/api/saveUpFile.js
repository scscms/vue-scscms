const P = require('./public')
module.exports = saveUpFile

// 保存上传记录
async function saveUpFile (arr) {
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [result] = await connection.execute('INSERT INTO `upload` (user_id,file_name,file_path,mime_type,file_size,is_delete,create_time) VALUES (?,?,?,?,?,?,?)', arr)
  await connection.end()
  return result
}
