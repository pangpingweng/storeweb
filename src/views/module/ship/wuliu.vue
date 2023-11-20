<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="司机名称" prop="driverName">
        <el-input
          v-model="queryParams.driverName"
          placeholder="请输入司机名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="车辆名称" prop="carName">
        <el-input
          v-model="queryParams.carName"
          placeholder="请输入车辆名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="出库编号" prop="stockName">
        <el-input
          v-model="queryParams.stockName"
          placeholder="请输入出库编号"
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

    <el-table v-loading="loading" :data="shipList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="出库编号" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="'/module/ship/index/' + scope.row.stockName" class="link-type">
            <span>{{ scope.row.stockName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运输状态" align="center" prop="shipStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_ship_status" :value="scope.row.shipStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="司机名称" align="center" prop="driverName" />
      <el-table-column label="车辆名称" align="center" prop="carName" />
      <el-table-column label="经销商" align="center" prop="dealer" />
      <el-table-column label="预期时间" align="center" prop="dueTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dueTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:ship:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:ship:remove']"
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

    <!-- 添加或修改运输对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label-width="90px" label="出库编号" prop="stockId">
          <el-select v-model="form.stockId" placeholder="请选择出库编号" ref="stockSelection" disabled="true">
            <el-option
              v-for="item in stockList"
              :key="item.stockId"
              :label="item.stockName"
              :value="item.stockId"
            ></el-option>
          </el-select>
        </el-form-item>
    <el-form-item label-width="90px" label="司机名称" prop="driverId">
        <el-select v-model="form.driverId" placeholder="请选择司机名称" ref="driverSelection" disabled="true">
            <el-option
                    v-for="item in driverList"
                    :key="item.driverId"
                    :label="item.driverName"
                    :value="item.driverId"
            ></el-option>
        </el-select>
    </el-form-item>
    <el-form-item label-width="90px" label="车辆名称" prop="carId">
        <el-select v-model="form.carId" placeholder="请选择车辆名称" ref="carSelection" disabled="true">
            <el-option
                    v-for="item in carList"
                    :key="item.carId"
                    :label="item.carName"
                    :value="item.carId"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="90px" label="经销商" prop="dealer">
          <el-input v-model="form.dealer" placeholder="请输入经销商" disabled="true"/>
        </el-form-item>
        <el-form-item label-width="90px" label="经销商地址" prop="dealeraddr">
          <el-input v-model="form.dealeraddr" placeholder="请输入经销商地址" disabled="true"/>
        </el-form-item>
        <el-form-item label-width="90px" label="经销商电话" prop="dealerphone">
          <el-input v-model="form.dealerphone" placeholder="请输入经销商电话容" disabled="true"/>
        </el-form-item>
        <el-form-item label-width="90px" label="司机电话" prop="driverphone">
          <el-input v-model="form.driverphone" placeholder="请输入司机电话" />
        </el-form-item>

        <el-form-item label-width="90px" label="预期时间" prop="dueTime">
          <el-date-picker clearable size="small"
            v-model="form.dueTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择预期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label-width="90px" label="运输状态" prop="shipStatus">
          <el-select v-model="form.shipStatus" placeholder="请选择运输状态">
            <el-option
              v-for="dict in dict.type.sys_ship_status"
              :key="dict.value"
              :label="dict.label"
:value="dict.value"
            ></el-option>
          </el-select>
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
        getdriverList,listWuliu,
        getcarList,
        getstockList,
    listShip, getShip, delShip, addShip, updateShip
} from "@/api/module/ship";
import { mapGetters } from 'vuex'

export default {
  name: "Ship",
  dicts: ['sys_ship_status'],
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
      // 运输表格数据
      shipList: [],
       driverList: [],
       carList: [],
       stockList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        driverName: null,
        carName: null,
        stockName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        driverId: [
          { required: true, message: "司机名称不能为空", trigger: "blur" }
        ],
        carId: [
          { required: true, message: "车辆名称不能为空", trigger: "blur" }
        ],
        stockId: [
          { required: true, message: "出库id不能为空", trigger: "blur" }
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
    this.getdriverInfo();
    this.getcarInfo();
    this.getstockInfo();
  },
  methods: {

    getdriverInfo(){
        getdriverList({}).then(response => {
            this.driverList = response.data;
        });
    },
    getcarInfo(){
        getcarList({}).then(response => {
            this.carList = response.data;
        });
    },
    getstockInfo(){
        getstockList({}).then(response => {
            this.stockList = response.data;
        });
    },
    /** 查询运输列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'jingxiaoshang'){
        this.queryParams.dealerid = this.name.userId;
      }
      listWuliu(this.queryParams).then(response => {
        this.shipList = response.rows;
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
        shipId: null,
        driverId: null,
        driverName: null,
        carId: null,
        carName: null,
        stockId: null,
        stockName: null,
        dueTime: null,
        shipStatus: null,
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
      this.ids = selection.map(item => item.shipId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加运输";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const shipId = row.shipId || this.ids
      getShip(shipId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改运输";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.driverName = this.$refs.driverSelection.selectedLabel;;
          this.form.carName = this.$refs.carSelection.selectedLabel;;
          this.form.stockName = this.$refs.stockSelection.selectedLabel;;

          if (this.form.shipId != null) {
            updateShip(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addShip(this.form).then(response => {
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
      const shipIds = row.shipId || this.ids;
      this.$modal.confirm('是否确认删除运输编号为"' + shipIds + '"的数据项？').then(function() {
        return delShip(shipIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/ship/export', {
        ...this.queryParams
      }, `ship_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
