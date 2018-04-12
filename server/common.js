//前、后台共用变量
export default {
    web_name:'阳光内容管理系统',
    web_domain:'http://103.27.4.146:3001',//访问域名
    name_reg:/^[a-z\u4e00-\u9fa5]{3,10}$/i, //帐号验证
    name_txt:'3至10个英文或中文字符', //帐号规则
    pass_reg:/^(?=.*[a-z])(?=.*\d)[a-z\d]{6,12}$/i, //密码验证
    defaultPassword:'88888888888a', //默认密码：当修改用户信息时不更改密码的标识
    pass_txt:'6至12个英文和数字组成的字符', //密码规则
    email_reg:/^[a-z\d]+([-_.][a-z\d]+)*@([a-z\d]+[-.])+[a-z]{2,3}$/, //邮箱正则表达式
    email_txt:'请输入正确邮箱地址',
    pic_reg:/^(https?:\/\/|\/upFile\/)/i,
    pic_txt:'头像地址不正确！',
    upFile_maxSize:1024*1024*5,//上传文件大小限制
    upFile_accept:/^image\//,//上传文件格式限制
    user_type:{
        0: '未审核用户',
        1: '超级管理员',
        2: '普通管理员',
        3: 'VIP用户',
        4: '普通用户'
    },
    //页面权限设置 0:所有人 4:所有登录用户 3:vip用户以上 2:管理员级别 1:只有超级管理员
    page_grade:{
        changePassword:4,//修改密码（必须登录）
        listSort:4,//分类列表（页面访问权限）
        updateSort:4,//添加和更新分类权限
        deleteSort:4,//删除分类权限
        batchDelSort:4,//批量删除分类权限
        delFile:4,	//批量或单个删除上传文件列表（管理员级别）
        upFile:4, //上传权限(共用)
        listUpFile:4,//管理上传列表
        listUser:4,//用户列表
        updateUser:2,//添加、修改用户（超级管理员）
        passedUser:4,//审核用户列表
        deleteUser:2,//删除用户列表
        listArticle: 4,	//文章列表（必须登录）
        updateArticle: 4, //新添或编辑文章（必须登录）
        passedArticle: 2, //审核文章（管理员级别）
        deleteArticle: 2, //删除文章（管理员级别或会员删除自己的）
    },
    sort_type:{
        'news':'新闻',
        'article':'文章',
        'course':'教程',
    },
    deal_results : {
        lack:'#失败：参数错误！',
        nobody:'#失败：查无此用户！',
        errCode:'#失败：激活码错误！',
        failed:'#失败：更新数据异常！',
        success:'恭喜您#成功！可以登录了。',
    },
    //这里不可使用ES6语法
    mixin:{
        methods:{
            dealUserInfo:function(o){
                if(this.hasOwnProperty('userInfo')){
                    this.userInfo = o;
                }
                const g = this.grade;
                if(g){
                    const p = this.page_grade;
                    for(var k in g){
                        if(g.hasOwnProperty(k)){
                            g[k] = p[k] < o.user_type;
                        }
                    }
                }
            }
        },
        created:function(){
            this.dealUserInfo(this.$store.state.userInfo.data);
        },
        watch:{
            '$store.state.userInfo.data':'dealUserInfo'
        }
    }
}
