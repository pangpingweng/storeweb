<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="所属分区" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          placeholder="请输入所属分区"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="报警名称" prop="warnName">
        <el-input
          v-model="queryParams.warnName"
          placeholder="请输入报警名称"
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
          v-hasPermi="['module:warn:add']"
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
          v-hasPermi="['module:warn:edit']"
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
          v-hasPermi="['module:warn:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:warn:export']"
        >导出</el-button>
      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="warnList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属分区" align="center" prop="areaName" />
      <el-table-column label="报警名称" align="center" prop="warnName" />
      <el-table-column label="报警原因" align="center" prop="warnReason" />
      <el-table-column label="当前情况" align="center" prop="warnDesc" />
      <el-table-column label="报警状态" align="center" prop="warnStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_warn_status" :value="scope.row.warnStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="报警时间" align="center" prop="createTime" width="180">
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
            v-hasPermi="['module:warn:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:warn:remove']"
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

    <!-- 添加或修改报警对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label-width="90px" label="所属分区" prop="areaId">
        <el-select v-model="form.areaId" placeholder="请选择所属分区" ref="areaSelection">
            <el-option
                    v-for="item in areaList"
                    :key="item.areaId"
                    :label="item.areaName"
                    :value="item.areaId"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="90px" label="报警名称" prop="warnName">
          <el-input v-model="form.warnName" placeholder="请输入报警名称" />
        </el-form-item>
        <el-form-item label-width="90px" label="报警原因" prop="warnReason">
          <el-input v-model="form.warnReason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label-width="90px" label="当前情况" prop="warnDesc">
          <el-input v-model="form.warnDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label-width="90px" label="报警状态" prop="warnStatus">
          <el-select v-model="form.warnStatus" placeholder="请选择报警状态">
            <el-option
              v-for="dict in dict.type.sys_warn_status"
              :key="dict.value"
              :label="dict.label"
:value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="90px" label="处理意见" prop="warnIdea">
          <el-input v-model="form.warnIdea" type="textarea" placeholder="请输入内容" />
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
        getareaList,
    listWarn, getWarn, delWarn, addWarn, updateWarn
} from "@/api/module/warn";
import { mapGetters } from 'vuex'

export default {
  name: "Warn",
  dicts: ['sys_warn_status'],
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
      // 报警表格数据
      warnList: [],
       areaList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        areaName: null,
        warnName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        areaId: [
          { required: true, message: "所属分区不能为空", trigger: "blur" }
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
    this.getareaInfo();
  },
  methods: {

    getareaInfo(){
        getareaList({}).then(response => {
            this.areaList = response.data;
        });
    },
    /** 查询报警列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'cangguan'){
        this.queryParams.manager_id = this.name.userId;
      }
      this.queryParams.type = "1";
      listWarn(this.queryParams).then(response => {
        this.warnList = response.rows;
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
        warnId: null,
        areaId: null,
        areaName: null,
        warnName: null,
        warnReason: null,
        warnDesc: null,
        warnStatus: null,
        warnIdea: null,
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
      this.ids = selection.map(item => item.warnId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加报警";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const warnId = row.warnId || this.ids
      getWarn(warnId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改报警";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
this.form.areaName = this.$refs.areaSelection.selectedLabel;;

          if (this.form.warnId != null) {
            updateWarn(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWarn(this.form).then(response => {
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
      const warnIds = row.warnId || this.ids;
      this.$modal.confirm('是否确认删除报警编号为"' + warnIds + '"的数据项？').then(function() {
        return delWarn(warnIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/warn/export', {
        ...this.queryParams
      }, `warn_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
