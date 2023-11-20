<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="100px" label="仓库名称" prop="storeName">
        <el-input
          v-model="queryParams.storeName"
          placeholder="请输入仓库名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px">
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
          v-hasPermi="['module:store:add']"
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
          v-hasPermi="['module:store:edit']"
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
          v-hasPermi="['module:store:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:store:export']"
        >导出</el-button>
      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="storeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="仓库名称" align="center" prop="storeName" />
      <el-table-column label="仓库大小(㎡)" align="center" prop="storeSize" />
      <el-table-column label="仓库地址" align="center" prop="storeAddress" />
      <el-table-column label="仓库管理员" align="center" prop="store_manager" />
      <el-table-column label="仓库最新检查时间" align="center" prop="store_check" />
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
            v-hasPermi="['module:store:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:store:remove']"
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

    <!-- 添加或修改仓库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label-width="100px" label="仓库名称" prop="storeName">
          <el-input v-model="form.storeName" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label-width="100px" label="仓库大小(㎡)" prop="storeSize">
          <el-input v-model="form.storeSize" placeholder="请输入仓库大小(㎡)" />
        </el-form-item>
        <el-form-item label-width="100px" label="仓库地址" prop="storeAddress">
          <el-input v-model="form.storeAddress" placeholder="请输入仓库地址" />
        </el-form-item>
        <!--<el-form-item label-width="100px" label="仓库管理员" prop="store_manager">-->
          <!--<el-input v-model="form.store_manager" placeholder="请输入仓库管理员" />-->
        <!--</el-form-item>-->

        <el-form-item label-width="100px" label="仓库管理员" prop="manager_id"  >
          <el-select v-model="form.manager_id" placeholder="请选择仓库管理员" ref="userSelection">
            <el-option
              v-if="item.roleName == '仓库管理员'"
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="检查时间" prop="createTime">
        <el-date-picker clearable size="small"
                        v-model="form.store_check"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择检查时间">
        </el-date-picker>
        </el-form-item>
        <el-form-item label-width="100px" label="备注" prop="remark">
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
    listStore, getStore, delStore, addStore, updateStore,getuserList
} from "@/api/module/store";
import { mapGetters } from 'vuex'

export default {
  name: "Store",
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
      // 仓库表格数据
      storeList: [],
      userList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        storeName: null,
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
    this.getuserInfo();
  },
  methods: {
    getuserInfo() {
      getuserList({}).then(response => {
        this.userList = response.data
      })
    },
    /** 查询仓库列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'cangguan'){
        this.queryParams.manager_id = this.name.userId;
      }
      listStore(this.queryParams).then(response => {
        this.storeList = response.rows;
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
        storeId: null,
        storeName: null,
        storeSize: null,
        storeAddress: null,
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
      this.ids = selection.map(item => item.storeId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加仓库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const storeId = row.storeId || this.ids
      getStore(storeId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改仓库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.store_manager = this.$refs.userSelection.selectedLabel;
          if (this.form.storeId != null) {
            updateStore(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addStore(this.form).then(response => {
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
      const storeIds = row.storeId || this.ids;
      this.$modal.confirm('是否确认删除仓库编号为"' + storeIds + '"的数据项？').then(function() {
        return delStore(storeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/store/export', {
        ...this.queryParams
      }, `store_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
