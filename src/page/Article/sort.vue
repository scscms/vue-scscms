<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
            </el-col>
            <el-col :span="16" class="button-tree">
                <el-button type="success" :disabled="grade.updateSort" @click="addSort">新增分类</el-button>
                <el-button type="danger" :disabled="grade.batchDelSort" @click="batchDelete">批量删除</el-button>
            </el-col>
        </el-row>
        <el-tree
            class="filter-tree"
            :data="data"
            node-key="id"
            :props="defaultProps"
            default-expand-all
            :show-checkbox="true"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :render-content="renderContent"
            ref="tree">
        </el-tree>
        <el-dialog :title="getTitle" :visible.sync="visible" size="tiny">
            <el-form :model="form" :rules="rules" label-width="80px" ref="sortForm">
                <el-form-item label="父级分类">
                    <el-cascader :options="data" v-model="parent_id" placeholder="留空为根分类" disabled
                                 :props="defaultProps"></el-cascader>
                </el-form-item>
                <el-form-item label="分类名称" prop="sort_name">
                    <el-input v-model="form.sort_name"></el-input>
                </el-form-item>
                <el-form-item label="分类类别" prop="sort_type">
                    <el-select v-model="form.sort_type" :disabled="parent_id.length > 0||form.id != 0"
                               style="width: 100%">
                        <el-option v-for="(item,key) in sort_type" :key="key" :label="item" :value="key">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" :disabled="loading" @click="saveSort">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script type="text/javascript">
import {ajax} from 'utils'
import common from 'common'
module.exports = {
  name: 'sort',
  data () {
    return {
      page_grade: common.page_grade,
      grade: {
        updateSort: !0,
        deleteSort: !0, // 删除分类权限
        batchDelSort: !0// 批量删除分类权限
      },
      type: 'edit',
      visible: false,
      loading: false,
      filterText: '',
      sort_type: common.sort_type,
      parent_id: [],
      parent_store: null,
      parent_data: null,
      form: {
        id: 0,
        sort_name: '',
        sort_type: ''
      },
      rules: {
        sort_name: {required: true, pattern: /^.{2,50}$/, message: '请输入2-50个字符的分类名称', trigger: 'change'},
        sort_type: {required: true, message: '请选择分类类别', trigger: 'change'}
      },
      data: [],
      defaultProps: {
        disabled: 'disabled',
        children: 'children',
        label: 'sort_name',
        value: 'id'
      }
    }
  },
  computed: {
    getTitle () {
      return this.type === 'edit' ? '编辑分类' : '添加分类'
    }
  },
  mounted () {
    ajax.call(this, '/listSort', {}, (data, err) => {
      if (!err) {
        let arr = data.data
        arr.sort((a, b) => a.parent_id > b.parent_id ? 1 : -1)
        for (let i = arr.length; i--;) {
          arr[i].disabled = arr[i].counts > 0
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
        this.data = arr
      }
    })
  },
  watch: {
    filterText (val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    batchDelete () {
      let v = this.$refs.tree.getCheckedKeys()
      if (v.length) {
        this.$confirm('确定要删除此分类吗！', '系统提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ajax.call(this, '/batchDelSort', {ids: v.join(',')}, (d, err) => {
            if (!err) {
              let a = (obj) => {
                obj && obj.forEach((o, i) => {
                  v.includes(o.id) ? obj.splice(i, 1) : a(o.children)
                })
              }
              a(this.data)
            }
          })
        }).catch(() => {})
      } else {
        this.$message('请先选择数据！')
      }
    },
    saveSort () {
      this.$refs.sortForm.validate(v => {
        if (v) {
          this.visible = true
          this.loading = true
          let p = this.parent_id
          this.form.parent_id = p.length ? p.slice(-1)[0] : 0
          ajax.call(this, '/updateSort', this.form, (data, err) => {
            this.visible = false
            this.loading = false
            if (!err) {
              let json = data.data
              let msg
              if (!this.parent_store) {
                this.data.push(json)
                msg = '添加根分类成功！'
              } else if (this.type === 'edit') {
                Object.assign(this.parent_data, json)
                msg = '修改分类成功！'
              } else if (this.type === 'plus') {
                this.parent_store.append(json, this.parent_data)
                msg = '添加子级分类成功！'
              }
              this.$message({
                message: msg,
                type: 'success'
              })
            }
          })
        }
      })
    },
    addSort () {
      for (let key in this.form) {
        if(this.form.hasOwnProperty(key)){
          this.form[key] = key === 'id' ? 0 : ''
        }
      }
      this.parent_id = []
      this.visible = true
      this.type = 'add'
      this.parent_store = null
      this.$refs.sortForm && this.$refs.sortForm.resetFields()
    },
    filterNode (value, data) {
      if (!value) return true
      return data.sort_name.indexOf(value) !== -1
    },
    headleClick (icon, data, store) {
      if (icon === 'delete') {
        this.$confirm('确定要删除此分类吗？', '系统提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ajax.call(this, '/deleteSort', {id: data.id}, (d, err) => {
            if (!err) {
              store.remove(data)
            }
          })
        }).catch(() => {
        })
      } else if (icon === 'plus' || icon === 'edit') {
        this.$refs.sortForm && this.$refs.sortForm.resetFields()
        this.type = icon
        const f = this.form
        if (icon === 'plus') {
          f.id = 0
          f.sort_name = ''
          this.parent_id.push(data.id)
        } else {
          f.id = data.id
          f.sort_name = data.sort_name
        }
        f.sort_type = data.sort_type
        this.parent_store = store
        this.parent_data = data
        this.visible = true
      }
    },
    renderContent (h, {node, data, store}) {
      let but = (type, icon) => {
        let dis = icon === 'delete' ? (data.disabled || this.grade.deleteSort) : this.grade.updateSort
        return h('el-button', {
          props: {size: 'small', type, icon, disabled: dis},
          on: {
            click: () => {
              let p = node.parent
              this.parent_id = []
              while (p.parent) {
                this.parent_id.unshift(p.data.id)
                p = p.parent
              }
              this.headleClick(icon, data, store)
            }
          }
        })
      }
      return h('span', [h('span', [h('span'), [node.label, h('span', {style: {color: '#999', marginLeft: '10px'}}, common.sort_type[node.data.sort_type])]]), h('span', {style: {float: 'right', margin: '-2px 10px'}}, [but('success', 'plus'), but('warning', 'edit'), but('danger', 'delete')])])
    }
  },
  mixins: [common.mixin]
}
</script>
<style lang="less">
    .filter-tree {
        margin-top: 10px;
        border-radius: 5px;
        .el-cascader{width:100%}
        .el-tree-node__content>.el-checkbox{
            height:40px;
        }
        .el-tree-node__content {
            border-bottom: 1px dashed #ddd;
            white-space: normal;
        }
    }
    .button-tree {
        text-align: right;
        button {
            margin-left: 10px
        }
    }
</style>
