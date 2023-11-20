<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="车辆名称" prop="carName">
        <el-input
          v-model="queryParams.carName"
          placeholder="请输入车辆名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="车辆状态" prop="car_status">
        <el-select v-model="queryParams.car_status" placeholder="请选择车辆状态">
          <el-option label="空闲" value="空闲"></el-option>
          <el-option label="运输中" value="运输中"></el-option>
          <el-option label="维修中" value="维修中"></el-option>
          <el-option label="已淘汰" value="已淘汰"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="90px" label="车辆种类" prop="car_type">
        <el-select v-model="queryParams.car_type" placeholder="请选择车辆种类">
          <el-option label="普货车" value="普货车"></el-option>
          <el-option label="冷藏卡车" value="冷藏卡车"></el-option>
          <el-option label="冷藏拖车" value="冷藏拖车"></el-option>
          <el-option label="冷藏箱式货车" value="冷藏箱式货车"></el-option>
          <el-option label="特种车" value="特种车"></el-option>
        </el-select>
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
          v-hasPermi="['module:car:add']"
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
          v-hasPermi="['module:car:edit']"
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
          v-hasPermi="['module:car:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:car:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="carList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="65" align="center" />
      <el-table-column label="车辆名称" align="center" prop="carName" />
      <el-table-column label="购车时间" align="center" prop="buyYear" />
      <el-table-column label="车牌号" align="center" prop="carPlate" />
      <el-table-column label="车辆种类" align="center" prop="car_type"/>
      <el-table-column label="车辆载重" align="center" prop="car_weight"/>
      <el-table-column label="车辆状态" align="center" prop="car_status">
      <template slot-scope="scope">
       <dict-tag :options="dict.type.sys_car_status" :value="scope.row.car_status"/>
      </template>
      </el-table-column>
      <el-table-column label="最后检查时间" align="center" prop="createTime" width="180">
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
            v-hasPermi="['module:car:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:car:remove']"
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

    <!-- 添加或修改车辆对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label-width="90px" label="车辆名称" prop="carName">
          <el-input v-model="form.carName" placeholder="请输入车辆名称" />
        </el-form-item>
        <el-form-item label-width="90px" label="购车时间" prop="buyYear">
          <el-date-picker clearable size="small"
                          v-model="form.buyYear"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择购车时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label-width="90px" label="车牌号" prop="carPlate">
          <el-input v-model="form.carPlate" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label-width="90px" label="车辆种类" prop="car_type">
          <el-select v-model="form.car_type" placeholder="请选择车辆种类">
            <el-option label="普货车" value="普货车"></el-option>
<!--            适用于普通货物的短途运输，可用于市场上大量的货物短途配送。-->
            <el-option label="冷藏卡车" value="冷藏卡车"></el-option>
<!--            适用于跨市、跨省级的冷链物流运输，可用于食品厂家、大型超市、果品销售企业等场合。-->
            <el-option label="冷藏拖车" value="冷藏拖车"></el-option>
            <!--            适用于长途、大批量的冷链物流运输。可用于食品加工企业、大型商场、大型超市等场所。-->
            <el-option label="冷藏箱式货车" value="冷藏箱式货车"></el-option>
<!--            适用于短距离的，负载适中的冷链运输。可用于大型集市、超市、批发市场等场合。-->
            <el-option label="特种车" value="特种车"></el-option>
<!--            比如食品压力罐车，粉罐运输车等，适用于一些特殊货品的运输。-->
          </el-select>
        </el-form-item>
        <el-form-item label-width="90px" label="车辆载重" prop="car_weight">
          <el-input v-model="form.car_weight" placeholder="请输入车辆载重" />
        </el-form-item>
        <el-form-item label-width="90px" label="车辆状态" prop="car_status">
          <el-select v-model="form.car_status" placeholder="请选择车辆状态">
            <el-option label="空闲" value="空闲"></el-option>
            <el-option label="运输中" value="运输中"></el-option>
            <el-option label="维修中" value="维修中"></el-option>
            <el-option label="已淘汰" value="已淘汰"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="90px" label="检修时间" prop="createTime">
          <el-date-picker clearable size="small"
                          v-model="form.createTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="选择检修时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label-width="90px" label="备注" prop="remark" style="height:200px;">
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
    listCar, getCar, delCar, addCar, updateCar
} from "@/api/module/car";
import { mapGetters } from 'vuex'

export default {
  name: "Car",
  dicts: ['sys_car_status'],
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
      // 车辆表格数据
      carList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        carName: null,
        car_type: null,
        car_weight: null,
        car_status: null,
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

    /** 查询车辆列表 */
    getList() {
      this.loading = true;
      const queryParams = Object.assign({}, this.queryParams);
      if(queryParams.car_status === "") {
        delete queryParams.car_status;
      }
      if(queryParams.car_type === "") {
        delete queryParams.car_type;
      }
      listCar(queryParams).then(response => {
        this.carList = response.rows;
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
        carId: null,
        carName: null,
        buyYear: null,
        carPlate: null,
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
      this.queryParams.car_status = null;
      this.queryParams.car_type = null;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.carId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加车辆";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const carId = row.carId || this.ids
      getCar(carId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改车辆";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {

          if (this.form.carId != null) {
            updateCar(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCar(this.form).then(response => {
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
      const carIds = row.carId || this.ids;
      this.$modal.confirm('是否确认删除车辆编号为"' + carIds + '"的数据项？').then(function() {
        return delCar(carIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/car/export', {
        ...this.queryParams
      }, `car_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
