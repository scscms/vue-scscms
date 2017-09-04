<template>
    <div class="grid-table">
        <el-button style="margin-bottom:5px" type="danger" @click="batchesDelFiles" :disabled="grade.delFile">批量删除</el-button>
        <el-table stripe border style="width:100%" :data="table_data.data" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" :selectable="selectable"></el-table-column>
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
                    delFile:!0,
                },
                search_data:{
                    page: 1,
                    pageSize: 10
                },
                multipleSelection:[],
                table_data: {
                    columns: [
                        {"key": "file_name", "name": "文件名称", minWidth: 100},
                        {"key": "user_name", "name": "上传者", width: 80},
                        {"key": "file_path", "name": "文件路径", minWidth: 120},
                        {"key": "mime_type", "name": "文件类型", width: 100},
                        {"key": "file_size", "name": "文件大小KB", width: 120},
                        {"key": "create_time", "name": "上传时间", minWidth:100},
                        {"key": "operations", "name": "操作", width: 158}
                    ],
                    total: 0,
                    data: []
                }
            }
        },
        methods: {
            batchesDelFiles(){
                if(this.multipleSelection.length){
                    let ids = this.multipleSelection.map(obj=>obj.id).join(',');
                    this.$confirm(`确定要批量删除文件和记录吗？`, '系统提醒', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        ajax.call(this, '/delFile', {id:ids,delRecord:true}, (d, err) => {
                            if (!err) {
                                this.ajaxData();
                            }
                        })
                    }).catch(() => {});
                }else{
                    this.$message('请先选择文件');
                }
            },
            selectable(){
                return !this.grade.delFile;
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            createButton(h, row, code, text){
                let self = this;
                const arr = [text];
                return h('el-button', {
                    props: {size: 'small'},
                    on: {
                        click(){
                            self.healColumnClick(code, row)
                        }
                    }
                },arr)
            },
            //格式化输出内容
            columnFormatter(row, column){
                let key = column.property;
                let str = row[key]||'';
                let h = this.$createElement;
                let self = this;
                if(key === 'file_size'){
                    str = (str/1024).toFixed(2)+'KB';
                }else if(key === 'create_time'){
                    str = str.replace(/[^-\d].+/,'');
                }else if(key === 'operations'){
                    let but = (row,type,name) => {
                        return h('el-button', {
                            props: {size: "small",disabled:self.grade.delFile||type==='delFile' && row.is_delete === 1}, on: {
                                click: () => {
                                    self.headleClick(type,row);
                                }
                            }
                        },name)
                    };
                    return h('div',[
                        but(row,'delFile','删文件'),but(row,'delFileAll','全删除')
                    ])
                }
                return str;
            },
            //处理列、按钮点击
            headleClick(type, row){
                this.$confirm(`确定要删除文件${type==='delFile'?'':'和记录'}吗？`, '系统提醒', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    ajax.call(this, '/delFile', {id:row.id,delRecord:type === 'delFileAll'}, (d, err) => {
                        if (!err) {
                            if(type === 'delFileAll'){
                                this.ajaxData();
                            }else{
                                row.is_delete = 1;
                            }
                        }
                    })
                }).catch(() => {});
            },
            ajaxData(){
                ajax.call(this, '/listUpFile', this.search_data, (obj, err) => {
                    if (!err) {
                        this.table_data.data = obj.data;
                        this.table_data.total = obj.total;
                        this.search_data.page = obj.page;
                    }
                });
            },
            handleCurrentChange(page){
                if(page !== this.search_data.page){
                    this.search_data.page = page;
                    this.ajaxData();
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

</style>
