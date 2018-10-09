<template>
  <div>
    <el-row class="grid-table">
      <el-form :inline="true" :model='search_data'>
        <el-form-item label="标题">
          <el-input size="small" v-model="search_data.title"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader size="small" change-on-select :options="sort_data" :clearable="true" v-model="sort_id"
                       :props="defaultProps"></el-cascader>
        </el-form-item>
        <el-form-item label="权限">
          <el-select size="small" v-model="search_data.read_type">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="(value,key) in read_type" :key="key"
                       :label="value" :value="key" v-if="key!='0'">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" icon="search" @click='onSearch'>查询</el-button>
          <el-button size="small" icon="plus" type="primary" @click="add" :disabled="grade.updateArticle">添加文章
          </el-button>
        </el-form-item>
      </el-form>
      <el-button type="success" :disabled="grade.passedArticle" @click='passedArticle(null,1)'>批量通过</el-button>
      <el-button type="warning" :disabled="grade.passedArticle" @click='passedArticle(null,0)'>批量审核</el-button>
      <el-button type="danger" :disabled="grade.deleteArticle" @click='deleteArticle()'>批量删除</el-button>
      <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" :selectable="selectable" width="55"></el-table-column>
        <el-table-column
          show-overflow-tooltip
          v-for="item in table_data.columns"
          :label="item.name"
          :key="item.key"
          :prop="item.key"
          :formatter="columnFormatter"
          :min-width="item.minWidth" :width="item.width">
        </el-table-column>
      </el-table>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="search_data.page"
        :page-size="search_data.pageSize"
        layout="total, prev, pager, next,jumper"
        :total="table_data.total">
      </el-pagination>
    </el-row>
    <Sidebar ref="view">
      <div slot='title'>{{article.title}}</div>
      <div slot="content" class="sidebar_content" v-loading="loading">
        <el-row :gutter="20" class="">
          <el-col :span="6"><strong>文章分类：</strong>{{article.sort_name}}</el-col>
          <el-col :span="6"><strong>作者：</strong>{{article.user_name}}</el-col>
          <el-col :span="6"><strong>阅读权限：</strong>{{read_type[article.read_type]}}</el-col>
          <el-col :span="6"><strong>时间：</strong>{{article.create_time}}</el-col>
        </el-row>
        <el-row :gutter="20" class="">
          <el-col :span="24"><strong>文章概要：</strong>{{article.description}}</el-col>
        </el-row>
        <div class="article_content" v-html="article.content">文章内容</div>
      </div>
      <div slot="foot" class="sidebar_foot">
        <p>上一条：<span v-if="!article.next.title">已经没有上一条数据</span>
          <a @click="getActiveContent(article.next.id)" href="javascript:void 0">{{article.next.title}}</a>
        </p>
        <p>下一条：<span v-if="!article.prev.title">已经没有下一条数据</span>
          <a @click="getActiveContent(article.prev.id)" href="javascript:void 0">{{article.prev.title}}</a>
        </p>
      </div>
    </Sidebar>
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
      page_grade: common.page_grade,
      grade: {
        updateArticle: !0,
        passedArticle: !0,
        deleteArticle: !0
      },
      userInfo: {},
      read_type: common.user_type,
      sort_data: [],
      sort_id: [],
      defaultProps: {
        children: 'children',
        label: 'sort_name',
        value: 'id'
      },
      search_data: {
        title: '',
        sort_id: '',
        read_type: '',
        page: 1,
        pageSize: 10
      },
      // 表格数据
      multipleSelection: [],
      table_data: {
        columns: [
          { 'key': 'title', 'name': '文章标题', minWidth: 150 },
          { 'key': 'sort_name', 'name': '分类名称', width: 120 },
          { 'key': 'user_name', 'name': '作者', width: 120 },
          { 'key': 'passed', 'name': '状态', width: 80 },
          { 'key': 'read_type', 'name': '阅读权限', width: 120 },
          { 'key': 'create_time', 'name': '发表时间', minWidth: 120 },
          { 'key': 'operations', 'name': '操作', width: 135 }
        ],
        total: 0,
        data: []
      },
      loading: false,
      article: {
        title: '',
        sort_name: '',
        user_name: '',
        read_type: '',
        create_time: '',
        description: '',
        content: '',
        prev: { id: 0, title: '' },
        next: { id: 0, title: '' }
      }
    }
  },
  methods: {
    // 删除文章
    deleteArticle (arr) {
      if (!arr) {
        if (this.multipleSelection.length) {
          arr = this.multipleSelection
        } else {
          return this.$message('请先选择文章')
        }
      }
      this.$confirm(`确定要${arr.length > 1 ? '批量删除文章' : '删除此文章'}吗？`, '系统提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        utils.ajax.call(this, '/deleteArticle', { ids: arr.map(o => o.id).join(',') }, (d, err) => {
          !err && this.ajaxData()
        })
      }).catch(() => {
      })
    },
    passedArticle (arr, pass) {
      if (!arr) {
        if (this.multipleSelection.length) {
          arr = this.multipleSelection
        } else {
          return this.$message('请先选择文章')
        }
      }
      utils.ajax.call(this, '/passedArticle', { ids: arr.map(o => o.id).join(','), passed: pass }, (obj, err) => {
        if (!err) {
          arr.forEach(row => {
            row.passed = obj.passed
          })
        }
      })
    },
    selectable (row) {
      let user = this.userInfo
      let result = !this.grade.deleteArticle || !this.grade.passedArticle
      result = result && user.id !== row.user_id
      return user.user_type < 3 || result
    },
    add () {
      this.$router.push('/article/add')
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    createButton (h, row, code, text) {
      let self = this
      let dis = false
      let user = this.userInfo
      if (code === 'passed') {
        dis = this.grade.passedArticle
      } else if (code === 'edit') {
        dis = user.user_type > 2 && user.id !== row.user_id ? true : this.grade.updateArticle
      } else if (code === 'delete') {
        dis = user.user_type > 2 && user.id !== row.user_id ? true : this.grade.deleteArticle
      }
      return h('el-button', {
        props: { size: 'small', disabled: dis },
        on: {
          click () {
            self.healColumnClick(code, row)
          }
        }
      }, [text])
    },
    // 格式化输出内容
    columnFormatter (row, column) {
      let self = this
      let key = column.property
      let str = row[key] || ''
      let h = this.$createElement
      if (key === 'create_time') {
        str = str.replace(/[^-\d].+/, '')
      } else if (key === 'title') {
        return h('span', {
          style: { cursor: 'pointer' },
          on: {
            click () {
              self.healColumnClick('view', row)
            }
          }
        }, [str])
      } else if (key === 'passed') {
        return this.createButton(h, row, key, str === 1 ? '审核' : '通过')
      } else if (key === 'operations') {
        return h('div', [
          this.createButton(h, row, 'edit', '编辑'),
          this.createButton(h, row, 'delete', '删除')
        ])
      } else if (key === 'read_type') {
        str = common.user_type[str] || '未知'
      }
      return str
    },
    // 处理列、按钮点击
    healColumnClick (code, row) {
      if (code === 'edit') {
        this.$router.push('/article/edit/' + row.id)
      } else if (code === 'view') {
        this.$refs.view.open(!0)
        this.getActiveContent(row.id)
      } else if (code === 'passed') {
        this.passedArticle([row], row.passed === 1 ? 0 : 1)
      } else if (code === 'delete') {
        this.deleteArticle([row])
      }
    },
    getActiveContent (id) {
      this.loading = !0
      utils.ajax.call(this, '/getArticleById', { id }, (obj, err) => {
        this.loading = !1
        if (err) {
          this.$refs.view.open(!1)
        } else {
          Object.getOwnPropertyNames(this.article).forEach(key => {
            this.$set(this.article, key, obj[key])
          })
          this.article.create_time = new Date(this.article.create_time).toLocaleDateString()
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
          cb(this.sort_data)
        }
      })
    },
    // ajax请求列表数据
    ajaxData () {
      let p = this.sort_id
      this.search_data.sort_id = p.length ? p.slice(-1)[0] : ''
      utils.ajax.call(this, '/listArticle', this.search_data, (obj, err) => {
        if (!err) {
          this.table_data.data = obj.data
          this.table_data.total = obj.total
          this.search_data.page = obj.page
        }
      })
    },
    // 点击查询
    onSearch () {
      this.ajaxData()
    },
    handleCurrentChange (page) {
      if (page !== this.search_data.page) {
        this.search_data.page = page
        this.ajaxData()
      }
    }
  },
  mounted () {
    this.ajaxData()
    utils.ajax.call(this, '/listSort', {}, (data, err) => {
      if (!err) {
        let arr = data.data
        arr.sort((a, b) => a.parent_id > b.parent_id ? 1 : -1)
        for (let i = arr.length; i--;) {
          if (arr[i].parent_id > 0) {
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
      }
    })
  },
  mixins: [common.mixin],
  components
}
</script>
<style lang="less">
  .grid-table {
    .el-form-item {
      display: inline-block;
      max-height: 240px;
      width: ~'calc(24% - 10px)';
      &:first-child {
        .el-input {
          margin-right: 25px;
        }
      }
      &:last-child {
        overflow: hidden;
        white-space: nowrap;
        vertical-align: bottom;
      }
    }
    .el-pagination {
      margin-top: 5px;
      text-align: right;
    }
    .el-cascader--small .el-cascader__label {
      line-height: 40px;
    }
  }

  .sidebar_content {
    .el-row {
      font-size: 15px;
      color: #666;
      margin-bottom: 8px;
      strong {
        color: #555;
      }
    }
    .article_content {
      font-size: 12px;
      margin-top: 20px;
      padding: 10px;
      background: #f1f1f112;
      border: 1px solid #f9f9f9;
      .no_access {
        color: #999;
        font-size: 16px;
      }
    }
  }

  .sidebar_foot p {
    span {
      color: #999;
    }
    a {
      text-decoration: none;
      color: #444;
    }
  }
</style>
