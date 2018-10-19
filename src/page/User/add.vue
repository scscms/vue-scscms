<template>
  <div class="add-article">
    <el-form ref="form" :model="data" :rules="rules" label-width="80px">
      <el-form-item label="用户帐号" prop="user_name">
        <el-input :disabled="data.id > 0" v-model="data.user_name"></el-input>
      </el-form-item>
      <el-form-item label="用户密码" prop="pass_word">
        <el-input type="password" v-model="data.pass_word"></el-input>
      </el-form-item>
      <el-form-item label="用户邮箱" prop="user_email">
        <el-input :disabled="data.id > 0" v-model="data.user_email"></el-input>
      </el-form-item>
      <el-form-item label="用户类型" prop="user_type">
        <el-select v-model="data.user_type" placeholder="请选择">
          <el-option v-for="(item,key) in user_type"
                     :key="key" :label="item" :value="key" v-if="key != 1">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户头像" prop="user_pic">
        <el-input v-model="data.user_pic"></el-input>
        <up-file ref="upload" :upload="{disabled:grade.upFile}" @successUpload="successUpload"></up-file>
        <el-button @click="upImg" style="margin-left:8px" :disabled="grade.upFile">上传图片</el-button>
      </el-form-item>
      <el-form-item style="text-align: right">
        <el-button @click="backList">返回列表</el-button>
        <el-button type="primary" :disabled="grade.updateUser||loading" @click="saveUser">保存用户</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/../server/common'
import components from '@/components/index'

export default {
  name: 'list',
  data () {
    const _this = this
    return {
      page_grade: common.page_grade,
      grade: {
        updateUser: !0,
        upFile: !0
      },
      user_type: common.user_type,
      loading: false,
      err: '',
      data: {
        id: 0,
        user_name: '',
        pass_word: '',
        user_email: '',
        user_type: '0',
        user_pic: ''
      },
      rules: {
        user_name: [{
          required: true,
          message: '用户帐号不能为空！',
          trigger: 'change'
        }, {
          validator: (rule, value, callback) => {
            if (!common.name_reg.test(value)) {
              callback(new Error(common.name_txt))
            } else if (_this.err.includes('帐号')) {
              callback(new Error(_this.err))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }],
        pass_word: [{
          required: true,
          message: '密码不能为空！',
          trigger: 'change'
        }, {
          pattern: common.pass_reg,
          message: common.pass_txt,
          trigger: 'change'
        }],
        user_email: [{
          required: true,
          message: '邮箱不能为空！',
          trigger: 'change'
        }, {
          validator: (rule, value, callback) => {
            if (!common.email_reg.test(value)) {
              callback(new Error(common.email_txt))
            } else if (_this.err.includes('邮箱')) {
              callback(new Error(_this.err))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }],
        user_type: [{
          required: true, message: '请选择用户类型', trigger: 'change'
        }]
      }
    }
  },
  methods: {
    saveUser () {
      this.$refs.form.validate(v => {
        if (v) {
          this.data.article_extend = JSON.stringify({ pic: this.data.pic })
          utils.ajax.call(this, '/updateUser', this.data, (data, err) => {
            this.loading = false
            if (!err) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.$router.push('/user/list')
            } else {
              this.err = err
              if (err.includes('帐号') || err.includes('邮箱')) {
                this.$refs.form.validateField(err.includes('帐号') ? 'user_name' : 'user_email')
              }
            }
          })
        }
      })
    },
    upImg () {
      this.$refs.upload.SelectFile()
    },
    backList () {
      this.$router.push('/user/list')
    },
    successUpload (data) {
      this.data.user_pic = data.filename
    }
  },
  mounted () {
    let id = this.$route.params.id
    if (id) {
      utils.ajax.call(this, '/getUserById', { id }, (obj, err) => {
        if (!err) {
          Object.getOwnPropertyNames(this.data).forEach(key => {
            if (key !== 'pass_word') {
              this.data[key] = obj[key] + ''
            }
          })
          this.data.pass_word = common.defaultPassword
        }
      })
    }
  },
  watch: {
    'data.user_name' () {
      if (this.err.includes('帐号')) this.err = ''
    },
    'data.user_email' () {
      if (this.err.includes('邮箱')) this.err = ''
    }
  },
  mixins: [common.mixin],
  components
}
</script>
<style lang="less">

</style>
