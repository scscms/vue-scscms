<template>
    <div>
        <el-row class="grid-table">
            <el-form :inline="true" :model='search_data'>
                <el-form-item label="帐号">
                    <el-input size="small" v-model="search_data.user_name"></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input size="small" v-model="search_data.user_email"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select size="small" v-model="search_data.user_type">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="(value,key) in user_type" :key="key"
                                   :label="value" :value="key">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button size="small" icon="search" @click='onSearch'>查询</el-button>
                    <el-button size="small" icon="plus" :disabled="grade.updateUser" type="primary" @click='add'>添加用户</el-button>
                </el-form-item>
            </el-form>
            <el-button type="danger" :disabled="grade.deleteUser" @click='deleteUser()'>批量删除</el-button>
            <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data" @selection-change="handleSelectionChange">
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
        </el-row>
    </div>
</template>
<script type="text/javascript">
    import {ajax,storage} from 'utils';
    import common from 'common';
    module.exports = {
        name: 'list',
        data() {
            return {
                page_grade:common.page_grade,
                grade:{
                    listUser:!0,
                    updateUser:!0,
                    passedUser:!0,
                    deleteUser:!0,
                },
                user_type:common.user_type,
                search_data: {
                    user_name: '',
                    user_type: '',
                    user_email: ''
                },
                multipleSelection:[],
                table_data: {
                    columns: [
                        {"key": "user_name", "name": "用户帐号", width: 150},
                        {"key": "user_email", "name": "用户邮箱", minWidth: 120},
                        {"key": "user_type", "name": "用户类型", width: 120},
                        {"key": "create_time", "name": "注册时间", width:150},
                        {"key": "operations", "name": "操作", width: 135}
                    ],
                    data: []
                }
            }
        },
        methods: {
            ajaxData(){
                ajax.call(this, '/listUser', this.search_data, (obj, err) => {
                    if (!err) {
                        this.table_data.data = obj.data;
                    }
                });
            },
            onSearch() {
                this.ajaxData();
            },
            selectable(row){
                return !this.grade.deleteUser && /^[034]$/.test(row.user_type);
            },
            createButton(h, row, code, text){
                let self = this;
                let dis = false;
                if(code === 'user_type' && this.grade.passedUser
                ||code === 'edit' && this.grade.updateUser
                ||code === 'delete' && (/^1|2$/.test(row.user_type)||this.grade.deleteUser)){
                    dis = true;
                }
                return h('el-button', {
                    props: {size: 'small',disabled:dis},
                    on: {
                        click(){
                            self.healColumnClick(code, row)
                        }
                    }
                },[text])
            },
            columnFormatter(row, column){
                let key = column.property;
                let str = row[key]+'';
                let h = this.$createElement;
                if(key === 'create_time'){
                    str = str.replace(/[^-\d].+/,'');
                }else if(key === 'operations'){
                    return h('div',[
                        this.createButton(h,row,'edit','编辑'),
                        this.createButton(h,row,'delete','删除'),
                    ])
                }else if(key === 'user_type'){
                    if(str === '0'){
                        return this.createButton(h,row,key,'通过');
                    }
                    str = common.user_type[str]||'未知';
                }
                return str;
            },
            deleteUser(arr){
                if(!arr){
                    if(this.multipleSelection.length){
                        arr = this.multipleSelection;
                    }else{
                        return this.$message("请先选择用户");
                    }
                }
                this.$confirm(`确定要${arr.length>1?'批量删除用户':'删除此用户'}吗？`, '系统提醒', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    ajax.call(this, '/deleteUser', {ids:arr.map(o=>o.id).join(",")}, (d, err) => {
                        !err && this.ajaxData();
                    })
                }).catch(() => {});
            },
            passedUser(arr){
                ajax.call(this, '/passedUser', {ids:arr.map(o=>o.id).join(",")}, (obj, err) => {
                    if (!err) {
                        arr.forEach(row=>{
                            row.passed = obj.passed;
                        })
                    }
                });
            },
            add(){
                this.$router.push('/user/add');
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            healColumnClick(code, row){
                if(code ==='edit'){
                    this.$router.push('/user/edit/'+row.id);
                }else if(code ==='passed'){
                    this.passedUser([row]);
                }else if(code === 'delete'){
                    this.deleteUser([row]);
                }
            },
        },
        mounted() {
            this.ajaxData();
        },
        mixins:[common.mixin]
    }
</script>
<style lang="less">
    .grid-table{
        .el-form-item{
            display: inline-block;
            max-height:240px;
            width:~'calc(24% - 10px)';
            &:first-child{
                .el-input{
                    margin-right:25px;
                }
            }
            &:last-child{
                overflow: hidden;
                white-space: nowrap;
                vertical-align: bottom;
            }
        }
        .el-pagination{
            margin-top:5px;
            text-align: right;
        }
        .el-cascader--small .el-cascader__label{
            line-height: 40px;
        }
    }
</style>
