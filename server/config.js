//后台配置文件
export default {
    //数据库配置
    mysqlDB : {
		host:'localhost',
        user: '数据库用户',
        password:'数据库密码',
        database: '数据库名称'
    },
    upPath:'dist/upFile/',//上传路径
    //token 配置
    JWTs : {
        secret : 'scscms', // 指定密钥
        expiresIn:'2h'  //超时设置 m分钟 h小时 d天数
    },
    //邮件服务配置
    emailServer:{
        service: 'SMTP',
        host: 'smtp.126.com',
        port: 465,
        auth: {
            user: '您的邮箱',
            pass: '邮箱密码'
        }
    }
}
