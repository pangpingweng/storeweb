<template>
  <div class="app-container">

      <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column label="出入库编号" align="center" prop="stockId" />
      <el-table-column label="货物名称" align="center" prop="goodsName"/>
      <el-table-column label="货物数量" align="center" prop="goodsNum" />
      <el-table-column label="货物类型" align="center" prop="goodsType"/>
      <el-table-column label="货物供货商/经销商" align="center" prop="goods_username"/>
        <el-table-column label="出入库类型" align="center" prop="stockType">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_stock_type" :value="scope.row.goods_stocktype"/>
          </template>
        </el-table-column>
      <el-table-column label="存放仓库" align="center" prop="goods_storename"/>

      <el-table-column label="货物存放区域" align="center" prop="goods_area"/>
        <el-table-column label="审核状态" align="center" prop="goods_status">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_stock_status" :value="scope.row.goods_status"/>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" align="center" prop="createTime" width="180" >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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

    <!-- 添加或修改出入库明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label-width="100px"label="出入库编号" prop="stockId">
        <el-select v-model="form.stockId" placeholder="请选择出入库编号" ref="stockSelection" :prop="form.stockId ? 'stockId' : ''" :disabled="!!form.stockId">
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

        <el-form-item label-width="100px" label="出入库数量" prop="goodsNum" :disabled="form.goods_stocktype !== undefined">
          <el-input v-model="form.goodsNum" :value="form.goodsNum" />
        </el-form-item>

        <el-form-item label-width="100px" label="所属仓库" prop="goods_storeid" >
          <el-select v-model="form.storeId" placeholder="请选择所属仓库" ref="storeSelection" :value="form.goods_storename">
            <el-option
              v-for="item in storeList"
              :key="item.storeName"
              :label="item.storeName"
              :value="item.storeId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="所属分区" prop="goods_areaid">
          <el-select v-model="form.goods_areaid" placeholder="请选择所属分区" ref="areaSelection" :value="form.areaname">
            <el-option
              v-if="item.storeId == form.storeId"
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

        <el-form-item label-width="100px" label="订单类型" :prop="goods_stocktype" :disabled="form.goods_stocktype !== undefined">
          <el-select v-model="form.goods_stocktype" placeholder="请输入订单类型" ref="goods_stocktypeSelection">
            <el-option label="选择全部" value="">
            </el-option>
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


        <el-form-item label-width="100px" label="所属经销商" prop="goods_userid" v-if="roles[0] != 'jingxiaoshang' && form.goods_stocktype == '出库'" >
          <el-select v-model="form.goods_userid" placeholder="请选择经销商" ref="userSelection" :value="form.goods_userid" :disabled="!!form.goods_userid">
            <el-option
              v-if="item.roleName == '经销商'"
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label-width="100px" label="所属供货商" prop="goods_userid" v-if="form.goods_stocktype == '入库'">
          <el-select v-model="form.goods_userid" placeholder="请选择供货商" ref="supplierSelection" :value="form.goods_userid" :disabled="!!form.goods_userid">
            <el-option
              v-for="item in supplierList"
              :key="item.supplierId"
              :label="item.supplierName"
              :value="item.supplierId"
            ></el-option>
          </el-select>
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
      // 出入库明细表格数据
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
        goods_status:null,
        goods_storename:null,
        sotreId:null,
        goods_area:null,
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
    const stockId = this.$route.params && this.$route.params.stockName;
    this.getList(stockId);
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
    /** 查询出入库明细列表 */
    getList(stockId) {
      this.loading = true;
      this.queryParams.stockId = stockId;
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

      this.form = response.data;
      this.open = true;
      this.title = "修改出入库明细";
      this.title = "添加出入库明细";
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
            this.form.goods_storeid = this.form.storeId;
            console.log(123);
            console.log(this.form.storeId);
            console.log(this.form);
            updateDetail(this.form).then(response => {
              this.open = false;
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
