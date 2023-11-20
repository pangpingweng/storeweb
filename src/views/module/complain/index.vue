<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="运输编号" prop="shipId">
        <el-input
          v-model="queryParams.shipId"
          placeholder="请输入运输编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="经销商" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入经销商"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['module:complain:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['module:complain:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['module:complain:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:complain:export']"
        >导出</el-button>
      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="complainList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="运输编号" align="center" prop="shipId" />
      <el-table-column label="投诉经销商" align="center" prop="userName" />
<!--      <el-table-column label="投诉内容" align="center" prop="complainText" />-->
      <el-table-column label="投诉状态" align="center" prop="complainStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_complain_status" :value="scope.row.complainStatus"/>
        </template>
      </el-table-column>
<!--      <el-table-column label="投诉反馈" align="center" prop="complainReply" />-->
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:complain:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:complain:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改投诉对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!--<el-form-item label-width="90px" label="运输id" prop="shipId">-->
          <!--<el-input v-model="form.shipId" placeholder="请输入运输id" />-->
        <!--</el-form-item>-->
    <el-form-item label-width="90px" label="运输编号" prop="shipId">
      <el-select v-model="form.shipId" placeholder="请选择运输编号" ref="userSelection">
        <el-option
          v-for="item in shipList"
          :key="item.stockName"
          :label="item.stockName"
          :value="item.stockName"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label-width="90px" label="经销商" prop="userId" v-if="roles[0]!='jingxiaoshang'">
        <el-select v-model="form.userId" placeholder="请选择经销商" ref="userSelection">
            <el-option
              v-if="item.roleName == '经销商'"
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="90px" label="投诉内容" prop="complainText">
          <el-input v-model="form.complainText" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label-width="90px" label="投诉状态" prop="complainStatus" v-if="roles[0]!='jingxiaoshang'">
          <el-select v-model="form.complainStatus" placeholder="请选择投诉状态">
            <el-option
              v-for="dict in dict.type.sys_complain_status"
              :key="dict.value"
              :label="dict.label"
:value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="90px" label="投诉反馈" prop="complainReply" v-if="roles[0]!='jingxiaoshang'">
          <el-input v-model="form.complainReply" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label-width="90px" label="投诉反馈" prop="complainReply2" v-if="roles[0] !== 'manager' && roles[0] !== 'yunguan'">
          <div>{{ form.complainReply }}</div>
        </el-form-item>
        <el-form-item label-width="90px" label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
        getuserList,getshipList,
    listComplain, getComplain, delComplain, addComplain, updateComplain
} from "@/api/module/complain";
import { mapGetters } from 'vuex'

export default {
  name: "Complain",
  dicts: ['sys_complain_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 投诉表格数据
      complainList: [],
       userList: [],
      shipList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shipId: null,
        userId: null,
        userName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        shipId: [
          { required: true, message: "运输id不能为空", trigger: "blur" }
        ],
      }
    };
  },
  computed: {
    ...mapGetters([
        'roles',
        'name',
    ]),
  },
  created() {
    this.getList();
    this.getuserInfo();
    this.getshipInfo();
  },
  methods: {

    getuserInfo(){
        getuserList({}).then(response => {
            this.userList = response.data;
        });
    },
    getshipInfo(){
      let params = {
      }
      if(this.roles[0] == 'jingxiaoshang'){
        params.dealerid = this.name.userId;
      }
      getshipList(params).then(response => {
        this.shipList = response.data;
      });
    },
    /** 查询投诉列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'jingxiaoshang'){
        this.queryParams.userId = this.name.userId;
      }
      listComplain(this.queryParams).then(response => {
        this.complainList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        complainId: null,
        shipId: null,
        userId: null,
        userName: null,
        complainText: null,
        complainReply: null,
        complainStatus: null,
        createTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.complainId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加投诉";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const complainId = row.complainId || this.ids
      getComplain(complainId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改投诉";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.roles[0] == 'jingxiaoshang'){
            this.form.userId = this.name.userId;
            this.form.userName = this.name.nickName;
          }else{
            this.form.userName = this.$refs.userSelection.selectedLabel
          }
          if (this.form.complainId != null) {
            updateComplain(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addComplain(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const complainIds = row.complainId || this.ids;
      this.$modal.confirm('是否确认删除投诉编号为"' + complainIds + '"的数据项？').then(function() {
        return delComplain(complainIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/complain/export', {
        ...this.queryParams
      }, `complain_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
