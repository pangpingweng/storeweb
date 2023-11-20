<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="100px" label="货物名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入货物名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="订单编号" prop="stockId">
        <el-input
          v-model="queryParams.stockId"
          placeholder="请输入订单编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="订单类型" prop="goods_stocktype">
        <el-select v-model="queryParams.goods_stocktype" placeholder="请选择订单类型">
          <el-option label="选择全部" value=""></el-option>
          <el-option label="出库" value="出库"></el-option>
          <el-option label="入库" value="入库"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label-width="100px" label="经销商" prop="goods_username">
        <el-input
          v-model="queryParams.goods_username"
          placeholder="请输入经销商"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="出入库时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label-width="90px">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>




      <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <!--<el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="出入库编号" align="center" prop="stockId" />
      <el-table-column label="货物名称" align="center" prop="goodsName" />
      <el-table-column label="货物数量" align="center" prop="goodsNum" />
      <el-table-column label="货物类型" align="center" prop="goodsType" />
        <el-table-column label="经销商" align="center" prop="goods_username"/>
        <el-table-column label="供应商" align="center" prop="goods_supplier"/>
        <el-table-column label="出入库类型" align="center" prop="stockType">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_stock_type" :value="scope.row.goods_stocktype"/>
          </template>
        </el-table-column>
      <el-table-column label="存放仓库" align="center" prop="goods_storename" />
      <el-table-column label="货物存放区域" align="center" prop="goods_area" />

        <el-table-column label="出入库状态" align="center" prop="stockStatus">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_stock_status" :value="scope.row.goods_status"/>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>

      <el-table-column label="预计最大保存时间" align="center" prop="goods_storetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.goods_storetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
        <!--<template slot-scope="scope">-->
          <!--<el-button-->
            <!--size="mini"-->
            <!--type="text"-->
            <!--icon="el-icon-edit"-->
            <!--@click="handleUpdate(scope.row)"-->
            <!--v-hasPermi="['module:detail:edit']"-->
          <!--&gt;修改</el-button>-->
          <!--<el-button-->
            <!--size="mini"-->
            <!--type="text"-->
            <!--icon="el-icon-delete"-->
            <!--@click="handleDelete(scope.row)"-->
            <!--v-hasPermi="['module:detail:remove']"-->
          <!--&gt;删除</el-button>-->
        <!--</template>-->
      <!--</el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改出入库明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label-width="100px"label="出入库编号" prop="stockId">
        <el-select v-model="form.stockId" placeholder="请选择出入库编号" ref="stockSelection" disabled>
            <el-option
                    v-for="item in stockList"
                    :key="item.stockName"
                    :label="item.stockName"
                    :value="item.stockName"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="100px" label="货物分类" prop="goodsType">
          <el-select v-model="form.goodsType" placeholder="请选择货物类型" ref="gtypeSelection">
            <el-option
              v-for="item in typeList"
              :key="item.gtypeName"
              :label="item.gtypeName"
              :value="item.gtypeName"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="货物名称" prop="goodsName">
          <el-input v-model="form.goodsName" :value="form.goodsName" />
        </el-form-item>

        <el-form-item label-width="100px" label="出入库数量" prop="goodsNum">
          <el-input v-model="form.goodsNum" :value="form.goodsNum" />
        </el-form-item>

        <el-form-item label-width="100px" label="所属仓库" prop="goods_storeid" >
          <el-select v-model="form.storeId" placeholder="请选择所属仓库" ref="storeSelection" :value="form.storeId">
            <el-option
              v-for="item in storeList"
              :key="item.storeId"
              :label="item.storeName"
              :value="item.storeId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="所属仓库" prop="goods_storename" >
          <el-select v-model="form.goods_storename" placeholder="请选择所属仓库" ref="storeSelection" :value="form.goods_storename">
            <el-option
              v-if="item.storeId == form.storeId"
              v-for="item in storeList"
              :key="item.areaName"
              :label="item.storeName"
              :value="item.goods_storename"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="所属分区" prop="goods_areaid">
          <el-select v-model="form.areaname" placeholder="请选择所属分区" ref="areaSelection">
            <el-option
              v-if="item.storeId == form.storeId"
              v-for="item in areaList"
              :key="item.areaName"
              :label="item.areaName"
              :value="item.areaName"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="订单类型" prop="goods_stocktype">
          <el-select v-model="form.goods_stocktype" placeholder="请输入订单类型" ref="goods_stocktypeSelection" disabled>
            <el-option label="选择全部" value=""></el-option>
            <el-option label="出库" value="出库"></el-option>
            <el-option label="入库" value="入库"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="订单类型" prop="goods_stocktype">
          <el-select v-model="form.goods_stocktype" placeholder="请输入订单类型" ref="goods_stocktypeSelection" disabled>
            <el-option label="选择全部" value=""></el-option>
            <el-option label="出库" value="出库"></el-option>
            <el-option label="入库" value="入库"></el-option>
          </el-select>
        </el-form-item>

        <el-table-column label="出入库状态" align="center" prop="goods_status">
          <el-form-item label-width="90px" label="出入库状态" prop="goods_status">
            <el-select v-model="form.goods_status" placeholder="出入库状态">
              <el-option label="待审核" value="待审核"></el-option>
              <el-option label="审核通过" value="审核通过"></el-option>
              <el-option label="审核未通过" value="审核未通过"></el-option>
            </el-select>
          </el-form-item>
        </el-table-column>


        <el-form-item label-width="100px" label="经销商/供货商" prop="goods_username">
          <el-input v-model="form.goods_username" :value="form.goods_username" />
        </el-form-item>

        <el-form-item label-width="100px" label="经销商/供货商id" prop="goods_userid" style="display:none;">
          <el-input v-model="form.goods_userid" :value="form.goods_userid" />
        </el-form-item>

        <el-form-item label-width="100px" label="存放时间" prop="goods_storetime">
          <el-date-picker clearable size="small"
                          v-model="form.goods_storetime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="存放时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label-width="100px"label="备注" prop="remark">
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
        getgoodsList,
  getstockList,gettypeList,
    listDetail, getDetail, delDetail, addDetail, updateDetail,getareaList,getstoreList
} from "@/api/module/detail";
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: "Detail",
  dicts: ['sys_stock_type', 'sys_stock_status'],
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
      // 日期范围
      dateRange: [],
      // 出入库明细表格数据
      detailList: [],
      goodsList: [],
      stockList: [],
      typeList:[],
      areaList:[],
      storeList:[],
      selectedStoreId: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
        stockId:null,
        goods_stocktype:null,
        goods_username:null,
        goods_status:null,
        goods_storename:null,
        sotreId:null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        stockId: [
          { required: true, message: "出入库不能为空", trigger: "blur" }
        ],
        goodsId: [
          { required: true, message: "货物名称不能为空", trigger: "blur" }
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
    //this.getgoodsInfo();
    this.getstockInfo();
    this.gettypeInfo();
    this.getstoreInfo();
    this.getareaInfo();
  },

  methods: {
    getgoodsInfo(){
        getgoodsList({}).then(response => {
            this.goodsList = response.data;
        });
    },
    getstockInfo(){
      getstockList({}).then(response => {
            this.stockList = response.data;
        });
    },
    gettypeInfo(){
      gettypeList({}).then(response => {
        this.typeList = response.data;
      });
    },
    getareaInfo() {
      getareaList({}).then(response => {
        this.areaList = response.data
      })
    },
    getstoreInfo() {
      getstoreList({}).then(response => {
        this.storeList = response.data
      })
    },
    /** 查询出入库明细列表 */
    getList() {
      this.loading = true;
      if(this.roles[0] == 'cangguan'){
        this.queryParams.manager_id = this.name.userId;
      }
      listDetail(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.detailList = response.rows;
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
        detailId: null,
        stockId: null,
        goodsId: null,
        goodsName: null,
        goodsNum: null,
        goodsType: null,
        createTime: null,
        storetime:null,
        goods_storeid:null,
        store_check:null,
        areaname:null,
        goods_storetime:null,
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
      this.ids = selection.map(item => item.detailId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加出入库明细";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const detailId = row.detailId || this.ids
      getDetail(detailId).then(response => {
        this.form = response.data;
        this.form.goods_username = row.goods_username; // 将默认值赋值给表单参数
        this.form.goods_userid =row.goods_userid;
        this.form.goods_stocktype=row.goods_stocktype;
        this.queryParams.goods_status=row.goods_status;
        this.open = true;
        this.title = "修改出入库明细";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
//this.form.stockName = this.$refs.stockSelection.selectedLabel;;
//this.form.goodsName = this.$refs.goodsSelection.selectedLabel;;
          if (this.form.detailId != null) {
            this.form.goods_storeid = this.form.storeId
            console.log(123);
            console.log(this.form.storeId);
            console.log(this.form);
            updateDetail(this.form).then(response => {
              this.open = false;
              this.open = true;
              this.title = "修改出入库明细";
              this.getList();
              this.$modal.msgSuccess("修改成功");
            });
          } else {
              addDetail(this.form).then(response => {
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
      const detailIds = row.detailId || this.ids;
      this.$modal.confirm('是否确认删除出入库明细编号为"' + detailIds + '"的数据项？').then(function() {
        return delDetail(detailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
