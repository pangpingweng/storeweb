<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="所在仓库" prop="storeId">
        <el-select v-model="queryParams.storeId" placeholder="请选择所在仓库" ref="storeSelection">
          <el-option
            v-for="item in storeList"
            :key="item.storeId"
            :label="item.storeName"
            :value="item.storeId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="100px" label="分区名称" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          placeholder="请输入分区名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="90px" label="分区状态" prop="store_status">
        <el-select
          v-model="queryParams.store_status"
          placeholder="请选择工作状态"
          clearable
          size="small"
          @change="handleQuery"
        >
          <el-option label="显示全部" value=""></el-option>
          <el-option label="可用" value="可用"></el-option>
          <el-option label="暂用" value="暂用"></el-option>
          <el-option label="检修中" value="检修中"></el-option>
        </el-select>
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
          v-hasPermi="['module:area:add']"
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
          v-hasPermi="['module:area:edit']"
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
          v-hasPermi="['module:area:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:area:export']"
        >导出</el-button>
      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="areaList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属仓库" align="center" prop="storeName" v-if="columns[0].visible"/>
      <el-table-column label="分区名称" align="center" prop="areaName" v-if="columns[1].visible"/>
      <el-table-column label="分区面积(㎡)" align="center" prop="areaSize" v-if="columns[2].visible"/>
      <el-table-column label="当前温度(℃)" align="center" prop="areaTemp"  v-if="columns[3].visible"><template slot-scope="scope"> {{ scope.row.areaTemp }} ℃ </template> </el-table-column>
      <el-table-column label="当前湿度(%)" align="center" prop="areaHumidity" v-if="columns[4].visible"><template slot-scope="scope"> {{ scope.row.areaHumidity }} %RH </template> </el-table-column>
      <el-table-column label="最高预警温度(℃)" align="center" prop="warnTemp" v-if="columns[5].visible"><template slot-scope="scope"> {{ scope.row.warnTemp }} ℃ </template> </el-table-column>
      <el-table-column label="最低预警温度(℃)" align="center" prop="area_downtemp" v-if="columns[6].visible"><template slot-scope="scope"> {{ scope.row.area_downtemp }} ℃ </template> </el-table-column>
      <el-table-column label="最高预警湿度(%)" align="center" prop="warnHumidity" v-if="columns[7].visible"><template slot-scope="scope"> {{ scope.row.warnHumidity }} %RH </template> </el-table-column>
      <el-table-column label="最低预警湿度(%)" align="center" prop="area_downhumidity" v-if="columns[8].visible"><template slot-scope="scope"> {{ scope.row.area_downhumidity }} %RH </template> </el-table-column>
      <el-table-column label="分区状态" align="center" prop="store_status" v-if="columns[9].visible"/>
      <el-table-column label="分区地址" align="center" prop="store_address" v-if="columns[10].visible"/>
<!--      <el-table-column label="检修时间" align="center" prop="createTime" width="180">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:area:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:area:remove']"
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

    <!-- 添加或修改分区对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label-width="100px" label="所属仓库" prop="storeId">
        <el-select v-model="form.storeId" placeholder="请选择所属仓库" ref="storeSelection">
            <el-option
                    v-for="item in storeList"
                    :key="item.storeId"
                    :label="item.storeName"
                    :value="item.storeId"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="100px" label="分区名称" prop="areaName">
          <el-input v-model="form.areaName" placeholder="请输入分区名称" />
        </el-form-item>
        <el-form-item label-width="100px" label="分区面积(㎡)" prop="areaSize">
          <el-input v-model="form.areaSize" placeholder="请输入分区面积" />
        </el-form-item>
        <el-form-item label-width="100px" label="分区温度(℃)" prop="areaTemp">
          <el-input v-model="form.areaTemp" placeholder="修改当前温度" />
        </el-form-item>
        <el-form-item label-width="100px" label="分区湿度(%)" prop="areaHumidity">
          <el-input v-model="form.areaHumidity" placeholder="修改当前湿度" />
        </el-form-item>
        <el-form-item label-width="100px" label="最高温度(℃)" prop="warnTemp">
          <el-input v-model="form.warnTemp" placeholder="请输入最高温度" />
        </el-form-item>
        <el-form-item label-width="100px" label="最低温度(℃)" prop="area_downtemp">
          <el-input v-model="form.area_downtemp" placeholder="请输入最低温度" />
        </el-form-item>
        <el-form-item label-width="100px" label="最高湿度(%)" prop="warnHumidity">
          <el-input v-model="form.warnHumidity" placeholder="请输入最高湿度" />
        </el-form-item>
        <el-form-item label-width="100px" label="最低湿度(%)" prop="area_downhumidity">
          <el-input v-model="form.area_downhumidity" placeholder="请输入最低湿度" />
        </el-form-item>
        <el-form-item label-width="90px" label="分区状态" prop="store_status">
          <el-select v-model="form.store_status" placeholder="请选择分区状态">
            <el-option label="可用" value="可用"></el-option>
            <el-option label="暂用" value="暂用"></el-option>
            <el-option label="检修中" value="检修中"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="分区所在地址" prop="store_address">
          <el-input v-model="form.store_address" placeholder="请输入预警湿度" />
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
        getstoreList,
    listArea, getArea, delArea, addArea, updateArea
} from "@/api/module/area";
import { mapGetters } from 'vuex'

export default {
  name: "Area",
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
      // 分区表格数据
      areaList: [],
       storeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        storeName: null,
        areaName: null,
        storeId:null,
        store_status:null,
      },
      // 列信息
      columns: [
        { key: 0, label: `所属仓库`, visible: true },
        { key: 1, label: `分区名称`, visible: true },
        { key: 2, label: `分区面积`, visible: true },
        { key: 3, label: `当前温度`, visible: true },
        { key: 4, label: `当前湿度`, visible: true },
        { key: 5, label: `最高预警温度`, visible: true },
        { key: 6, label: `最低预警温度`, visible: true },
        { key: 7, label: `最高预警湿度`, visible: true },
        { key: 8, label: `最低预警湿度`, visible: true },
        { key: 9, label: `分区状态`, visible: true },
        { key: 10, label: `分区地址`, visible: true }
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        storeId: [
          { required: true, message: "仓库id不能为空", trigger: "blur" }
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
    this.getstoreInfo();
  },
  methods: {

    getstoreInfo(){
        getstoreList({}).then(response => {
            this.storeList = response.data;
        });
    },
    /** 查询分区列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'cangguan'){
        this.queryParams.manager_id = this.name.userId;
      }
      listArea(this.queryParams).then(response => {
        this.areaList = response.rows;
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
        areaId: null,
        storeId: null,
        storeName: null,
        areaName: null,
        areaSize: null,
        areaTemp: null,
        areaHumidity: null,
        warnTemp: null,
        warnHumidity: null,
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
      this.ids = selection.map(item => item.areaId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加分区";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const areaId = row.areaId || this.ids
      getArea(areaId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改分区";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.storeName = this.$refs.storeSelection.selectedLabel;;
          if (this.form.areaId != null) {
            updateArea(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addArea(this.form).then(response => {
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
      const areaIds = row.areaId || this.ids;
      this.$modal.confirm('是否确认删除分区编号为"' + areaIds + '"的数据项？').then(function() {
        return delArea(areaIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/area/export', {
        ...this.queryParams
      }, `area_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
