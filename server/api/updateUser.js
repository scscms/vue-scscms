const P = require('./public')
module.exports = updateUser

// 保存用户
async function updateUser (ctx) {
  let data = ctx.request.body
  data.user_type = data.user_type >> 0// 用户类型
  let id = data.id >> 0// 编辑的用户ID
  const user = ctx.state.userInfo// 获取用户信息
  if (user.user_type > 1 && !id) {
    // 非超管添加用户:禁止添加比自己大的用户类型
    data.user_type = Math.max(data.user_type, user.user_type)
  }
  let msg
  let arr
  const obj = {
    user_name: '用户帐号',
    user_email: '用户邮箱',
    pass_word: '用户密码',
    user_type: '用户类型',
    user_pic: '用户头像'
  }
  Object.keys(obj).forEach(key => {
    if (data[key] === '' && key !== 'user_pic' && !msg) {
      msg = obj[key] + '不能为空！'
    }
    obj[key] = data[key]
  })
  obj.pass_word = P.bcrypt.hashSync(data.pass_word, P.bcrypt.genSaltSync(10))// 加密密码
  if (!P.common.name_reg.test(data.user_name)) {
    msg = P.common.name_txt
  } else if (!P.common.pass_reg.test(data.pass_word)) {
    msg = P.common.pass_txt
  } else if (!P.common.email_reg.test(data.user_email)) {
    msg = P.common.email_txt
  }
  if(user.user_type !== 1 && obj.user_type !==0 && user.user_type >= obj.user_type){
    msg = '对不起，权限超越！'
  }
  if (!msg) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
    if (id) {
      delete obj.user_name  // 修改时不能修改帐号
      delete obj.user_email // 修改时不能修改邮箱
      if (user.user_type > 1 || data.pass_word === P.common.defaultPassword) {
        delete obj.pass_word // 不修改原密码情况
      }
      arr = Object.values(obj)
      arr.push(id)
      const [result] = await connection.execute(`UPDATE user SET ${Object.keys(obj).map(k => k + '=?').join(',')} where id=?`, arr)
      msg = result.affectedRows === 1 ? '' : '修改用户失败'
    } else {
      obj.create_time = new Date().toLocaleString('zh-cn', { timeZone: 'UTC' }).replace(/[^\d-:/]+/g,' ')
      // 先检查是否占用帐号
      const [rows] = await connection.execute('SELECT user_name,user_email FROM `user` where `user_name`=? or `user_email`=?', [data.user_name, data.user_email])
      if (rows.length > 0) {
        msg = rows[0].user_name === data.user_name ? '帐号已经被占用！' : '邮箱已经被占用！'
      } else {
        arr = Object.keys(obj)
        const [result] = await connection.execute(`INSERT INTO user (${arr.join(',')}) VALUES (${arr.map(() => '?').join(',')})`, Object.values(obj))
        msg = result.affectedRows === 1 ? '' : '添加用户失败'
      }
    }
    await connection.end()
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {}
  }
}
