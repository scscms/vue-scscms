<template>
  <div class="home" :class="{homeClose:isCollapse}" @click="homeClick">
    <el-dialog title="更新头像" :visible.sync="upUserPic.visible" @click.native.stop="">
      <el-form :model="upUserPic" :rules="upUserPic.rules" label-width="80px" ref="picForm">
        <el-form-item label="图片地址" prop="pic">
          <el-input v-model="upUserPic.pic"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <up-file ref="upload" :upload="{}" @successUpload="successUpload"></up-file>
        <el-button @click="upImg" :disabled="grade.upFile" style="float:left">上传图片</el-button>
        <el-button type="text" @click="upUserPic.visible = false">取 消</el-button>
        <el-button type="primary" @click="upUserImg">确 定</el-button>
      </div>
    </el-dialog>
    <div class="el-row">
      <div class="el-col top_right">
        <p @click.stop="showUserInfo"></p>
        <div class="user_info" @click.stop="">
          <dl class="clearfix">
            <dt @click="upPic"></dt>
            <dd>帐号：{{userInfo.user_name}}</dd>
            <dd>角色：{{getUserType}}</dd>
            <dd>邮箱：{{userInfo.user_email}}</dd>
          </dl>
          <el-button type="primary" @click="loginOut">退出系统</el-button>
          <el-button @click="showChange" :disabled="grade.changePassword">修改密码</el-button>
        </div>
      </div>
      <div class="el-col top_left"></div>
      <div class="el-col el-col-1 close-col">
        <i :class="'el-icon-d-arrow-'+(isCollapse?'right':'left')" @click="isCollapse=!isCollapse"></i>
      </div>
      <div class="el-col el-col-1" style="width:calc(100% - 440px);">
        <el-menu :default-active="headerCurRouter" background-color="#054572"
                 text-color="#fff"
                 active-text-color="#ffd04b" class="el-menu-demo" mode="horizontal" router>
          <template v-for="item in getMenu" v-if="item.meta.show">
            <el-submenu :key="item.path" :index="item.path" v-if="item.meta.showSub">
              <template slot="title">{{item.meta.title}}</template>
              <el-menu-item v-for="child in item.children"
                            :key="child.path" v-if="child.meta.show"
                            :index="item.path + '/' + child.path">
                {{child.meta.title}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item :key="item.path" :index="item.path" v-else-if="item.meta.show">{{item.meta.title}}
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </div>
    <div class="menu">
      <el-menu :default-active="headerCurRouter" class="el-menu-vertical-demo" background-color="#eef1f6" :collapse="isCollapse" :router="true">
        <template v-for="item in getMenu" v-if="item.meta.show">
          <el-submenu :key="item.path" :index="item.path" v-if="item.meta.showSub">
            <template slot="title">
              <i :class="item.meta.icon"></i>
              <span slot="title">{{item.meta.title}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item v-for="child in item.children"
                            :key="child.path" v-if="child.meta.show"
                            :index="item.path + '/' + child.path">
                <i :class="child.meta.icon"></i>
                {{child.meta.title}}
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-menu-item :key="item.path" :index="item.path" v-else-if="item.meta.show">
            <i :class="item.meta.icon"></i>
            <span slot="title">{{item.meta.title}}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    <div class="content">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in routes" :to="{ path: item.path }" :key="item.path">{{item.meta.title}}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>
    <el-dialog title="修改密码" :visible.sync="password.visible">
      <el-form :model="password.form" :rules="password.rules" label-width="80px" ref="password">
        <el-form-item label="旧密码" prop="old_password">
          <el-input type="password" v-model="password.form.old_password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="pass_word">
          <el-input type="password" v-model="password.form.pass_word"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="pass_words">
          <el-input type="password" v-model="password.form.pass_words" @keyup.native.enter="changePassword"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="password.visible = false">取 消</el-button>
        <el-button type="primary" :disabled="password.loading" @click="changePassword">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/../server/common'
import '@/components/index'
// 动画对象
const act = {
  start: null, // 状态：off,on,null
  div: null,
  obj: null,
  parameter: {
    delay: 0,
    endDelay: 0,
    fill: 'forwards',
    iterations: 1,
    duration: 500,
    direction: 'normal',
    easing: 'ease-in'
  },
  keyframes: [
    {
      offset: 0,
      opacity: 0,
      filter: 'blur(40px)',
      transformOrigin: '50% 0',
      transform: 'perspective(800px) rotateY(-180deg) translateZ(150px)'
    }, {
      offset: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transformOrigin: '0 0',
      transform: 'perspective(800px) rotateY(0deg) translate3d(0px,0px,0px)'
    }
  ]
}
export default {
  name: 'home',
  data () {
    const _this = this
    return {
      page_grade: common.page_grade,
      grade: {
        changePassword: !0,
        upFile: !0
      },
      userInfo: {},
      upUserPic: {
        visible: false,
        pic: '',
        rules: {
          pic: {
            required: true,
            pattern: common.pic_reg,
            message: common.pic_txt,
            trigger: 'change'
          }
        }
      },
      isCollapse: false,
      headerCurRouter: '',
      routes: [],
      menu: this.$router.options.routes,
      password: {
        visible: false,
        loading: false,
        form: {
          old_password: '',
          pass_word: '',
          pass_words: ''
        },
        rules: {
          old_password: [{
            required: true,
            message: '旧密码不能为空！',
            trigger: 'change'
          }, {
            validator: (rule, value, callback) => {
              if (!common.pass_reg.test(value)) {
                callback(new Error(common.pass_txt))
              } else {
                _this.password.form.pass_word && _this.$refs.password.validateField('pass_word')
                callback()
              }
            },
            trigger: 'change'
          }],
          pass_word: [{
            required: true,
            message: '新密码不能为空！',
            trigger: 'change'
          }, {
            validator: (rule, value, callback) => {
              let form = _this.password.form
              if (!common.pass_reg.test(value)) {
                callback(new Error(common.pass_txt))
              } else if (form.old_password === form.pass_word) {
                callback(new Error('新密码不能与旧密码相同！'))
              } else {
                form.pass_words && _this.$refs.password.validateField('pass_words')
                callback()
              }
            },
            trigger: 'change'
          }],
          pass_words: [{
            required: true,
            message: '确认密码不能为空！',
            trigger: 'change'
          }, {
            validator: (rule, value, callback) => {
              let form = _this.password.form
              if (!common.pass_reg.test(value)) {
                callback(new Error(common.pass_txt))
              } else if (form.pass_word !== form.pass_words) {
                callback(new Error('新密码与确认密码不相同！'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }]
        }
      }
    }
  },
  computed: {
    getMenu () {
      let menu = this.$router.options.routes
      const paths = ['/', '*', '/login', 'edit/:id']
      menu.forEach(obj => {
        obj.meta = obj.meta || {}
        obj.meta.show = !paths.includes(obj.path)
        let count = 0
        obj.children && obj.children.forEach(item => {
          item.meta = item.meta || {}
          item.meta.show = (count++, !paths.includes(item.path))
        })
        obj.meta.showSub = obj.meta.show && count > 0
      })
      return menu
    },
    getUserType () {
      return common.user_type[this.userInfo.user_type] || '未知'
    }
  },
  mounted () {
    act.start = window.Element.prototype.animate !== undefined ? 'off' : null
    this.updateCurMenu()
    utils.storage.get('userInfo', obj => {
      this.$store.dispatch('set_userInfo', obj.userInfo)
      this.userInfo = obj.userInfo
      this.setUserInfo()
    })
  },
  methods: {
    // 上传头像
    upPic () {
      this.upUserPic.visible = true
      this.$refs.picForm && this.$refs.picForm.resetFields()
    },
    upImg () {
      this.$refs.upload.SelectFile()
    },
    upUserImg () {
      this.$refs.picForm.validate(v => {
        if (v) {
          utils.ajax.call(this, '/upUserPic', { pic: this.upUserPic.pic }, (data, err) => {
            if (!err) {
              utils.storage.get('userInfo', obj => {
                obj.userInfo.user_pic = data.pic
                utils.storage.set('userInfo', obj)
                Array.from(document.querySelectorAll('.top_right p,.user_info dt')).forEach(d => {
                  d.style.backgroundImage = 'url(' + data.pic + ')'
                  d.textContent = ''
                })
              })
              this.upUserPic.visible = false
            }
          })
        }
      })
    },
    successUpload (data) {
      this.upUserPic.pic = data.filename
    },
    // 点击任意地方关闭用户信息
    homeClick () {
      act.div && (act.div.style.opacity = 0)
      if (act.start === 'on') {
        act.parameter.fill = 'backwards'
        act.start = 'off'
        act.obj.reverse()
      }
    },
    // 显示修改密码
    showChange () {
      this.password.visible = true
      this.$refs.password && this.$refs.password.resetFields()
    },
    // 修改密码
    changePassword () {
      this.$refs.password.validate(valid => {
        if (valid) {
          this.password.loading = true
          utils.ajax.call(this, '/changePassword', this.password.form, (data, err) => {
            this.password.loading = false
            if (!err) {
              this.$message({
                message: '密码修改成功！请记住新密码。',
                type: 'success'
              })
              utils.storage.remove('userInfo')
              this.$router.push('/login')
            }
          })
        }
      })
    },
    // 退出登录
    loginOut () {
      utils.storage.remove('userInfo')
      this.$router.push('/login')
    },
    showUserInfo () {
      act.div = document.querySelector('.user_info')
      act.div.style.opacity = 1
      act.div.style.top = '60px'
      if (act.start === 'off') {
        act.start = 'on'
        act.parameter.fill = 'forwards'
        act.obj = act.div.animate(act.keyframes, act.parameter)
        act.obj.addEventListener('finish', () => {
          act.div.style.top = act.start === 'on' ? '60px' : '-200px'
        }, false)
      }
    },
    setUserInfo () {
      // 因不想太多变量和条件判断及style在html里，在此使用js来修改dom
      let dom = document.querySelectorAll('.top_right p,.user_info dt')
      if (dom.length) {
        const v = this.userInfo
        let name = v.user_name.replace(/[a-z]+/g, '')
        name = name ? name.slice(0, 1) : v.user_name.slice(0, 2)
        Array.from(dom).forEach(d => {
          d.removeAttribute('style')
          d.style.backgroundColor = '#f60'
          d.style.color = '#fff'
          if (v.user_pic) {
            d.style.backgroundImage = 'url(' + v.user_pic + ')'
            d.style.textContent = ''
          } else {
            d.textContent = name.toUpperCase()
          }
        })
      }
    },
    updateCurMenu (route) {
      route = route || this.$route
      if (route.matched.length) {
        this.routes = route.matched
        let title = ''
        route.matched.forEach(obj => {
          title += obj.meta.title + ' - '
        })
        this.headerCurRouter = route.path
        document.title = title + common.web_name
      } else {
        this.$router.push('/*')
        this.headerCurRouter = '/404'
        document.title = '404 - ' + common.web_name
      }
    }
  },
  mixins: [common.mixin],
  watch: {
    $route (to) {
      this.updateCurMenu(to)
    }
  }
}
</script>

<style lang="less">
  @keyColor: #ff7d2e;
  @bgColor: #054572; /*#373a42;*/
  .rotate(@ro :0deg) {
    transform: rotate(@ro);
    -webkit-transform: rotate(@ro);
    -moz-transform: rotate(@ro);
    -o-transform: rotate(@ro);
  }

  .ellipsis(@w : 'auto') {
    width: @w;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /*========================*/
  .el-dialog--tiny {
    min-width: 300px;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }

  .home {
    color: #333;
    .el-menu.el-menu--horizontal{
      border-bottom: none;
    }
    .el-breadcrumb {
      height: 35px;
      line-height: 35px;
      margin-bottom: 15px;
      border-bottom: 1px solid #ddd;
    }
    .menu {
      position: fixed;
      top: 60px;
      overflow-y: auto;
      height: ~'calc(100% - 60px)';
      background-color: #eef1f6;
      .el-menu-item:hover, .el-submenu__title:hover {
        color: @bgColor;
      }
      span[slot="title"]{
        margin-left:5px;
        color:#555;
        font-weight:bold
      }
    }
    & > .el-row {
      position: fixed;
      z-index: 1000;
      top: 0;
      left: 0;
      width: 100%;
      min-width: 800px;
      background-color: @bgColor;
      box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
      .el-menu--dark {
        background-color: transparent;
        .el-menu-item:hover {
          background-color: darken(@bgColor, 10%);
        }
        .el-menu .el-menu-item:hover {
          background-color: lighten(@bgColor, 70%);
        }
        .el-submenu:hover .el-submenu__title {
          background-color: darken(@bgColor, 10%);
        }
      }
      .el-menu--horizontal > .el-menu-item:hover,
      .el-menu--horizontal > .el-submenu.is-active .el-submenu__title,
      .el-menu--horizontal > .el-submenu:hover .el-submenu__title {
        border-bottom-color: #ff7d2e;
      }
      .close-col{
        cursor:pointer;
        width:40px;
        text-align: center;
        color: #bababd;
        line-height: 60px;
      }
      .el-col {
        height: 60px;
        float: left;
        .fa-bars {
          margin-left: 5px;
          width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 28px;
          color: #fff;
          margin-top: 18px;
          cursor: pointer;
          opacity: .5;
          animation: fa_open .3s;
          &:hover {
            opacity: .8;
          }
        }
      }
      .top_left {
        width: 195px;
        animation: left_open .3s;
        background: url('../assets/scs_logo.png') no-repeat 18px 8px;
      }
      .top_right {
        width: 200px;
        float: right;
        p {
          float: right;
          margin: 10px;
          width: 40px;
          height: 40px;
          line-height: 38px;
          border-radius: 50%;
          text-align: center;
          font-size: 20px;
          cursor: pointer;
          background-size: cover;
          background-position: center;
        }
        .user_info {
          position: fixed;
          top: -200px;
          right: 0;
          padding: 10px 20px 20px;
          border: 1px solid #ddd;
          border-radius: 6px;
          opacity: 0;
          box-shadow: rgba(0, 0, 0, 0.1) 0 3px 6px;
          background-color: #fff;
          dl {
            width: 250px;
            margin-bottom: 10px;
            overflow: hidden;
            dt {
              float: left;
              width: 80px;
              height: 80px;
              line-height: 75px;
              font-size: 50px;
              overflow: hidden;
              margin-right: 10px;
              text-align: center;
              border-radius: 50%;
              background-size: cover;
              background-position: center;
              cursor: pointer;
            }
            dd {
              color: #555;
              height: 30px;
              font-size: 14px;
              line-height: 25px;
              .ellipsis(160px);
            }
          }
          .el-button {
            margin-left: 23px;
            float: right
          }
        }
      }
    }
    & > .content {
      position: absolute;
      margin-top: 60px;
      margin-left: 200px;
      width: ~'calc(100% - 200px)';
      min-width: 500px;
      overflow-y: auto;
      animation: content_open .3s;
      height: ~'calc(100vh - 60px)';
      & > div {
        margin: 10px 20px;
      }
    }
  }
  .el-menu-item-group__title {
    display: none
  }
  .homeClose {
    .el-row {
      .el-col {
        .fa-bars {
          .rotate(90deg);
          animation: fa_close .2s;
        }
      }
      .top_left {
        width: 58px;
        animation: left_close .2s;
      }
    }
    .content {
      margin-left: 64px;
      width: ~'calc(100% - 64px)';
      animation: content_close .3s;
    }
  }

  @keyframes fa_open {
    from {
      .rotate(90deg)
    }
    to {
      .rotate()
    }
  }

  @keyframes fa_close {
    from {
      .rotate()
    }
    to {
      .rotate(90deg)
    }
  }

  @keyframes left_close {
    from {
      width: 195px
    }
    to {
      width: 58px
    }
  }

  @keyframes left_open {
    from {
      width: 58px
    }
    to {
      width: 195px
    }
  }

  @keyframes content_open {
    from {
      margin-left: 64px;
      width: ~'calc(100% - 64px)';
    }
    to {
      margin-left: 200px;
      width: ~'calc(100% - 200px)';
    }
  }

  @keyframes content_close {
    from {
      margin-left: 200px;
      width: ~'calc(100% - 200px)';
    }
    to {
      margin-left: 64px;
      width: ~'calc(100% - 64px)';
    }
  }
</style>
