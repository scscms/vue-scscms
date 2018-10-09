const P = require('./public')
const fs = require('fs')
module.exports = delFile

// 删除上传文件列表
async function delFile (ctx) {
  const data = ctx.request.body
  let ids = data.id
  let arr = ids.split(',')
  let msg
  if (/^\d+(,\d+)*$/.test(ids)) {
    ids = arr.map(() => '?').join(',')
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute(`SELECT file_path FROM upload where id in (${ids})`, arr)
    if (rows.length) {
      for (let i = rows.length; i--;) {
        const path = rows[i].file_path.replace(/\\/g, '/')
        if (path.startsWith(P.config.upPath)) {
          try {
            fs.unlinkSync(path)
          } catch (e) {
          }
        }
      }
      if (data.delRecord === 'true') {
        await connection.execute(`DELETE from upload where id in (${ids})`, arr)
      }
    } else {
      msg = '无此记录'
    }
    await connection.end()
  } else {
    msg = 'ID参数不合法'
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {}
  }
}
