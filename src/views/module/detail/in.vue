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


      <el-form-item label-width="100px" label="供货商" prop="goods_username">
        <el-input
          v-model="queryParams.goods_username"
          placeholder="请输入供货商"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label-width="100px" label="入库时间">
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
      <el-form-item label-width="100px" label="审核状态" prop="goods_status">
        <el-select v-model="queryParams.goods_status" placeholder="请选择订单状态">
          <el-option label="显示全部" value=""></el-option>
          <el-option label="待审核" value="待审核"></el-option>
          <el-option label="审核通过" value="审核通过"></el-option>
          <el-option label="审核未通过" value="审核未通过"></el-option>
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
          v-hasPermi="['module:detail:add']"
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
          v-hasPermi="['module:detail:edit']"
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
          v-hasPermi="['module:detail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:detail:export']"
        >导出</el-button>
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

      <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="入库编号" align="center" prop="stockId" v-if="columns[0].visible"/>
      <el-table-column label="货物名称" align="center" prop="goodsName" v-if="columns[1].visible"/>
      <el-table-column label="货物数量" align="center" prop="goodsNum" v-if="columns[2].visible"/>
      <el-table-column label="货物类型" align="center" prop="goodsType" v-if="columns[3].visible"/>
      <el-table-column label="供货商" align="center" prop="goods_supplier" v-if="columns[4].visible"/>
      <el-table-column label="入库类型" align="center" prop="stockType" v-if="columns[5].visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_stock_type" :value="scope.row.goods_stocktype"/>
        </template>
      </el-table-column>
      <el-table-column label="存放仓库" align="center" prop="goods_storename" v-if="columns[6].visible"/>

      <el-table-column label="货物存放区域" align="center" prop="goods_area" v-if="columns[7].visible"/>
        <el-table-column label="审核状态" align="center" prop="goods_status" v-if="columns[8].visible">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_stock_status" :value="scope.row.goods_status"/>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" align="center" prop="createTime" width="180" v-if="columns[9].visible">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>

      <el-table-column label="预计最大保存时间" align="center" prop="goods_storetime" v-if="columns[10].visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.goods_storetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:stock:edit']"
            :disabled="scope.row.goods_status === '审核通过' || scope.row.goods_status === '审核未通过'"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:stock:remove']"
            :disabled="scope.row.goods_status === '审核通过' || scope.row.goods_status === '审核未通过'"
          >删除
          </el-button>
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

    <!-- 添加或修改入库明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label-width="100px"label="入库编号" prop="stockId">
        <el-select v-model="form.stockId" placeholder="请选择入库编号" ref="stockSelection" :prop="form.stockId ? 'stockId' : ''" :disabled="!!form.stockId">
            <el-option
                    v-for="item in stockList"
                    v-if="item.stockStatus == '待审核' && item.stockType == '入库'"
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

        <el-form-item label-width="100px" label="入库数量" prop="goodsNum" >
          <el-input v-model="form.goodsNum" :value="form.goodsNum" />
        </el-form-item>

        <el-form-item label-width="100px" label="所属仓库" prop="goods_storeid" >
          <el-select v-model="form.goods_storeid" placeholder="请选择所属仓库" ref="storeSelection"  >
            <el-option
              v-for="item in storeList"
              :key="item.storeName"
              :label="item.storeName"
              :value="item.storeId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="所属分区" prop="goods_areaid">
          <el-select v-model="form.goods_areaid" placeholder="请选择所属分区" ref="areaSelection">
            <el-option
              v-if="item.storeId == form.goods_storeid"
              v-for="item in areaList"
              :key="item.areaId"
              :label="item.areaName"
              :value="item.areaId"
            ></el-option>
          </el-select>
        </el-form-item>

<!--        <el-form-item label-width="100px" label="所属分区" prop="goods_areaid">-->
<!--          <el-select v-model="form.goods_area" placeholder="请选择所属分区" ref="areaSelection" :value="form.goods_area">-->
<!--            <el-option-->
<!--              v-if="item.storeId == form.storeId"-->
<!--              v-for="item in areaList"-->
<!--              :key="item.areaId"-->
<!--              :label="item.areaName"-->
<!--              :value="item.areaName"-->
<!--            ></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->

        <!--<el-form-item label-width="100px" label="订单类型" :prop="goods_stocktype" :disabled="form.goods_stocktype !== undefined">-->
          <!--<el-select v-model="form.goods_stocktype" placeholder="请输入订单类型" ref="goods_stocktypeSelection">-->
            <!--<el-option label="选择全部" value="">-->
            <!--</el-option>-->
            <!--<el-option label="出库" value="出库"></el-option>-->
            <!--<el-option label="入库" value="入库"></el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->

          <!--<el-form-item label-width="100px" label="入库状态" prop="goods_status">-->
            <!--<el-select v-model="form.goods_status" placeholder="入库状态">-->
              <!--<el-option label="待审核" value="待审核"></el-option>-->
              <!--<el-option label="审核通过" value="审核通过"></el-option>-->
              <!--<el-option label="审核未通过" value="审核未通过"></el-option>-->
            <!--</el-select>-->
          <!--</el-form-item>-->



        <!--<el-form-item label-width="100px" label="所属经销商" prop="goods_userid" v-if="roles[0] != 'jingxiaoshang' && form.goods_stocktype == '出库'" >-->
          <!--<el-select v-model="form.goods_userid" placeholder="请选择经销商" ref="userSelection" :value="form.goods_userid" :disabled="!!form.goods_userid">-->
            <!--<el-option-->
              <!--v-if="item.roleName == '经销商'"-->
              <!--v-for="item in userList"-->
              <!--:key="item.userId"-->
              <!--:label="item.nickName"-->
              <!--:value="item.userId"-->
            <!--&gt;</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->

        <!--<el-form-item label-width="100px" label="所属供货商" prop="goods_userid" v-if="form.goods_stocktype == '入库'">-->
          <!--<el-select v-model="form.goods_userid" placeholder="请选择供货商" ref="supplierSelection" :value="form.goods_userid" :disabled="!!form.goods_userid">-->
            <!--<el-option-->
              <!--v-for="item in supplierList"-->
              <!--:key="item.supplierId"-->
              <!--:label="item.supplierName"-->
              <!--:value="item.supplierId"-->
            <!--&gt;</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->

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
        getgoodsList,getuserList,
  getstockList,gettypeList,
    listDetail, getDetail, delDetail, addDetail, updateDetail,getareaList,getstoreList,getsupplierList
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
      // 入库明细表格数据
      detailList: [],
      goodsList: [],
      stockList: [],
      supplierList:[],
      typeList:[],
      userList: [],
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
        goods_status:'待审核',
        goods_storename:null,
        sotreId:null,
        goods_area:null,
      },
      columns: [
        { key: 0, label: `入库编号`, visible: true },
        { key: 1, label: `货物名称`, visible: true },
        { key: 2, label: `货物数量`, visible: true },
        { key: 3, label: `货物类型`, visible: true },
        { key: 4, label: `供货商`, visible: true },
        { key: 5, label: `入库类型`, visible: true },
        { key: 6, label: `存放仓库`, visible: true },
        { key: 7, label: `货物存放区域`, visible: true },
        { key: 8, label: `审核状态`, visible: true },
        { key: 9, label: `创建时间`, visible: true },
        { key: 10, label: `预计最大保存时间`, visible: true }
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        stockId: [
          { required: true, message: "入库不能为空", trigger: "blur" }
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
    this.getuserInfo();
    this.getsupplierInfo();
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
    getuserInfo() {
      getuserList({}).then(response => {
        this.userList = response.data
      })
    },
    getstockInfo(){
      getstockList({}).then(response => {
            this.stockList = response.data;
        });
    },
    getsupplierInfo() {
      getsupplierList({}).then(response => {
        this.supplierList = response.data
      })
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
    /** 查询入库明细列表 */
    getList() {
      this.loading = true;
      this.queryParams.goods_stocktype = '入库';
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
        remark: null,
        goods_areaid:null
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
      this.title = "添加入库明细";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const detailId = row.detailId || this.ids

      getDetail(detailId).then(response => {
        this.form = response.data;
        this.form.goods_storename=row.goods_storename;
        this.form.goods_username = row.goods_username; // 将默认值赋值给表单参数
        this.form.goods_userid =row.goods_userid;
        this.form.areaname =row.goods_area
        this.form.goods_stocktype=row.goods_stocktype;
        this.queryParams.goods_status=row.goods_status;
        this.open = true;
        this.title = "修改入库明细";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          //this.form.stockName = this.$refs.stockSelection.selectedLabel;;
          //this.form.goodsName = this.$refs.goodsSelection.selectedLabel;;
          this.form.goods_stocktype = '入库';
          let that = this;
          this.stockList.forEach(stock=>{
            if(stock.stockName == that.form.stockId){
              that.form.goods_userid = stock.userId;
              that.form.goods_username = stock.userName;
              that.form.goods_supplier = stock.userName;
            }
          })
          if (this.form.detailId != null) {
            updateDetail(this.form).then(response => {
              this.open = false;
              this.title = "修改入库明细";
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
      this.$modal.confirm('是否确认删除入库明细编号为"' + detailIds + '"的数据项？').then(function() {
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
