const P = require('./public')
module.exports = upUserPic

// 用户上传头像
async function upUserPic (ctx) {
  let pic = ctx.request.body.pic
  let msg = P.common.pic_reg.test(pic) ? null : P.common.pic_txt
  if (!msg) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [result] = await connection.execute('UPDATE user SET user_pic=? where id=?', [pic, ctx.state.userInfo.id >> 0])
    msg = result.affectedRows === 1 ? '' : '更新头像失败'
    await connection.end()
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: { pic }
  }
}
