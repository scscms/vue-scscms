<template>
  <div class="add-article">
    <el-form ref="form" :model="data" :rules="rules" label-width="80px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="data.title"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="sort_id">
        <el-cascader :options="sort_data" v-model="sort_id" change-on-select
                     :props="defaultProps"></el-cascader>
      </el-form-item>
      <el-form-item label="文章概要" prop="description">
        <el-input type="textarea" v-model="data.description"></el-input>
      </el-form-item>
      <el-form-item label="作者">
        <el-input readonly="readonly" :value="data.user_name" style="width:217px;opacity: 0.5"></el-input>
      </el-form-item>
      <el-form-item label="阅读权限" prop="read_type">
        <el-slider v-model="data.read_type" :format-tooltip="formatTooltip" :min="1" :max="4"></el-slider>
      </el-form-item>
      <el-form-item label="封面图片" prop="pic">
        <el-input v-model="data.pic"></el-input>
        <up-file ref="upload" :upload="{}" @successUpload="successUpload"></up-file>
        <el-button @click="upImg" style="margin-left:10px" :disabled="grade.upFile">上传图片</el-button>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <quill-editor v-model="data.content" ref="myQuillEditor">
        </quill-editor>
      </el-form-item>
      <el-form-item style="text-align: right">
        <el-button @click="backList">返回列表</el-button>
        <el-button type="primary" :disabled="grade.updateArticle||loading" @click="saveArticle">保存文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/utils/common'
import components from '@/components/index'

export default {
  name: 'list',
  data () {
    return {
      editorOption: {
        modules: {
          placeholder: 'xxx',
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
          ]
        }
      },
      page_grade: common.page_grade,
      grade: {
        updateArticle: !0,
        upFile: !0
      },
      userInfo: {},
      read_type: common.user_type,
      loading: false,
      sort_id: [],
      sort_data: [],
      data: {
        id: 0,
        title: '',
        sort_id: '',
        description: '',
        user_name: '',
        pic: '',
        read_type: 4,
        content: ''
      },
      rules: {
        sort_id: { required: true, message: '分类不能为空' },
        title: [{
          required: true, message: '标题不能为空', trigger: 'change'
        }, {
          pattern: /^.{1,100}$/, message: '请输入1-100个字符的文章标题', trigger: 'blur'
        }],
        description: [{
          required: true, message: '文章概要不能为空', trigger: 'change'
        }, {
          pattern: /^.{5,255}$/, message: '请输入5-255个字符的文章概要', trigger: 'blur'
        }],
        read_type: [{
          required: true, type: 'number', min: 1, max: 4, message: '请选择阅读权限', trigger: 'change'
        }],
        content: {
          required: true, message: '文章内容不能为空'
        }
      },
      defaultProps: {
        children: 'children',
        label: 'sort_name',
        value: 'id'
      }
    }
  },
  methods: {
    saveArticle () {
      this.$refs.form.validate(v => {
        if (v) {
          this.data.article_extend = JSON.stringify({ pic: this.data.pic })
          utils.ajax.call(this, '/updateArticle', this.data, (data, err) => {
            this.loading = false
            if (!err) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.$router.push('/article/list')
            }
          })
        }
      })
    },
    formatTooltip (v) {
      return common.user_type[v]
    },
    upImg () {
      this.$refs.upload.SelectFile()
    },
    backList () {
      this.$router.push('/article/list')
    },
    successUpload (data) {
      this.data.pic = data.filename
      this.data.content += '<img src="' + data.filename + '" />'
    }
  },
  mounted () {
    utils.storage.get('userInfo', obj => {
      this.data.user_name = obj.userInfo.user_name
    })
    utils.ajax.call(this, '/listSort', {}, (data, err) => {
      if (!err) {
        let arr = data.data
        arr.sort((a, b) => a.parent_id > b.parent_id ? 1 : -1)
        for (let i = arr.length; i--;) {
          if (arr[i].parent_id) {
            let obj = arr.pop()
            arr.forEach(item => {
              if (item.id === obj.parent_id) {
                item.children = item.children || []
                item.children.push(obj)
              }
            })
          }
        }
        this.sort_data = arr
        let id = this.$route.params.id
        if (id) {
          utils.ajax.call(this, '/getArticleById', { id }, (obj, err) => {
            if (!err) {
              if (this.userInfo.user_type > 2 && obj.user_id !== this.userInfo.id) {
                return this.$router.back()
              }
              Object.getOwnPropertyNames(this.data).forEach(key => {
                this.data[key] = obj[key]
              })
              try {
                this.data.pic = JSON.parse(obj.article_extend).pic
              } catch (e) {
                this.data.pic = ''
              }
              // 显示分类
              const cid = obj.sort_id
              let hasFind = false
              let cb = (array, a) => {
                !hasFind && array && array.forEach(item => {
                  a = a || []
                  let _a = [].concat(a)
                  _a.push(item.id)
                  if (item.id === cid) {
                    hasFind = true
                    this.sort_id = _a
                  } else {
                    cb(item.children, _a)
                  }
                })
              }
              cb(arr)
            }
          })
        }
      }
    })
  },
  watch: {
    sort_id (val) {
      this.data.sort_id = val.length ? val.slice(-1)[0] : ''
    }
  },
  mixins: [common.mixin],
  components
}
</script>
<style lang="less">
  .ql-editor{
    min-height:100px;
    max-height:600px;
  }
  .ql-toolbar.ql-snow{
    padding: 0;
  }
  .ql-snow .ql-picker{
    line-height:20px;
    outline: none;
  }
  .ql-snow .ql-tooltip{
    margin-left:50%;
  }
  .ql-snow .ql-tooltip a.ql-preview{
    vertical-align: middle;
  }
  .add-article {
    .el-input, .el-textarea__inner, .el-slider {
      max-width: 60%
    }
    .el-cascader {
      width: 100%;
      max-width: 60%;
      .el-input {
        width: 100%
      }
    }
  }
</style>
