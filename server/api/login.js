const P = require('./public')
const jwt = require('jsonwebtoken')
module.exports = login

// 用户登录
async function login (ctx) {
  const data = ctx.request.body
  let msg
  if (!P.common.name_reg.test(data.user_name)) {
    msg = P.common.name_txt
  } else if (!P.common.pass_reg.test(data.pass_word)) {
    msg = P.common.pass_txt
  } else {
    // 初步验证通过，开始查询数据库
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    const [rows] = await connection.execute('SELECT * FROM `user` where `user_name`=?', [data.user_name])
    msg = '用户名或密码错误！'// 不应该具体透露是密码还是帐户出错！
    if (rows.length) {
      const userInfo = rows[0]
      if (P.bcrypt.compareSync(data.pass_word, userInfo.pass_word)) {
        if (userInfo.user_type === 0) {
          msg = '此帐号正在审核中！'
        } else {
          let ip = P.config.getClientIP(ctx)
          await connection.execute('UPDATE `user` SET `login_ip`=? where `id`=?', [ip, userInfo.id])
          delete userInfo.pass_word
          ctx.body = {
            success: true,
            data: {
              userInfo,
              token: jwt.sign(Object.assign({ ip }, userInfo),
                P.config.JWTs.secret, { expiresIn: P.config.JWTs.expiresIn })
            }
          }
          return
        }
      }
    }
    await connection.end()
  }
  ctx.body = {
    success: false,
    message: msg,
    data: {}
  }
}
