<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="110px" label="司机姓名" prop="driverName">
        <el-input
          v-model="queryParams.driverName"
          placeholder="请输入司机姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="110px" label="司机状态" prop="driverStatus">
        <el-select
          v-model="queryParams.work_type"
          placeholder="请选择工作状态"
          clearable
          size="small"
          @change="handleQuery"
        >
          <el-option label="显示全部" value=""></el-option>
          <el-option label="在职" value="在职"></el-option>
          <el-option label="休假" value="休假"></el-option>
          <el-option label="离职" value="离职"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="110px">
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
          v-hasPermi="['module:driver:add']"
        >新增</el-button>
<!--        @click是在绑定事件-->
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['module:driver:edit']"
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
          v-hasPermi="['module:driver:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:driver:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="driverList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID号" align="center" prop="driver_ids" />
      <el-table-column label="司机姓名" align="center" prop="driverName" />
      <el-table-column label="电话号码" align="center" prop="phone" />
      <el-table-column label="紧急联系方式" align="center" prop="address" />
      <el-table-column label="驾龄" align="center" prop="driverExp" />
      <el-table-column label="驾照类型" align="center" prop="license_type"/>
      <el-table-column label="工作状态" align="center" prop="work_type">
      <template slot-scope="scope">
      <dict-tag :options="dict.type.sys_driver_status" :value="scope.row.work_type"/>
      </template>
      </el-table-column>
      <el-table-column label="入职时间" align="center" prop="createTime" width="180">
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
            v-hasPermi="['module:driver:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:driver:remove']"
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

    <!-- 添加或修改司机对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label-width="110px" label="司机ID号" prop="driver_ids">
          <el-input v-model="form.driver_ids" placeholder="请输入司机ID号" />
        </el-form-item>
        <el-form-item label-width="110px" label="司机姓名" prop="driverName">
          <el-input v-model="form.driverName" placeholder="请输入司机姓名" />
        </el-form-item>
        <el-form-item label-width="110px" label="联系方式" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label-width="110px" label="紧急联系方式" prop="address">
          <el-input v-model="form.address" placeholder="请输入紧急联系方式" />
        </el-form-item>
        <el-form-item label-width="110px" label="驾龄" prop="driverExp">
          <el-input v-model="form.driverExp" placeholder="请输入驾龄" />
        </el-form-item>
        <el-form-item label-width="110px" label="驾照类型" prop="license_type">
          <el-input v-model="form.license_type" placeholder="请输入驾照类型" />
        </el-form-item>
        <el-form-item label-width="110px" label="工作状态" prop="work_type">
          <el-select v-model="form.work_type" placeholder="请选择工作状态">
            <el-option
            v-for="dict in dict.type.sys_driver_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="110px" label="备注" prop="remark" style="height:200px;">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :rows="6" />
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
    listDriver, getDriver, delDriver, addDriver, updateDriver
} from "@/api/module/driver";
import { mapGetters } from 'vuex'

export default {
  name: "Driver",
  dicts: ['sys_driver_status'],
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
      // 司机表格数据
      driverList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        driverName: null,
        work_type:null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
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
  },
  methods: {

    /** 查询司机列表 */
    getList() {
      this.loading = true;
      listDriver(this.queryParams).then(response => {
        this.driverList = response.rows;
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
        driverId: null,
        driverName: null,
        phone: null,
        address: null,
        driverExp: null,
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
      this.resetForm("queryForm");//resetForm是清空表单字段的意思，queryForm
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.driverId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加司机";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const driverId = row.driverId || this.ids
      getDriver(driverId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改司机";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {

          if (this.form.driverId != null) {
            updateDriver(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDriver(this.form).then(response => {
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
      const driverIds = row.driverId || this.ids;
      this.$modal.confirm('是否确认删除司机编号为"' + driverIds + '"的数据项？').then(function() {
        return delDriver(driverIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/driver/export', {
        ...this.queryParams
      }, `driver_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
